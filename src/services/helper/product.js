/**
 * name : product.js
 * author : Rakesh Kumar
 * created-date : 03-Nov-2021
 * Description : Form helper.
 */

// Dependencies
const httpStatusCode = require('@generics/http-status')
const apiResponses = require('@constants/api-responses')
const common = require('@constants/common')
const productsData = require('@db/product/queries')
const ObjectId = require('mongoose').Types.ObjectId
const utilsHelper = require('@generics/utils')
const ShortUniqueId = require('short-unique-id')

module.exports = class productsHelper {
	/**
	 * create product
	 * @method
	 * @name create
	 * @param {Object} bodyData -request data.
	 * @param {string} bodyData.type - product type.
	 * @param {string} bodyData.subType -subtype of the product.
	 * @param {string} bodyData.action -product action.
	 * @param {string} bodyData.data -product data.
	 * @param {string} bodyData.data.templateName -name of the template
	 * @returns {JSON} - products created object.
	 */

	static async create(bodyData, loggedInUserId) {
		try {
			if (bodyData.productId) {
				const filter = {
					productId: bodyData.productId,
					organisationId: bodyData.organisationId,
				}
				const product = await productsData.findOneProduct(filter)
				if (product) {
					return common.failureResponse({
						message: apiResponses.PRODUCT_ALREADY_EXISTS,
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				}
			} else {
				let uid = new ShortUniqueId()
				let uidWithTimestamp = uid.stamp(32)
				bodyData['productId'] = uidWithTimestamp
			}

			bodyData['userId'] = ObjectId(loggedInUserId)
			let product = await productsData.createProduct(bodyData)
			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: apiResponses.PRODUCT_CREATED_SUCCESSFULLY,
				result: product,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * update product
	 * @method
	 * @name update
	 * @param {Object} bodyData -request data.
	 * @param {string} bodyData.type - product type.
	 * @param {string} bodyData.subType -subtype of the product.
	 * @param {string} bodyData.action -product action.
	 * @param {string} bodyData.data -product data.
	 * @param {string} bodyData.data.templateName -name of the template
	 * @returns {JSON} - returns update product inproductation
	 */
	static async update(bodyData) {
		try {
			if (bodyData.productId) {
				const filter = {
					productId: bodyData.productId,
					organisationId: bodyData.organisationId,
				}
				const product = await productsData.findOneProduct(filter)
				if (product) {
					return common.failureResponse({
						message: apiResponses.PRODUCT_ALREADY_EXISTS,
						statusCode: httpStatusCode.bad_request,
						responseCode: 'CLIENT_ERROR',
					})
				}
			}

			const filter = {
				_id: ObjectId(bodyData._id),
			}
			const result = await productsData.updateOneProduct(filter, bodyData)
			if (result === 'PRODUCT_NOT_FOUND') {
				return common.failureResponse({
					message: apiResponses.PRODUCT_NOT_FOUND,
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.accepted,
				message: apiResponses.PRODUCT_UPDATED_SUCCESSFULLY,
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * read product
	 * @method
	 * @name read
	 * @param {Object} bodyData -request data.
	 * @param {string} bodyData.type - product type.
	 * @param {string} bodyData.subType -subtype of the product.
	 * @param {string} bodyData.action -product action.
	 * @param {string} bodyData.data -product data.
	 * @param {string} bodyData.data.templateName -name of the template
	 * @returns {JSON} - returns the product data
	 */

	static async read(id) {
		try {
			const filter = {
				_id: ObjectId(id),
			}
			const product = await productsData.findOneProduct(filter)
			if (!product) {
				return common.failureResponse({
					message: apiResponses.PRODUCT_NOT_FOUND,
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			if (product.images && product.images.length > 0) {
				product.images = product.images.map(async (imgPath) => {
					if (imgPath && imgPath != '') {
						return await utilsHelper.getDownloadableUrl(imgPath)
					}
				})
				product.images = await Promise.all(product.images)
			}

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: apiResponses.PRODUCT_FETCHED_SUCCESSFULLY,
				result: product ? product : {},
			})
		} catch (error) {
			throw error
		}
	}

	/**
	 * products list.
	 * @method
	 * @name list
	 * @param {String} loggedInUserId - LoggedIn user id.
	 * @param {Number} page - page no.
	 * @param {Number} limit - page size.
	 * @param {String} search - search text.
	 * @returns {JSON} - List of sessions
	 */

	static async list(loggedInUserId, page, limit, search, status, type, organisationId) {
		try {
			let arrayOfStatus = []
			if (status && status != '') {
				arrayOfStatus = status.split(',')
			}

			let filters = {
				deleted: false,
				status: 'published',
				organisationId: ObjectId(organisationId),
			}
			if (type == 'my') {
				filters['userId'] = ObjectId(loggedInUserId)
			}

			// if (arrayOfStatus.length > 0) {
			// 	if (
			// 		arrayOfStatus.includes(common.PUBLISHED_STATUS) &&
			// 		arrayOfStatus.includes(common.COMPLETED_STATUS) &&
			// 		arrayOfStatus.includes(common.LIVE_STATUS)
			// 	) {
			// 		filters['endDateUtc'] = {
			// 			$lt: moment().utc().format(),
			// 		}
			// 	} else if (
			// 		arrayOfStatus.includes(common.PUBLISHED_STATUS) &&
			// 		arrayOfStatus.includes(common.LIVE_STATUS)
			// 	) {
			// 		filters['endDateUtc'] = {
			// 			$gte: moment().utc().format(),
			// 		}
			// 	}

			// 	filters['status'] = {
			// 		$in: arrayOfStatus,
			// 	}
			// }

			const productDetails = await productsData.findAllProducts(page, limit, search, filters)
			if (productDetails[0] && productDetails[0].data.length == 0 && search !== '') {
				return common.failureResponse({
					message: apiResponses.PRODUCT_NOT_FOUND,
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
					result: [],
				})
			}

			if (productDetails[0] && productDetails[0].data.length > 0) {
				await Promise.all(
					productDetails[0].data.map(async (product) => {
						if (product.images && product.images.length > 0) {
							product.images = product.images.map(async (imgPath) => {
								if (imgPath && imgPath != '') {
									return await utilsHelper.getDownloadableUrl(imgPath)
								}
							})
							product.images = await Promise.all(product.images)
						}
					})
				)
			}

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: apiResponses.PRODUCT_FETCHED_SUCCESSFULLY,
				result: productDetails[0] ? productDetails[0] : [],
			})
		} catch (error) {
			throw error
		}
	}
}
