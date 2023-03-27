/**
 * name : validators/v1/accounts.js
 * author : Rakesh Kumar
 * Date : 20-Oct-2021
 * Description : Validations of accounts controller
 */

module.exports = {
	create: (req) => {

		if(eq.checkBody('type').notEmpty().eq()=="customer"){
			
		}else {
			req.checkBody('password').trim().notEmpty().withMessage('password field is empty')
	
		}
		req.checkBody('name')
			.trim()
			.notEmpty()
			.withMessage('name field is empty')
			.matches(/^[A-Za-z ]+$/)
			.withMessage('This field can only contain alphabets')
		req.checkBody('mobile')
			.trim()
			.notEmpty()
			.withMessage('mobile field is empty')
			.matches(/^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/)
			.withMessage('mobile number invalid')

		req.checkBody('organisationId').trim().notEmpty().withMessage('organisation id field is empty')

		req.checkBody('isAMentor').optional().isBoolean().withMessage('isAMentor is invalid')
	},

	login: (req) => {
		req.checkBody('mobile')
			.trim()
			.notEmpty()
			.withMessage('mobile field is empty')
			.matches(/^(\+\d{1,3}[- ]?)?\d{10}$/)
			.withMessage('mobile is invalid')

		req.checkBody('password').trim().notEmpty().withMessage('password field is empty')
	},

	logout: (req) => {
		req.checkBody('refreshToken').notEmpty().withMessage('refreshToken field is empty')
	},

	generateToken: (req) => {
		req.checkBody('refreshToken').notEmpty().withMessage('refreshToken field is empty')
	},

	generateOtp: (req) => {
		req.checkBody('mobile').notEmpty().withMessage('mobile field is empty')

		req.checkBody('password').trim().notEmpty().withMessage('password field is empty')
	},

	registrationOtp: (req) => {
		req.checkBody('mobile').notEmpty().withMessage('mobile field is empty')

		// req.checkBody('name').notEmpty().withMessage('name field is empty')
	},

	resetPassword: (req) => {
		req.checkBody('email').notEmpty().withMessage('email field is empty').isEmail().withMessage('email is invalid')

		req.checkBody('password').notEmpty().withMessage('password field is empty')

		req.checkBody('otp')
			.notEmpty()
			.withMessage('otp field is empty')
			.matches(/^[0-9]+$/)
			.withMessage('otp should be number')
			.isLength({ min: 6, max: 6 })
			.withMessage('otp is invalid')
	},

	changeRole: (req) => {
		req.checkBody('email').notEmpty().withMessage('email field is empty').isEmail().withMessage('email is invalid')
	},

	listUser: (req) => {
		req.checkQuery('type').notEmpty().withMessage('type can not be null').isString()
	},
}
