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

const pdf = require('@generics/pdf')
let ejs = require("ejs");



module.exports = class contractHelper {


	static async create(bodyData,loggedInUserId) {
		try {
		
			bodyData['userId'] = ObjectId(loggedInUserId);
			let sales = await contractData.create(bodyData)
			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: apiResponses.sales_CREATED_SUCCESSFULLY,
				result: sales
			})
		} catch (error) {
			throw error
		}
	}

	static async update(bodyData) {
		try {
			const filter = {
				_id: ObjectId(bodyData._id)
			}
			const result = await contractData.updateOne(filter, bodyData)
			if (result === 'sales_NOT_FOUND') {
				return common.failureResponse({
					message: apiResponses.sales_NOT_FOUND,
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.accepted,
				message: apiResponses.sales_UPDATED_SUCCESSFULLY,
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
				_id: ObjectId(id)
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
			
			
			let html = await ejs.renderFile(__basedir+"/template/contract.ejs", { data: { name: "aa" } } );
			

// console.log(html,"html",__basedir);

			let pdfcon = await pdf.generatePdf(html.toString());
			
			return common.successResponse({
				statusCode: 200,
				message: "PDF generated succesffully",
				result: { pdf:true,data: pdfcon },
			});

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

	static async list(loggedInUserId,organisationId, page, limit, search, status, type) {
		try {

			let arrayOfStatus = []
			if (status && status != '') {
				arrayOfStatus = status.split(',')
			}

			let filters = {}
			filters['organisationId'] = ObjectId(organisationId);
			if (type == "my") {
				filters['userId'] = ObjectId(loggedInUserId);
			}

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

			console.log("filters",filters);
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