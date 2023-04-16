/**
 * name : takeOver.js
 * author : Rakesh Kumar
 * created-date : 03-Nov-2021
 * Description : takeOver Controller.
 */

// Dependencies
const takeOverHelper = require('@services/helper/takeOver')

module.exports = class takeOver {
	/**
	 * create takeOver data
	 * @method
	 * @name create
	 * @param {Object} req -request data.
	 * @param {string} req.body.type - takeOver type.
	 * @param {string} req.body.subType -subtype of the takeOver.
	 * @param {string} req.body.action -takeOver action.
	 * @param {string} req.body.data -takeOver data.
	 * @param {string} req.body.data.templateName -name of the template
	 * @returns {JSON} - returns the takeOver data
	 */

	async create(req) {
		const params = req.body
		try {
			const createdtakeOver = await takeOverHelper.create(params, req.decodedToken._id)
			return createdtakeOver
		} catch (error) {
			return error
		}
	}

	/**
	 * update takeOver data
	 * @method
	 * @name update
	 * @param {Object} req -request data.
	 * @param {string} req.body.type - takeOver type.
	 * @param {string} req.body.subType -subtype of the takeOver.
	 * @param {string} req.body.action -takeOver action.
	 * @param {string} req.body.data -takeOver data.
	 * @param {string} req.body.data.templateName -name of the template
	 * @returns {JSON} - returns the takeOver data
	 */

	async update(req) {
		const params = req.body
		try {
			const updatedtakeOver = await takeOverHelper.update(params, req.params.id)
			return updatedtakeOver
		} catch (error) {
			return error
		}
	}

	async addInstallments(req) {
		const params = req.body
		try {
			const updatedtakeOver = await takeOverHelper.addInstallments(params, req.params.id)
			return updatedtakeOver
		} catch (error) {
			return error
		}
	}

	/**
	 * read takeOver
	 * @method
	 * @name read
	 * @param {Object} req -request data.
	 * @param {string} req.body.type - takeOver type.
	 * @param {string} req.body.subType -subtype of the takeOver.
	 * @param {string} req.body.action -takeOver action.
	 * @param {string} req.body.data -takeOver data.
	 * @param {string} req.body.data.templateName -name of the template
	 * @returns {JSON} - returns the takeOver data
	 */

	async read(req) {
		// const params = req.body
		try {
			const takeOver = await takeOverHelper.read(req.params.id)
			return takeOver
		} catch (error) {
			return error
		}
	}

	/**
	 * takeOver list
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
			const takeOverDetails = await takeOverHelper.list(
				// req.decodedToken._id,
				req.params.id,
				req.pageNo,
				req.pageSize,
				req.searchText,
				req.query.status
				// req.query.type ? req.query.type : ""
			)
			return takeOverDetails
		} catch (error) {
			return error
		}
	}
	async generatePdf(req) {
		try {
			const takeOverDetails = await takeOverHelper.generatePdf(req.params.id)
			return takeOverDetails
		} catch (error) {
			return error
		}
	}
	async installmentPdf(req) {
		try {
			const takeOverDetails = await takeOverHelper.installmentPdf(req.params.id)
			return takeOverDetails
		} catch (error) {
			return error
		}
	}
}
