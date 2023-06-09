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
const savingsData = require('@db/savings/queries')
const ObjectId = require('mongoose').Types.ObjectId
const usersData = require('@db/users/queries')

const pdf = require('@generics/pdf')
let ejs = require('ejs')

module.exports = class savingsHelper {
	static async create(bodyData, loggedInUserId) {
		try {
			bodyData['userId'] = ObjectId(loggedInUserId)
			let sales = await savingsData.create(bodyData)
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
			const result = await savingsData.updateOne(filter, bodyData)
			if (result === 'SAVINGS_NOT_FOUND') {
				return common.failureResponse({
					message: 'Savings failed to update',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'Savings update successfully',
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

			const data = await savingsData.findOne(filter)
			console.log('data.balance', data.balance)
			if (!data.balance) {
				data.balance = 0
			}
			let balance = 0
			if (data.balance) {
				balance = parseFloat(data.balance) + parseFloat(bodyData.amount)
			} else {
				balance = parseFloat(bodyData.amount)
			}
			console.log('balance', balance)

			const result = await savingsData.updateOne(filter, { balance: balance, $push: { installments: bodyData } })
			if (result === 'SAVINGS_NOT_FOUND') {
				return common.failureResponse({
					message: 'Savings failed to update',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'Installment added successfully',
			})
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
			const data = await savingsData.findOne(filter)
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

	static async installmentPdf(id, installmentId) {
		try {
			let savingsDetails = await savingsData.findOne({ _id: id })

			let customerDetails = await usersData.find({ _id: savingsDetails.customerId })

			if (customerDetails.image) {
				customerDetails.image = await utilsHelper.getDownloadableUrl(customerDetails.image)
			}

			savingsDetails['customerDetails'] = customerDetails

			// console.log(html,"html",__basedir);

			let installmentDetails = {}
			savingsDetails.installments.map(function (adoc) {
				if (adoc._id == installmentId) {
					installmentDetails = adoc
				}
			})

			let object = {
				...savingsDetails,
				amount: installmentDetails.amount,
				balance: savingsDetails.balance,
				paidAt: installmentDetails.paidAt,
				siteUrl: process.env.HOST_URL,
				customerDetails: customerDetails,
			}
			let html = await ejs.renderFile(__basedir + '/template/savingsInstallment.ejs', { data: object })

			let pdfcon = await pdf.generatePdf(html.toString(), { width: 200, height: 400 })

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
			const salesDetails = await savingsData.findAll(page, limit, search, filters)
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

	static async expiredList(page, limit, search) {
		try {
			let arrayOfStatus = []
			if (status && status != '') {
				arrayOfStatus = status.split(',')
			}

			let filters = {}

			console.log('filters', filters)
			const salesDetails = await savingsData.findAll(page, limit, search, filters)
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
