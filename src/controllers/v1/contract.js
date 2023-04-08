/**
 * name : contract.js
 * author : Rakesh Kumar
 * created-date : 03-Nov-2021
 * Description : contract Controller.
 */

// Dependencies
const contractHelper = require('@services/helper/contract')

module.exports = class Contract {
	/**
	 * create contract data
	 * @method
	 * @name create
	 * @param {Object} req -request data.
	 * @param {string} req.body.type - contract type.
	 * @param {string} req.body.subType -subtype of the contract.
	 * @param {string} req.body.action -contract action.
	 * @param {string} req.body.data -contract data.
	 * @param {string} req.body.data.templateName -name of the template
	 * @returns {JSON} - returns the contract data
	 */

	async create(req) {
		const params = req.body
		try {
			// console.log("--------------------");
			const createdcontract = await contractHelper.create(params, req.decodedToken._id)
			return createdcontract
		} catch (error) {
			return error
		}
	}

	/**
	 * update contract data
	 * @method
	 * @name update
	 * @param {Object} req -request data.
	 * @param {string} req.body.type - contract type.
	 * @param {string} req.body.subType -subtype of the contract.
	 * @param {string} req.body.action -contract action.
	 * @param {string} req.body.data -contract data.
	 * @param {string} req.body.data.templateName -name of the template
	 * @returns {JSON} - returns the contract data
	 */

	async update(req) {
		const params = req.body
		try {
			const updatedcontract = await contractHelper.update(params, req.params.id)
			return updatedcontract
		} catch (error) {
			return error
		}
	}

	async addInstallments(req) {
		const params = req.body
		try {
			const updatedcontract = await contractHelper.addInstallments(params, req.params.id)
			return updatedcontract
		} catch (error) {
			return error
		}
	}

	/**
	 * read contract
	 * @method
	 * @name read
	 * @param {Object} req -request data.
	 * @param {string} req.body.type - contract type.
	 * @param {string} req.body.subType -subtype of the contract.
	 * @param {string} req.body.action -contract action.
	 * @param {string} req.body.data -contract data.
	 * @param {string} req.body.data.templateName -name of the template
	 * @returns {JSON} - returns the contract data
	 */

	async read(req) {
		// const params = req.body
		try {
			const contract = await contractHelper.read(req.params.id)
			return contract
		} catch (error) {
			return error
		}
	}

	/**
	 * Contract list
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
			const ContractDetails = await contractHelper.list(
				// req.decodedToken._id,
				req.params.id,
				req.pageNo,
				req.pageSize,
				req.searchText,
				req.query.status
				// req.query.type ? req.query.type : ""
			)
			return ContractDetails
		} catch (error) {
			return error
		}
	}
	async generatePdf(req) {
		try {
			const ContractDetails = await contractHelper.generatePdf(req.params.id)
			return ContractDetails
		} catch (error) {
			return error
		}
	}
}
