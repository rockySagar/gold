/**
 * name : organisation.js
 * author : Rakesh Kumar
 * created-date : 03-Nov-2021
 * Description : Form helper.
 */

// Dependencies
const httpStatusCode = require('@generics/http-status')
const apiResponses = require('@constants/api-responses')
const common = require('@constants/common')
const organisationData = require('@db/organisation/queries')
const ObjectId = require('mongoose').Types.ObjectId
const utilsHelper = require('@generics/utils')

module.exports = class organisationHelper {


	static async create(bodyData) {
		try {
		
			let organisation = await organisationData.create(bodyData)
			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: apiResponses.ORGANISATION_CREATED_SUCCESSFULLY,
				result: organisation
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
			const result = await organisationData.updateOne(filter, bodyData)
			if (result === 'ORGANISATION_NOT_FOUND') {
				return common.failureResponse({
					message: apiResponses.ORGANISATION_NOT_FOUND,
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.accepted,
				message: apiResponses.ORGANISATION_UPDATED_SUCCESSFULLY,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * read organisation
	 * @method
	 * @name read
	 * @param {Object} bodyData -request data.
	 * @param {string} bodyData.type - organisation type.
	 * @param {string} bodyData.subType -subtype of the organisation.
	 * @param {string} bodyData.action -organisation action.
	 * @param {string} bodyData.data -organisation data.
	 * @param {string} bodyData.data.templateName -name of the template
	 * @returns {JSON} - returns the organisation data
	 */

	static async read(id) {
		try {
			const filter = {
				_id: ObjectId(id)
			}
			const organisation = await organisationData.findOne(filter);
			if (!organisation) {
				return common.failureResponse({
					message: apiResponses.ORGANISATION_NOT_FOUND,
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: apiResponses.ORGANISATION_FETCHED_SUCCESSFULLY,
				result: organisation ? organisation : {},
			})
		} catch (error) {
			throw error
		}
	}




	/**
	 * organisations list.
	 * @method
	 * @name list
	 * @param {String} loggedInUserId - LoggedIn user id.
	 * @param {Number} page - page no.
	 * @param {Number} limit - page size.
	 * @param {String} search - search text.
	 * @returns {JSON} - List of sessions
	 */

	static async list(loggedInUserId, page, limit, search, status, type) {
		try {

			let arrayOfStatus = []
			if (status && status != '') {
				arrayOfStatus = status.split(',')
			}

			let filters = {}
			if (type == "my") {
				filters['userId'] = ObjectId(loggedInUserId);
			}

			console.log("filters",filters);
			const organisationDetails = await organisationData.findAll(page, limit, search, filters)
			if (organisationDetails[0] && organisationDetails[0].data.length == 0 && search !== '') {
				return common.failureResponse({
					message: apiResponses.ORGANISATION_NOT_FOUND,
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
					result: [],
				})
			}

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: apiResponses.ORGANISATION_FETCHED_SUCCESSFULLY,
				result: organisationDetails[0] ? organisationDetails[0] : [],
			})
		} catch (error) {
			throw error
		}
	}

}