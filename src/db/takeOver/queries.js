/**
 * name : models/sessions/queries
 * author : Rakesh
 * Date : 07-Oct-2021
 * Description : TakeOver database operations
 */

const TakeOver = require('./model')

module.exports = class TakeOverData {
	static create(data) {
		return new Promise(async (resolve, reject) => {
			try {
				let response = await new TakeOver(data).save()
				resolve(response)
			} catch (error) {
				reject(error)
			}
		})
	}

	static updateOne(filter, update, options = {}) {
		return new Promise(async (resolve, reject) => {
			try {
				const updateResponse = await TakeOver.update(filter, update, options)

				console.log('updateResponse', filter, '---', update)
				if (
					(updateResponse.n === 1 && updateResponse.nModified === 1) ||
					(updateResponse.matchedCount === 1 && updateResponse.modifiedCount === 1)
				) {
					resolve('TAKEOVER_UPDATED')
				} else if (
					(updateResponse.n === 1 && updateResponse.nModified === 0) ||
					(updateResponse.matchedCount === 1 && updateResponse.modifiedCount === 0)
				) {
					resolve('TAKEOVER_ALREADY_UPDATED')
				} else {
					resolve('TAKEOVER_NOT_FOUND')
				}
			} catch (error) {
				reject(error)
			}
		})
	}

	static findOne(filter, projection = {}) {
		return new Promise(async (resolve, reject) => {
			try {
				const takeOverData = await TakeOver.findOne(filter, projection).lean()
				resolve(takeOverData)
			} catch (error) {
				reject(error)
			}
		})
	}

	static findById(id) {
		return new Promise(async (resolve, reject) => {
			try {
				const session = await TakeOver.findOne({ _id: id, deleted: false, status: { $ne: 'cancelled' } }).lean()
				resolve(session)
			} catch (error) {
				reject(error)
			}
		})
	}

	static findAll(page, limit, search, filters) {
		return new Promise(async (resolve, reject) => {
			try {
				let takeOverData = await TakeOver.aggregate([
					{
						$match: {
							$and: [filters, { deleted: false }],
							$or: [{ name: new RegExp(search, 'i') }],
						},
					},
					{
						$sort: { _id: -1 },
					},
					{
						$project: {
							_id: 1,
							name: 1,
							items: 1,
							balence: 1,
							installments: 1,
							loanAmount: 1,
							intrestRate: 1,
							customerId: 1,
							disbursementType: 1,
							tax: 1,
							disbursementAt: 1,
							status: 1,

							//  price: 1,
							//  description: 1,
							//  categories: 1,
							//  unit: 1,
							//  status: 1,
							//  images: 1,
							//  inStock: 1,
							//  userId: 1,
						},
					},
					{
						$facet: {
							totalCount: [{ $count: 'count' }],
							data: [{ $skip: limit * (page - 1) }, { $limit: limit }],
						},
					},
					{
						$project: {
							data: 1,
							count: {
								$arrayElemAt: ['$totalCount.count', 0],
							},
						},
					},
				])
				resolve(takeOverData)
			} catch (error) {
				reject(error)
			}
		})
	}

	static find(filter, projection = {}) {
		return new Promise(async (resolve, reject) => {
			try {
				let takeOverData = await TakeOver.find(filter, projection).lean()
				resolve(takeOverData)
			} catch (error) {
				reject(error)
			}
		})
	}
	static count(filter) {
		return new Promise(async (resolve, reject) => {
			try {
				const count = await TakeOver.countDocuments(filter)
				resolve(count)
			} catch (error) {
				reject(error)
			}
		})
	}

	static update(filter, update, options = {}) {
		return new Promise(async (resolve, reject) => {
			try {
				const updateResponse = await TakeOver.update(filter, update, options)

				if (
					(updateResponse.n === 1 && updateResponse.nModified === 1) ||
					(updateResponse.matchedCount === 1 && updateResponse.modifiedCount === 1)
				) {
					resolve('TAKEOVER_UPDATED')
				} else if (
					(updateResponse.n === 1 && updateResponse.nModified === 0) ||
					(updateResponse.matchedCount === 1 && updateResponse.modifiedCount === 0)
				) {
					resolve('TAKEOVER_ALREADY_UPDATED')
				} else {
					resolve('TAKEOVER_NOT_FOUND')
				}
			} catch (error) {
				reject(error)
			}
		})
	}
}
