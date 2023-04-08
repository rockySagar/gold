const savingsHelper = require('@services/helper/savings')

module.exports = class Savings {
	/**
	 * create savings data
	 * @method
	 * @name create
	 * @param {Object} req -request data.
	 * @param {string} req.body.type - savings type.
	 * @param {string} req.body.subType -subtype of the savings.
	 * @param {string} req.body.action -savings action.
	 * @param {string} req.body.data -savings data.
	 * @param {string} req.body.data.templateName -name of the template
	 * @returns {JSON} - returns the savings data
	 */

	async create(req) {
		const params = req.body
		try {
			// console.log("--------------------");
			const createdsavings = await savingsHelper.create(params, req.decodedToken._id)
			return createdsavings
		} catch (error) {
			return error
		}
	}

	/**
	 * update savings data
	 * @method
	 * @name update
	 * @param {Object} req -request data.
	 * @param {string} req.body.type - savings type.
	 * @param {string} req.body.subType -subtype of the savings.
	 * @param {string} req.body.action -savings action.
	 * @param {string} req.body.data -savings data.
	 * @param {string} req.body.data.templateName -name of the template
	 * @returns {JSON} - returns the savings data
	 */

	async update(req) {
		const params = req.body
		try {
			const updatedsavings = await savingsHelper.update(params, req.params.id)
			return updatedsavings
		} catch (error) {
			return error
		}
	}

	async addInstallments(req) {
		const params = req.body
		try {
			const updatedsavings = await savingsHelper.addInstallments(params, req.params.id)
			return updatedsavings
		} catch (error) {
			return error
		}
	}

	/**
	 * read savings
	 * @method
	 * @name read
	 * @param {Object} req -request data.
	 * @param {string} req.body.type - savings type.
	 * @param {string} req.body.subType -subtype of the savings.
	 * @param {string} req.body.action -savings action.
	 * @param {string} req.body.data -savings data.
	 * @param {string} req.body.data.templateName -name of the template
	 * @returns {JSON} - returns the savings data
	 */

	async read(req) {
		// const params = req.body
		try {
			const savings = await savingsHelper.read(req.params.id)
			return savings
		} catch (error) {
			return error
		}
	}

	/**
	 * Savings list
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
			const SavingsDetails = await savingsHelper.list(
				// req.decodedToken._id,
				req.params.id,
				req.pageNo,
				req.pageSize,
				req.searchText,
				req.query.status
				// req.query.type ? req.query.type : ""
			)
			return SavingsDetails
		} catch (error) {
			return error
		}
	}
	async generatePdf(req) {
		try {
			const SavingsDetails = await savingsHelper.generatePdf(req.params.id)
			return SavingsDetails
		} catch (error) {
			return error
		}
	}
}
