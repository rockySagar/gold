/**
 * name : middlewares/authenticator
 * author : Rakesh Kumar
 * Date : 21-Oct-2021
 * Description : Validating authorized requests
 */

const jwt = require('jsonwebtoken')

const httpStatusCode = require('@generics/http-status')
const apiResponses = require('@constants/api-responses')
const common = require('@constants/common')
const UsersData = require('@db/users/queries')

module.exports = async function (req, res, next) {
	try {
		let internalAccess = false

		const authHeader = req.get('X-auth-token')

		await Promise.all(
			common.uploadUrls.map(async function (path) {
				if (req.path.includes(path)) {
					if (
						req.headers.internal_access_token &&
						process.env.INTERNAL_ACCESS_TOKEN == req.headers.internal_access_token
					) {
						internalAccess = true
					}
				}
			})
		)

		let guestUrl = false
		common.guestUrls.map(function (path) {
			if (req.path.includes(path)) {
				guestUrl = true
			}
		})

		if ((internalAccess || guestUrl) && !authHeader) {
			next()
			return
		} else if (internalAccess == true) {
			next()
			return
		} else if (!guestUrl && !common.guestUrls.includes(req.url)) {
			const authHeader = req.get('X-auth-token')
			if (!authHeader) {
				throw common.failureResponse({
					message: apiResponses.UNAUTHORIZED_REQUEST,
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}

			// let splittedUrl = req.url.split('/');
			// if (common.uploadUrls.includes(splittedUrl[splittedUrl.length - 1])) {
			//     if (!req.headers.internal_access_token || process.env.INTERNAL_ACCESS_TOKEN !== req.headers.internal_access_token) {
			//         throw common.failureResponse({ message: apiResponses.INCORRECT_INTERNAL_ACCESS_TOKEN, statusCode: httpStatusCode.unauthorized, responseCode: 'UNAUTHORIZED' });
			//     }
			// }

			const authHeaderArray = authHeader.split(' ')
			if (authHeaderArray[0] !== 'bearer') {
				throw common.failureResponse({
					message: apiResponses.UNAUTHORIZED_REQUEST,
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}
			try {
				decodedToken = jwt.verify(authHeaderArray[1], process.env.ACCESS_TOKEN_SECRET)
			} catch (err) {
				err.statusCode = httpStatusCode.unauthorized
				err.responseCode = 'UNAUTHORIZED'
				err.message = apiResponses.ACCESS_TOKEN_EXPIRED
				throw err
			}

			// if (!decodedToken) {
			// 	throw common.failureResponse({
			// 		message: apiResponses.UNAUTHORIZED_REQUEST,
			// 		statusCode: httpStatusCode.unauthorized,
			// 		responseCode: 'UNAUTHORIZED',
			// 	})
			// }
			// decodedToken= {
			// 	"data": {
			// 	  "_id": "62c9cc418939d9eb98ad7ace",
			// 	  "mobile": "9591553520"
			// 	},
			// 	"iat": 1657442913,
			// 	"exp": 1657529313
			//   };

			/* Invalidate token when user role is updated, say from mentor to mentee or vice versa */
			const user = await UsersData.findOne({ _id: decodedToken.data._id })

			// if (user && user.isAdmin !== decodedToken.data.isAdmin) {
			// 	throw common.failureResponse({
			// 		message: apiResponses.USER_ROLE_UPDATED,
			// 		statusCode: httpStatusCode.unauthorized,
			// 		responseCode: 'UNAUTHORIZED',
			// 	})
			// }

			req.decodedToken = decodedToken.data
		}

		next()
	} catch (err) {
		next(err)
	}
}
