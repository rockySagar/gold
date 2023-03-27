/**
 * name : validators/v1/accounts.js
 * author : Rakesh Kumar
 * Date : 20-Oct-2021
 * Description : Validations of accounts controller
 */

module.exports = {
	create: (req) => {
		req.checkBody('name').trim().notEmpty().withMessage('name field is empty')
		req.checkBody('organisationId').trim().notEmpty().withMessage('organisationId field is empty')
		req.checkBody('price').trim().notEmpty().withMessage('price field is empty')
		req.checkBody('unit').trim().notEmpty().withMessage('unit field is empty')
		req.checkBody('inStock').trim().notEmpty().withMessage('inStock field is empty')
	},
	update: (req) => {
		req.checkParams('id')
			.notEmpty()
			.withMessage('product param is empty')
			.isMongoId()
			.withMessage('product is invalid')
	},
	read: (req) => {
		req.checkParams('id')
			.notEmpty()
			.withMessage('product id is empty')
			.isMongoId()
			.withMessage('product is invalid')
	},
	list: (req) => {
		req.checkParams('id')
			.notEmpty()
			.withMessage('OrganisationId param is empty')
			.isMongoId()
			.withMessage('OrganisationId is invalid')
	},
}
