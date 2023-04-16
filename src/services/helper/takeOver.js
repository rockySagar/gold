/**
 * name : sales.js
 * author : Rakesh Kumar
 * created-date : 03-Nov-2021
 * Description : Form helper.
 */

// Dependencies
const httpStatusCode = require('@generics/http-status')
const apiResponses = require('@constants/api-responses')
const common = require('@constants/common')
const takeOverData = require('@db/takeOver/queries')
const ObjectId = require('mongoose').Types.ObjectId
const usersData = require('@db/users/queries')
const utilsHelper = require('@generics/utils')

const pdf = require('@generics/pdf')
let ejs = require('ejs')
const { util } = require('@google-cloud/storage/build/src/nodejs-common')

const moment = require('moment')
const { body } = require('express-validator/check')

module.exports = class takeOverHelper {
	static async create(bodyData, loggedInUserId) {
		try {
			bodyData['userId'] = ObjectId(loggedInUserId)
			bodyData['balance'] = bodyData.loanAmount

			let sales = await takeOverData.create(bodyData)
			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: apiResponses.sales_CREATED_SUCCESSFULLY,
				result: sales,
			})
		} catch (error) {
			throw error
		}
	}

	static async update(bodyData, id) {
		try {
			const filter = {
				_id: ObjectId(id),
			}
			const result = await takeOverData.updateOne(filter, bodyData)
			if (result === 'TAKEOVER_NOT_FOUND') {
				return common.failureResponse({
					message: 'TakeOver failed to update',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'TakeOver update successfully',
			})
		} catch (error) {
			throw error
		}
	}

	static async addInstallments(bodyData, id) {
		try {
			const filter = {
				_id: ObjectId(id),
			}
			bodyData['paidAt'] = new Date().toISOString()

			const takeOverDetails = await takeOverData.findOne(filter)

			const loanDate = moment(takeOverDetails.disbursementAt).format('YYYY-MM-DD')

			const currentDate = moment(new Date()).format('YYYY-MM-DD')

			var mm = moment(currentDate)
			if (takeOverDetails && takeOverDetails.balance) {
				let balance = parseFloat(takeOverDetails.balance)
				let intBal = parseFloat(takeOverDetails.interestBalance)

				let lastPaid = loanDate

				if (takeOverDetails.lastPaid) {
					lastPaid = moment(takeOverDetails.lastPaid).format('YYYY-MM-DD')
				}
				bodyData['days'] = mm.diff(lastPaid, 'days')
				takeOverDetails.intrestRate = takeOverDetails.intrestRate * 12
				let intrestTill = utilsHelper.calculateInterest(
					takeOverDetails.loanAmount,
					takeOverDetails.intrestRate,
					bodyData['days']
				)

				intrestTill = intrestTill + intBal
				if (bodyData.amount > intrestTill) {
					let intrestPaid = intrestTill
					let principlePaid = parseFloat(bodyData.amount) - intrestTill
					bodyData['interestDeducted'] = intrestPaid
					bodyData['prinicpleAmountDeducted'] = principlePaid
					balance = parseFloat(takeOverDetails.balance) - principlePaid

					intBal = 0
				} else {
					let intBalence = parseFloat(intrestTill) - parseFloat(bodyData.amount)
					intBal = intBalence
					bodyData['interestDeducted'] = bodyData.amount
					bodyData['prinicpleAmountDeducted'] = 0
				}

				const result = await takeOverData.updateOne(filter, {
					lastPaid: bodyData['paidAt'],
					balance: balance,
					interestBalance: intBal,
					$push: { installments: bodyData },
				})
				if (result === 'TakeOver_NOT_FOUND') {
					return common.failureResponse({
						message: 'TakeOver failed to update',
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				}
				return common.successResponse({
					statusCode: httpStatusCode.accepted,
					message: 'Installment added successfully',
				})
			} else {
				return common.failureResponse({
					message: 'TakeOver failed to update',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
		} catch (error) {
			throw error
		}
	}

	/**
	 * read sales
	 * @method
	 * @name read
	 * @param {Object} bodyData -request data.
	 * @param {string} bodyData.type - sales type.
	 * @param {string} bodyData.subType -subtype of the sales.
	 * @param {string} bodyData.action -sales action.
	 * @param {string} bodyData.data -sales data.
	 * @param {string} bodyData.data.templateName -name of the template
	 * @returns {JSON} - returns the sales data
	 */

	static async read(id) {
		try {
			const filter = {
				_id: ObjectId(id),
			}
			const data = await takeOverData.findOne(filter)
			if (!data) {
				return common.failureResponse({
					message: apiResponses.SALES_NOT_FOUND,
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: apiResponses.SALES_FETCHED_SUCCESSFULLY,
				result: data ? data : {},
			})
		} catch (error) {
			throw error
		}
	}

	static async generatePdf(id) {
		try {
			let takeOverDetails = await takeOverData.findOne({ _id: id })

			let customerDetails = await usersData.find({ _id: takeOverDetails.customerId })

			if (customerDetails.image) {
				customerDetails.image = await utilsHelper.getDownloadableUrl(customerDetails.image)
			}

			takeOverDetails['customerDetails'] = customerDetails
			let object = {
				...customerDetails,
				...takeOverDetails,
				siteUrl: 'http://localhost:3002',
			}
			let html = await ejs.renderFile(__basedir + '/template/takeOver.ejs', { data: object })

			// console.log(html,"html",__basedir);

			// console.log(takeOverDetails.customerId,"takeOverDetails",takeOverDetails);
			let pdfcon = await pdf.generatePdf(html.toString(), {})

			return common.successResponse({
				statusCode: 200,
				message: 'PDF generated succesffully',
				result: { pdf: true, data: pdfcon },
			})
		} catch (error) {
			throw error
		}
	}

	static async installmentPdf(id) {
		try {
			let takeOverDetails = await takeOverData.findOne({ _id: id })

			let customerDetails = await usersData.find({ _id: takeOverDetails.customerId })

			if (customerDetails.image) {
				customerDetails.image = await utilsHelper.getDownloadableUrl(customerDetails.image)
			}

			takeOverDetails['customerDetails'] = customerDetails
			let object = {
				...customerDetails,
				...takeOverDetails,
				siteUrl: 'http://localhost:3002',
			}
			let html = await ejs.renderFile(__basedir + '/template/installment.ejs', { data: object })

			// console.log(html,"html",__basedir);

			// console.log(takeOverDetails.customerId,"takeOverDetails",takeOverDetails);
			let pdfcon = await pdf.generatePdf(html.toString(), { config: { width: '3in' } })

			return common.successResponse({
				statusCode: 200,
				message: 'PDF generated succesffully',
				result: { pdf: true, data: pdfcon },
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * saless list.
	 * @method
	 * @name list
	 * @param {String} loggedInUserId - LoggedIn user id.
	 * @param {Number} page - page no.
	 * @param {Number} limit - page size.
	 * @param {String} search - search text.
	 * @returns {JSON} - List of sessions
	 */

	static async list(customerId, page, limit, search, status) {
		try {
			let arrayOfStatus = []
			if (status && status != '') {
				arrayOfStatus = status.split(',')
			}

			let filters = {}
			// filters['organisationId'] = (organisationId);
			// if (type == "my") {
			filters['customerId'] = ObjectId(customerId)
			// filters['userId'] = (userId);
			// }

			// console.log("organisationId",organisationId);

			// if (arrayOfStatus.length > 0) {
			// 	if (
			// 		arrayOfStatus.includes(common.PUBLISHED_STATUS) &&
			// 		arrayOfStatus.includes(common.COMPLETED_STATUS) &&
			// 		arrayOfStatus.includes(common.LIVE_STATUS)
			// 	) {
			// 		filters['endDateUtc'] = {
			// 			$lt: moment().utc().format(),
			// 		}
			// 	} else if (
			// 		arrayOfStatus.includes(common.PUBLISHED_STATUS) &&
			// 		arrayOfStatus.includes(common.LIVE_STATUS)
			// 	) {
			// 		filters['endDateUtc'] = {
			// 			$gte: moment().utc().format(),
			// 		}
			// 	}

			// 	filters['status'] = {
			// 		$in: arrayOfStatus,
			// 	}
			// }

			console.log('filters', filters)
			const salesDetails = await takeOverData.findAll(page, limit, search, filters)
			if (salesDetails[0] && salesDetails[0].data.length == 0 && search !== '') {
				return common.failureResponse({
					message: apiResponses.SALES_NOT_FOUND,
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
					result: [],
				})
			}

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: apiResponses.SALES_FETCHED_SUCCESSFULLY,
				result: salesDetails[0] ? salesDetails[0] : [],
			})
		} catch (error) {
			throw error
		}
	}
}
