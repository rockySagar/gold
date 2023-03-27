/**
 * name : playstation.js
 * author : Rakesh
 * created-date : 07-Oct-2021
 * Description : User playstation.
 */

// Dependencies
const playstationHelper = require('@services/helper/playstation')
const csv = require('csvtojson')
const common = require('@constants/common')
const apiResponses = require('@constants/api-responses')
const httpStatusCode = require('@generics/http-status')

module.exports = class playstation {
	/**
	 * create mentee playstation
	 * @method
	 * @name create
	 * @param {Object} req -request data.
	 * @returns {JSON} - response contains playstation creation details.
	 */

	async create(req) {
		const params = req.body
		try {
			const createdplaystation = await playstationHelper.create(params)
			return createdplaystation
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
			const playstation = await playstationHelper.update(params)
			return playstation
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
			const playstation = await playstationHelper.read(req.params.id)
			return playstation
		} catch (error) {
			return error
		}
	}

    async list(req) {
		try {
			const result = await playstationHelper.list(req.params.id,
				req.pageNo,
				req.pageSize,
				req.searchText,
				req.query.status)
			return result
		} catch (error) {
			return error
		}
	}


}
