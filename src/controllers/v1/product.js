/**
 * name : product.js
 * author : Rakesh Kumar
 * created-date : 03-Nov-2021
 * Description : product Controller.
 */

// Dependencies
const productsHelper = require('@services/helper/product')

module.exports = class Products {
	/**
	 * create product data
	 * @method
	 * @name create
	 * @param {Object} req -request data.
	 * @param {string} req.body.type - product type.
	 * @param {string} req.body.subType -subtype of the product.
	 * @param {string} req.body.action -product action.
	 * @param {string} req.body.data -product data.
	 * @param {string} req.body.data.templateName -name of the template
	 * @returns {JSON} - returns the product data
	 */

	async create(req) {
		const params = req.body
		try {
			// console.log("--------------------");
			const createdproduct = await productsHelper.create(params, req.decodedToken._id)
			return createdproduct
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
			const updatedproduct = await productsHelper.update(params)
			return updatedproduct
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
			const product = await productsHelper.read(req.params.id)
			return product
		} catch (error) {
			return error
		}
	}

	/**
	 * Products list
	 * @method
	 * @name list
	 * @param {Object} req -request data.
	 * @param {String} req.decodedToken._id - User Id.
	 * @param {String} req.pageNo - Page No.
	 * @param {String} req.pageSize - Page size limit.
	 * @param {String} req.searchText - Search text.
	 * @returns {JSON} - Session List.
	 */

	async list(req) {
		try {
			const productsDetails = await productsHelper.list(
				req.decodedToken._id,
				req.pageNo,
				req.pageSize,
				req.searchText,
				req.query.status,
				req.query.type ? req.query.type : '',
				req.params.id
			)
			return productsDetails
		} catch (error) {
			return error
		}
	}
}
