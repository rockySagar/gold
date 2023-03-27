/**
 * name : account.js
 * author : Rakesh Kumar
 * created-date : 03-Nov-2021
 * Description : account helper.
 */

// Dependencies
const bcryptJs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const ObjectId = require('mongoose').Types.ObjectId

const utilsHelper = require('@generics/utils')
const httpStatusCode = require('@generics/http-status')
const apiResponses = require('@constants/api-responses')
const common = require('@constants/common')
const usersData = require('@db/users/queries')
const notificationTemplateData = require('@db/notification-template/query')
const kafkaCommunication = require('@generics/kafka-communication')
const redisCommunication = require('@generics/redis-communication')
const systemUserData = require('@db/systemUsers/queries')
const FILESTREAM = require('@generics/file-stream')

const organisationData = require('@db/organisation/queries')

module.exports = class AccountHelper {
	/**
	 * create account
	 * @method
	 * @name create
	 * @param {Object} bodyData -request body contains user creation deatils.
	 * @param {String} bodyData.secretCode - secrate code to create mentor.
	 * @param {String} bodyData.name - name of the user.
	 * @param {Boolean} bodyData.isAMentor - is a mentor or not .
	 * @param {String} bodyData.email - user email.
	 * @param {String} bodyData.password - user password.
	 * @returns {JSON} - returns account creation details.
	 */

	static async create(bodyData) {
		const projection = {
			password: 0,
			refreshTokens: 0,
			'designation.deleted': 0,
			'designation._id': 0,
			'areasOfExpertise.deleted': 0,
			'areasOfExpertise._id': 0,
			'location.deleted': 0,
			'location._id': 0,
			otpInfo: 0,
		}
		try {
			const mobile = bodyData.mobile
			const organisationId = bodyData.organisationId

			let user = await usersData.findOne({
				'mobile.number': mobile,
				organisationId: organisationId,
			})
			if (user) {
				// const redisData = await redisCommunication.getKey(mobile)
				// if (!redisData || redisData.otp != bodyData.otp) {
				// 	return common.failureResponse({
				// 		message: apiResponses.OTP_INVALID,
				// 		statusCode: httpStatusCode.bad_request,
				// 		responseCode: 'CLIENT_ERROR',
				// 	})
				// }

				return common.failureResponse({
					message: apiResponses.USER_ALREADY_EXISTS,
					statusCode: httpStatusCode.not_acceptable,
					responseCode: 'CLIENT_ERROR',
				})
			} else {
				let orgInfo = await organisationData.findOne({
					_id: organisationId,
				})
				console.log('orgInfo', orgInfo)

				if (orgInfo) {
					bodyData['password'] ="a,8y234982y34sjdbkjasnd###@!1`203994u0";

					bodyData.password = utilsHelper.hashPassword(bodyData.password)
					bodyData.mobile = {
						number: mobile,
						verified: false,
					}
					await usersData.createUser(bodyData)
				} else {
					console.log('orgInfo-------------')

					return common.failureResponse({
						message: apiResponses.ORGANISATION_NOT_FOUND,
						statusCode: httpStatusCode.not_acceptable,
						responseCode: 'CLIENT_ERROR',
					})
				}
			}

			/* FLOW STARTED: user login after registration */

			user = await usersData.findOne(
				{
					'mobile.number': mobile,
				},
				projection
			)

			const tokenDetail = {
				data: {
					_id: user._id,
					mobile: user.mobile.number,
					// name: user.name,
					// isAMentor: user.isAMentor,
				},
			}

			const accessToken = utilsHelper.generateToken(
				tokenDetail,
				process.env.ACCESS_TOKEN_SECRET,
				common.accessTokenExpiry
			)
			const refreshToken = utilsHelper.generateToken(
				tokenDetail,
				process.env.REFRESH_TOKEN_SECRET,
				common.refreshTokenExpiry
			)

			const update = {
				$push: {
					refreshTokens: {
						token: refreshToken,
						exp: new Date().getTime() + common.refreshTokenExpiryInMs,
					},
				},
				lastLoggedInAt: new Date().getTime(),
			}
			await usersData.updateOneUser(
				{
					_id: ObjectId(user._id),
				},
				update
			)

			const deleteData = await redisCommunication.deleteKey(mobile)

			const result = {
				access_token: accessToken,
				refresh_token: refreshToken,
				user,
			}

			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: apiResponses.USER_CREATED_SUCCESSFULLY,
				result,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * login user account
	 * @method
	 * @name login
	 * @param {Object} bodyData -request body contains user login deatils.
	 * @param {String} bodyData.mobile - user mobile.
	 * @param {String} bodyData.password - user password.
	 * @returns {JSON} - returns susccess or failure of login details.
	 */

	static async login(bodyData) {
		const projection = {
			refreshTokens: 0,
			'designation.deleted': 0,
			'designation._id': 0,
			'areasOfExpertise.deleted': 0,
			'areasOfExpertise._id': 0,
			'location.deleted': 0,
			'location._id': 0,
			otpInfo: 0,
		}
		try {
			let user = await usersData.findOne(
				{
					'mobile.number': bodyData.mobile,
				},
				projection
			)
			if (!user) {
				return common.failureResponse({
					message: apiResponses.EMAIL_ID_NOT_REGISTERED,
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			// const redisData = await redisCommunication.getKey(mobile)
			// 	if (!redisData || redisData.otp != bodyData.otp) {
			// 		return common.failureResponse({
			// 			message: apiResponses.OTP_INVALID,
			// 			statusCode: httpStatusCode.bad_request,
			// 			responseCode: 'CLIENT_ERROR',
			// 		})
			// }

			// const isPasswordCorrect = bcryptJs.compareSync(bodyData.password, user.password)
			// if (!isPasswordCorrect) {
			// 	return common.failureResponse({
			// 		message: apiResponses.USERNAME_OR_PASSWORD_IS_INVALID,
			// 		statusCode: httpStatusCode.bad_request,
			// 		responseCode: 'CLIENT_ERROR',
			// 	})
			// }

			const tokenDetail = {
				data: {
					_id: user._id,
					mobile: user.mobile.number,
					// name: user.name,
					// isAMentor: user.isAMentor,
				},
			}

			const accessToken = utilsHelper.generateToken(
				tokenDetail,
				process.env.ACCESS_TOKEN_SECRET,
				common.accessTokenExpiry
			)
			const refreshToken = utilsHelper.generateToken(
				tokenDetail,
				process.env.REFRESH_TOKEN_SECRET,
				common.refreshTokenExpiry
			)

			const update = {
				$push: {
					refreshTokens: {
						token: refreshToken,
						exp: new Date().getTime() + common.refreshTokenExpiryInMs,
					},
				},
				lastLoggedInAt: new Date().getTime(),
			}
			await usersData.updateOneUser(
				{
					_id: ObjectId(user._id),
				},
				update
			)

			/* Mongoose schema is in strict mode, so can not delete password directly */
			user = {
				...user._doc,
			}
			delete user.password
			const result = {
				access_token: accessToken,
				refresh_token: refreshToken,
				user,
			}

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: apiResponses.LOGGED_IN_SUCCESSFULLY,
				result,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * logout user account
	 * @method
	 * @name logout
	 * @param {Object} req -request data.
	 * @param {string} bodyData.loggedInId - user id.
	 * @param {string} bodyData.refreshToken - refresh token.
	 * @returns {JSON} - returns accounts loggedout information.
	 */

	static async logout(bodyData) {
		try {
			const user = await usersData.findOne({
				_id: ObjectId(bodyData.loggedInId),
			})
			if (!user) {
				return common.failureResponse({
					message: apiResponses.USER_DOESNOT_EXISTS,
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const update = {
				$pull: {
					refreshTokens: {
						token: bodyData.refreshToken,
					},
				},
			}
			/* Destroy refresh token for user */
			const res = await usersData.updateOneUser(
				{
					_id: ObjectId(user._id),
				},
				update
			)

			/* If user doc not updated because of stored token does not matched with bodyData.refreshToken */
			if (!res) {
				return common.failureResponse({
					message: apiResponses.INVALID_REFRESH_TOKEN,
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: apiResponses.LOGGED_OUT_SUCCESSFULLY,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * generate token
	 * @method
	 * @name generateToken
	 * @param {Object} bodyData -request data.
	 * @param {string} bodyData.refreshToken - refresh token.
	 * @returns {JSON} - returns access token info
	 */

	static async generateToken(bodyData) {
		let decodedToken
		try {
			decodedToken = jwt.verify(bodyData.refreshToken, process.env.REFRESH_TOKEN_SECRET)
		} catch (error) {
			/* If refresh token is expired */
			error.statusCode = httpStatusCode.unauthorized
			error.message = apiResponses.REFRESH_TOKEN_EXPIRED
			throw error
		}

		const user = await usersData.findOne({
			_id: ObjectId(decodedToken.data._id),
		})

		/* Check valid user */
		if (!user) {
			return common.failureResponse({
				message: apiResponses.USER_DOESNOT_EXISTS,
				statusCode: httpStatusCode.bad_request,
				responseCode: 'CLIENT_ERROR',
			})
		}

		/* Check valid refresh token stored in db */
		if (user.refreshTokens.length) {
			const token = user.refreshTokens.find((tokenData) => tokenData.token === bodyData.refreshToken)
			if (!token) {
				return common.failureResponse({
					message: apiResponses.REFRESH_TOKEN_NOT_FOUND,
					statusCode: httpStatusCode.internal_server_error,
					responseCode: 'CLIENT_ERROR',
				})
			}

			/* Generate new access token */
			const accessToken = utilsHelper.generateToken(
				{
					data: decodedToken.data,
				},
				process.env.ACCESS_TOKEN_SECRET,
				common.accessTokenExpiry
			)

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: apiResponses.ACCESS_TOKEN_GENERATED_SUCCESSFULLY,
				result: {
					access_token: accessToken,
				},
			})
		}
		return common.failureResponse({
			message: apiResponses.REFRESH_TOKEN_NOT_FOUND,
			statusCode: httpStatusCode.bad_request,
			responseCode: 'CLIENT_ERROR',
		})
	}

	/**
	 * generate otp
	 * @method
	 * @name generateOtp
	 * @param {Object} bodyData -request data.
	 * @param {string} bodyData.email - user email.
	 * @param {string} bodyData.password - user email.
	 * @returns {JSON} - returns otp success response
	 */

	static async generateOtp(bodyData) {
		try {
			let otp
			let isValidOtpExist = true
			const user = await usersData.findOne({
				'mobile.number': bodyData.mobile,
			})
			if (!user) {
				return common.failureResponse({
					message: apiResponses.USER_DOESNOT_EXISTS,
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const userData = await redisCommunication.getKey(bodyData.mobile)

			if (userData && userData.action === 'forgetpassword') {
				otp = userData.otp // If valid then get previuosly generated otp
			} else {
				isValidOtpExist = false
			}

			const isPasswordCorrect = bcryptJs.compareSync(bodyData.password, user.password)
			if (isPasswordCorrect) {
				return common.failureResponse({
					message: apiResponses.RESET_PREVIOUS_PASSWORD,
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			if (!isValidOtpExist) {
				otp = Math.floor(Math.random() * 900000 + 100000) // 6 digit otp
				const redisData = {
					verify: bodyData.mobile,
					action: 'forgetpassword',
					otp,
				}
				const res = await redisCommunication.setKey(bodyData.mobile, redisData, common.otpExpirationTime)
				if (res !== 'OK') {
					return common.failureResponse({
						message: apiResponses.UNABLE_TO_SEND_OTP,
						statusCode: httpStatusCode.internal_server_error,
						responseCode: 'SERVER_ERROR',
					})
				}
			}

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: apiResponses.OTP_SENT_SUCCESSFULLY,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * otp to verify user during registration
	 * @method
	 * @name registrationOtp
	 * @param {Object} bodyData -request data.
	 * @param {string} bodyData.email - user email.
	 * @returns {JSON} - returns otp success response
	 */

	static async registrationOtp(bodyData) {
		try {
			let otp
			let isValidOtpExist = true
			// const user = await usersData.findOne({ 'mobile.number': bodyData.mobile })
			// if (user) {
			// 	return common.failureResponse({
			// 		message: apiResponses.USER_ALREADY_EXISTS,
			// 		statusCode: httpStatusCode.bad_request,
			// 		responseCode: 'CLIENT_ERROR',
			// 	})
			// }

			// const userData = await redisCommunication.getKey(bodyData.mobile)

			// if (userData && userData.action === 'signup') {
			// 	otp = userData.otp // If valid then get previuosly generated otp
			// } else {
			// 	isValidOtpExist = false
			// }

			// if (!isValidOtpExist) {
			otp = '121212' // 6 digit otp
			// otp = Math.floor(Math.random() * 900000 + 100000) // 6 digit otp
			const redisData = {
				verify: bodyData.mobile,
				action: 'signup',
				otp,
			}
			const res = await redisCommunication.setKey(bodyData.mobile, redisData, common.otpExpirationTime)
			if (res !== 'OK') {
				return common.failureResponse({
					message: apiResponses.UNABLE_TO_SEND_OTP,
					statusCode: httpStatusCode.internal_server_error,
					responseCode: 'SERVER_ERROR',
				})
			}
			// }

			console.log(otp)
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: apiResponses.REGISTRATION_OTP_SENT_SUCCESSFULLY,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Reset password
	 * @method
	 * @name resetPassword
	 * @param {Object} req -request data.
	 * @param {string} bodyData.email - user email.
	 * @param {string} bodyData.otp - user otp.
	 * @param {string} bodyData.password - user password.
	 * @returns {JSON} - returns password reset response
	 */

	static async resetPassword(bodyData) {
		const projection = {
			refreshTokens: 0,
			'designation.deleted': 0,
			'designation._id': 0,
			'areasOfExpertise.deleted': 0,
			'areasOfExpertise._id': 0,
			'location.deleted': 0,
			'location._id': 0,
		}
		try {
			let user = await usersData.findOne(
				{
					'mobile.number': bodyData.mobile,
				},
				projection
			)
			if (!user) {
				return common.failureResponse({
					message: apiResponses.USER_DOESNOT_EXISTS,
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const redisData = await redisCommunication.getKey(bodyData.mobile)
			if (!redisData || redisData.otp != bodyData.otp) {
				return common.failureResponse({
					message: apiResponses.RESET_OTP_INVALID,
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			const isPasswordCorrect = bcryptJs.compareSync(bodyData.password, user.password)
			if (isPasswordCorrect) {
				return common.failureResponse({
					message: apiResponses.RESET_PREVIOUS_PASSWORD,
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const salt = bcryptJs.genSaltSync(10)
			bodyData.password = bcryptJs.hashSync(bodyData.password, salt)

			const tokenDetail = {
				data: {
					_id: user._id,
					mobile: user.mobile.number,
					name: user.name,
					isAMentor: user.isAMentor,
				},
			}

			const accessToken = utilsHelper.generateToken(tokenDetail, process.env.ACCESS_TOKEN_SECRET, '1d')
			const refreshToken = utilsHelper.generateToken(tokenDetail, process.env.REFRESH_TOKEN_SECRET, '183d')

			const updateParams = {
				$push: {
					refreshTokens: {
						token: refreshToken,
						exp: new Date().getTime() + common.refreshTokenExpiryInMs,
					},
				},
				lastLoggedInAt: new Date().getTime(),
				password: bodyData.password,
			}
			await usersData.updateOneUser(
				{
					_id: user._id,
				},
				updateParams
			)

			const deleteData = await redisCommunication.deleteKey(bodyData.mobile)

			/* Mongoose schema is in strict mode, so can not delete otpInfo directly */
			delete user._doc.password
			user = {
				...user._doc,
			}
			delete user.otpInfo

			const result = {
				access_token: accessToken,
				refresh_token: refreshToken,
				user,
			}

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: apiResponses.PASSWORD_RESET_SUCCESSFULLY,
				result,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Bulk create mentors
	 * @method
	 * @name bulkCreateMentors
	 * @param {Array} mentors - mentor details.
	 * @param {Object} tokenInformation - token details.
	 * @returns {CSV} - created mentors.
	 */
	static async bulkCreateMentors(mentors, tokenInformation) {
		return new Promise(async (resolve, reject) => {
			try {
				const systemUser = await systemUserData.findUsersByEmail(tokenInformation.mobile)

				if (!systemUser) {
					return common.failureResponse({
						message: apiResponses.USER_DOESNOT_EXISTS,
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				}

				if (systemUser.role.toLowerCase() !== 'admin') {
					return common.failureResponse({
						message: apiResponses.NOT_AN_ADMIN,
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				}

				const fileName = `mentors-creation`
				let fileStream = new FILESTREAM(fileName)
				let input = fileStream.initStream()

				;(async function () {
					await fileStream.getProcessorPromise()
					return resolve({
						isResponseAStream: true,
						fileNameWithPath: fileStream.fileNameWithPath(),
					})
				})()

				for (const mentor of mentors) {
					mentor.isAMentor = true
					const data = await this.create(mentor)
					mentor.mobile = mentor.mobile.number
					mentor.status = data.message
					input.push(mentor)
				}

				input.push(null)
			} catch (error) {
				throw error
			}
		})
	}

	/**
	 * Verify the mentor or not
	 * @method
	 * @name verifyMentor
	 * @param {Object} userId - userId.
	 * @returns {JSON} - verifies user is mentor or not
	 */
	static async verifyMentor(userId) {
		try {
			let user = await usersData.findOne(
				{
					_id: userId,
				},
				{
					isAMentor: 1,
				}
			)
			if (!user) {
				return common.failureResponse({
					message: apiResponses.USER_DOESNOT_EXISTS,
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			} else if (user.isAMentor == true) {
				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: apiResponses.USER_IS_A_MENTOR,
					result: user,
				})
			} else {
				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: apiResponses.USER_IS_NOT_A_MENTOR,
					result: user,
				})
			}
		} catch (error) {
			throw error
		}
	}

	/**
	 * Verify user is mentor or not
	 * @method
	 * @name verifyUser
	 * @param {Object} userId - userId.
	 * @returns {JSON} - verifies user is mentor or not
	 */
	static async verifyUser(userId) {
		try {
			let user = await usersData.findOne(
				{
					_id: userId,
				},
				{
					isAMentor: 1,
				}
			)
			if (!user) {
				return common.failureResponse({
					message: apiResponses.USER_DOESNOT_EXISTS,
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			} else if (user.isAMentor == true) {
				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: apiResponses.USER_IS_A_MENTOR,
					result: user,
				})
			} else {
				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: apiResponses.USER_IS_NOT_A_MENTOR,
					result: user,
				})
			}
		} catch (error) {
			throw error
		}
	}

	/**
	 * Account List
	 * @method
	 * @name list method post
	 * @param {Object} req -request data.
	 * @param {Array} userIds -contains userIds.
	 * @returns {JSON} - all accounts data
	 *
	 *
	 * User list.
	 * @method
	 * @name list method get
	 * @param {Boolean} userType - mentor/mentee.
	 * @param {Number} page - page No.
	 * @param {Number} limit - page limit.
	 * @param {String} search - search field.
	 * @returns {JSON} - List of users
	 */
	static async list(page,limit,organisationId,search) {
		try {
			
				const users = await usersData.searchUsers(
					page,limit,search,
					{	
					  	organisationId:ObjectId(organisationId),
					}
				)

				return common.successResponse({
					statusCode: httpStatusCode.ok,
					message: apiResponses.USERS_FETCHED_SUCCESSFULLY,
					result: users,
				})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Accept term and condition
	 * @method
	 * @name acceptTermsAndCondition
	 * @param {string} userId - userId.
	 * @returns {JSON} - returns accept the term success response
	 */
	static async acceptTermsAndCondition(userId) {
		try {
			const user = await usersData.findOne(
				{
					_id: userId,
				},
				{
					_id: 1,
				}
			)

			if (!user) {
				return common.failureResponse({
					message: apiResponses.USER_DOESNOT_EXISTS,
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			await usersData.updateOneUser(
				{
					_id: userId,
				},
				{
					hasAcceptedTAndC: true,
				}
			)

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: apiResponses.USER_UPDATED_SUCCESSFULLY,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * Update role of user
	 * @method
	 * @name changeRole
	 * @param {string} bodyData.email - email of user.
	 * @returns {JSON} change role success response
	 */
	static async changeRole(bodyData) {
		try {
			const update = [
				{
					$set: {
						isAMentor: {
							$not: '$isAMentor',
						},
						refreshTokens: [],
					},
				},
			]

			const res = await usersData.updateOneUser(
				{
					'mobile.number': bodyData.email,
				},
				update
			)

			/* If user doc not updated  */
			if (!res) {
				return common.failureResponse({
					message: apiResponses.USER_DOESNOT_EXISTS,
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: apiResponses.USER_ROLE_UPDATED_SUCCESSFULLY,
			})
		} catch (error) {
			throw error
		}
	}
}
