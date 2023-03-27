/**
 * name : organisation.js
 * author : Rakesh
 * created-date : 07-Oct-2021
 * Description : User Organisation.
 */

// Dependencies
const organisationHelper = require('@services/helper/organisation')
const csv = require('csvtojson')
const common = require('@constants/common')
const apiResponses = require('@constants/api-responses')
const httpStatusCode = require('@generics/http-status')

module.exports = class Organisation {
	/**
	 * create mentee organisation
	 * @method
	 * @name create
	 * @param {Object} req -request data.
	 * @returns {JSON} - response contains organisation creation details.
	 */

	async create(req) {
		const params = req.body
		try {
			const createdOrganisation = await organisationHelper.create(params)
			return createdOrganisation
		} catch (error) {
			return error
		}
	}



	/**
	 * update product data
	 * @method
	 * @name update
	 * @param {Object} req -request data.
	 * @param {string} req.body.type - product type.
	 * @param {string} req.body.subType -subtype of the product.
	 * @param {string} req.body.action -product action.
	 * @param {string} req.body.data -product data.
	 * @param {string} req.body.data.templateName -name of the template
	 * @returns {JSON} - returns the product data
	 */

	 async update(req) {
		const params = req.body
		params['_id'] = req.params.id
		try {
			const organisation = await organisationHelper.update(params)
			return organisation
		} catch (error) {
			return error
		}
	}

	/**
	 * read product
	 * @method
	 * @name read
	 * @param {Object} req -request data.
	 * @param {string} req.body.type - product type.
	 * @param {string} req.body.subType -subtype of the product.
	 * @param {string} req.body.action -product action.
	 * @param {string} req.body.data -product data.
	 * @param {string} req.body.data.templateName -name of the template
	 * @returns {JSON} - returns the product data
	 */

	 async read(req) {
		// const params = req.body
		try {
			const organisation = await organisationHelper.read(req.params.id)
			return organisation
		} catch (error) {
			return error
		}
	}



}
