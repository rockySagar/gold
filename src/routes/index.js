/**
 * name : routes
 * author : Rakesh Kumar   
 * Date : 30-Sep-2021
 * Description : Routes for available service
 */

const validator = require('@middlewares/validator')
const authenticator = require('@middlewares/authenticator')
const pagination = require('@middlewares/pagination')
const expressValidator = require('express-validator')
const fs = require('fs')

module.exports = (app) => {
	app.use(authenticator)
	app.use(pagination)
	app.use(expressValidator())

	async function router(req, res, next) {
		let controllerResponse
		let validationError

		/* Check for input validation error */
		try {
			validationError = req.validationErrors()
		} catch (error) {
			error.statusCode = 422
			error.responseCode = 'CLIENT_ERROR'
			return next(error)
		}

		if (validationError.length) {
			const error = new Error('Validation failed, Entered data is incorrect!')
			error.statusCode = 422
			error.responseCode = 'CLIENT_ERROR'
			error.data = validationError
			return next(error)
		}

		try {
			let controller
			if (req.params.file) {
				let folderExists = fs.existsSync(
					PROJECT_ROOT_DIRECTORY +
						'/controllers/' +
						req.params.version +
						'/' +
						req.params.controller +
						'/' +
						req.params.file +
						'.js'
				)
				if (folderExists) {
					controller = require(`@controllers/${req.params.version}/${req.params.controller}/${req.params.file}`)
				} else {
					controller = require(`@controllers/${req.params.version}/${req.params.controller}`)
				}
			} else {
				controller = require(`@controllers/${req.params.version}/${req.params.controller}`)
			}
			controllerResponse = new controller()[req.params.method]
				? await new controller()[req.params.method](req)
				: next()
		} catch (error) {
			// If controller or service throws some random error
			return next(error)
		}

		if (
			controllerResponse &&
			controllerResponse.statusCode !== 200 &&
			controllerResponse.statusCode !== 201 &&
			controllerResponse.statusCode !== 202
		) {

				return next(controllerResponse)
			
			
		}
		
		if (controllerResponse) {

			if(controllerResponse.result && controllerResponse.result.pdf == true){
				res.contentType("application/pdf");
				res.send(controllerResponse.result.data);
			}else {
				res.status(controllerResponse.statusCode).json({
					responseCode: controllerResponse.responseCode,
					message: controllerResponse.message,
					result: controllerResponse.result,
					meta: controllerResponse.meta,
				})
			}
			
		}
	}

	app.all('/gold/:version/:controller/:method', validator, router)
	app.all('/gold/:version/:controller/:file/:method', validator, router)
	app.all('/gold/:version/:controller/:method/:id', validator, router)
	app.all('/gold/:version/:controller/:file/:method/:id', validator, router)

	app.use((req, res, next) => {
		res.status(404).json({
			responseCode: 'RESOURCE_ERROR',
			message: 'Requested resource not found!',
		})
	})

	// Global error handling middleware, should be present in last in the stack of a middleware's
	app.use((error, req, res, next) => {


		console.log("error",error)
		const status = error.statusCode || 500
		const responseCode = error.responseCode || 'SERVER_ERROR'
		const message = error.message || ''
		let errorData = []

		if (error.data) {
			errorData = error.data
		}
		res.status(status).json({
			responseCode,
			message,
			error: errorData,
		})
	})
}
