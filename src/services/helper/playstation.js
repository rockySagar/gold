/**
 * name : Playstation.js
 * author : Rakesh Kumar
 * created-date : 03-Nov-2021
 * Description : Form helper.
 */

// Dependencies
const httpStatusCode = require('@generics/http-status')
const apiResponses = require('@constants/api-responses')
const common = require('@constants/common')
const PlaystationData = require('@db/playstation/queries')
const ObjectId = require('mongoose').Types.ObjectId
const utilsHelper = require('@generics/utils')

module.exports = class PlaystationHelper {


	static async create(bodyData) {
		try {
		
			let Playstation = await PlaystationData.create(bodyData)
			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: apiResponses.PLAYSTATION_CREATED_SUCCESSFULLY,
				result: Playstation
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
			const result = await PlaystationData.updateOne(filter, bodyData)
			if (result === 'PLAYSTATION_NOT_FOUND') {
				return common.failureResponse({
					message: apiResponses.PLAYSTATION_NOT_FOUND,
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.accepted,
				message: apiResponses.PLAYSTATION_UPDATED_SUCCESSFULLY,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * read Playstation
	 * @method
	 * @name read
	 * @param {Object} bodyData -request data.
	 * @param {string} bodyData.type - Playstation type.
	 * @param {string} bodyData.subType -subtype of the Playstation.
	 * @param {string} bodyData.action -Playstation action.
	 * @param {string} bodyData.data -Playstation data.
	 * @param {string} bodyData.data.templateName -name of the template
	 * @returns {JSON} - returns the Playstation data
	 */

	static async read(id) {
		try {
			const filter = {
				_id: ObjectId(id)
			}
			const Playstation = await PlaystationData.findOne(filter);
			if (!Playstation) {
				return common.failureResponse({
					message: apiResponses.PLAYSTATION_NOT_FOUND,
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: apiResponses.PLAYSTATION_FETCHED_SUCCESSFULLY,
				result: Playstation ? Playstation : {},
			})
		} catch (error) {
			throw error
		}
	}




	/**
	 * Playstations list.
	 * @method
	 * @name list
	 * @param {String} loggedInUserId - LoggedIn user id.
	 * @param {Number} page - page no.
	 * @param {Number} limit - page size.
	 * @param {String} search - search text.
	 * @returns {JSON} - List of sessions
	 */

	static async list(organisationId, page, limit, search, status) {
		try {

			let arrayOfStatus = []
			if (status && status != '') {
				arrayOfStatus = status.split(',')
			}

			let filters = {}
				filters['organisationId'] = ObjectId(organisationId);

			console.log("filters",filters);
			const PlaystationDetails = await PlaystationData.findAll(page, limit, search, filters)
			if (PlaystationDetails[0] && PlaystationDetails[0].data.length == 0 && search !== '') {
				return common.failureResponse({
					message: apiResponses.PLAYSTATION_NOT_FOUND,
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
					result: [],
				})
			}

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: apiResponses.PLAYSTATION_FETCHED_SUCCESSFULLY,
				result: PlaystationDetails[0] ? PlaystationDetails[0] : [],
			})
		} catch (error) {
			throw error
		}
	}

}