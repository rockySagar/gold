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
const contractData = require('@db/contract/queries')
const ObjectId = require('mongoose').Types.ObjectId
const usersData = require('@db/users/queries')
const utilsHelper = require('@generics/utils')

const pdf = require('@generics/pdf')
let ejs = require('ejs')
const { util } = require('@google-cloud/storage/build/src/nodejs-common')

const moment = require('moment')
const { body } = require('express-validator/check')

module.exports = class contractHelper {
	static async create(bodyData, loggedInUserId) {
		try {
			bodyData['userId'] = ObjectId(loggedInUserId)
			bodyData['balance'] = bodyData.loanAmount

			let sales = await contractData.create(bodyData)
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
			const result = await contractData.updateOne(filter, bodyData)
			if (result === 'CONTRACT_NOT_FOUND') {
				return common.failureResponse({
					message: 'Contract failed to update',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'Contract update successfully',
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

			const contractDetails = await contractData.findOne(filter)

			const loanDate = moment(contractDetails.disbursementAt).format('YYYY-MM-DD')

			const currentDate = moment(new Date()).format('YYYY-MM-DD')

			var mm = moment(currentDate)
			if (contractDetails && contractDetails.balance) {
				let balance = parseFloat(contractDetails.balance)
				let intBal = parseFloat(contractDetails.interestBalance)

				if (bodyData.amount > balance + intBal) {
					return common.failureResponse({
						message: 'Installment amount is greater than balance amount',
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				}

				let lastPaid = loanDate

				if (contractDetails.lastPaid) {
					lastPaid = moment(contractDetails.lastPaid).format('YYYY-MM-DD')
				}
				bodyData['days'] = mm.diff(lastPaid, 'days')
				contractDetails.intrestRate = contractDetails.intrestRate * 12
				let intrestTill = utilsHelper.calculateInterest(
					contractDetails.loanAmount,
					contractDetails.intrestRate,
					bodyData['days']
				)

				intrestTill = intrestTill + intBal
				if (bodyData.amount > intrestTill) {
					let intrestPaid = intrestTill
					let principlePaid = parseFloat(bodyData.amount) - intrestTill
					bodyData['interestDeducted'] = intrestPaid
					bodyData['prinicpleAmountDeducted'] = principlePaid
					balance = parseFloat(contractDetails.balance) - principlePaid

					intBal = 0
				} else {
					let intBalence = parseFloat(intrestTill) - parseFloat(bodyData.amount)
					intBal = intBalence
					bodyData['interestDeducted'] = bodyData.amount
					bodyData['prinicpleAmountDeducted'] = 0
				}

				const result = await contractData.updateOne(filter, {
					lastPaid: bodyData['paidAt'],
					balance: balance,
					interestBalance: intBal,
					$push: { installments: bodyData },
				})
				if (result === 'CONTRACT_NOT_FOUND') {
					return common.failureResponse({
						message: 'Contract failed to update',
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
					message: 'Contract failed to update',
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
			const data = await contractData.findOne(filter)
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
			let contractDetails = await contractData.findOne({ _id: id })

			let customerDetails = await usersData.find({ _id: contractDetails.customerId })

			console.log('customerDetails.image', customerDetails)
			if (customerDetails && customerDetails.image) {
				customerDetails.image = await utilsHelper.getDownloadableUrl(customerDetails.image)
			} else {
				// customerDetails = {};
				customerDetails['image'] = 'no'
				// customerDetails['image'] = ">";
			}

			contractDetails['customerDetails'] = customerDetails
			contractDetails['siteUrl'] = process.env.HOST_URL

			if (contractDetails && contractDetails.items && contractDetails.items.length > 0) {
				for (var j = 0; j < contractDetails.items.length; j++) {
					if (contractDetails.items[j].image) {
						contractDetails.items[j].image = await utilsHelper.getDownloadableUrl(
							contractDetails.items[j].image
						)
					}
				}
			}

			let html = await ejs.renderFile(__basedir + '/template/contract.ejs', { data: contractDetails })

			let op = {
				footer: {
					height: '28mm',
					contents: {
						//   first: 'Cover page',
						//   2: 'Second page', // Any page number is working. 1-based index
						default:
							'<div style="float: left;width: 98%;padding-left:1%;padding-right:1%;padding-bottom: 20px;"><div style="float: left;width:50%;text-align: left;font-size: 13px;"> Customer Signature</div><div style="float: right;width:50%;text-align: right;font-size: 13px;"> Manager Signature</div></div>', // fallback value
						//   last: 'Last Page'
					},
				},
			}
			let pdfcon = await pdf.generatePdf(html.toString(), op)

			return common.successResponse({
				statusCode: 200,
				message: 'PDF generated succesffully',
				result: { pdf: true, data: pdfcon },
			})
		} catch (error) {
			throw error
		}
	}

	static async installmentPdf(id, installmentId) {
		try {
			let contractDetails = await contractData.findOne({ _id: id })

			let customerDetails = await usersData.find({ _id: contractDetails.customerId })

			if (customerDetails.image) {
				customerDetails.image = await utilsHelper.getDownloadableUrl(customerDetails.image)
			}

			let installmentDetails = {}
			contractDetails.installments.map(function (adoc) {
				if (adoc._id == installmentId) {
					installmentDetails = adoc
				}
			})

			contractDetails['customerDetails'] = customerDetails
			let object = {
				...customerDetails,
				interestPaid: installmentDetails.interestDeducted,
				principlePaid: installmentDetails.prinicpleAmountDeducted,
				totalPaid: installmentDetails.amount,
				balance: contractDetails.balance,
				paidAt: installmentDetails.paidAt,
				...contractDetails,

				siteUrl: process.env.HOST_URL,
			}
			let html = await ejs.renderFile(__basedir + '/template/installment.ejs', { data: object })

			// console.log(html,"html",__basedir);

			// console.log(contractDetails.customerId,"contractDetails",contractDetails);
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

			console.log(limit, 'filters', page)
			const salesDetails = await contractData.findAll(page, limit, search, filters)
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
			const currentDate = moment(new Date()).format('YYYY-MM-DD')

			let filters = {
				dueDate: { $lt: currentDate },
			}

			const salesDetails = await contractData.findAll(page, limit, search, filters)
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
