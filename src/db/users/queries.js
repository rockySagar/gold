/**
 * name : models/users/query
 * author : Rakesh
 * Date : 07-Oct-2021
 * Description : Users database operations
 */

// Dependencies
const ObjectId = require('mongoose').Types.ObjectId
const Users = require('./model')

module.exports = class UsersData {
	static findOne(filter, projection = {}) {
		return new Promise(async (resolve, reject) => {
			try {
				const userData = await Users.findOne(filter, projection).lean()
				resolve(userData)
			} catch (error) {
				reject(error)
			}
		})
	}

	static find(filter) {
		return new Promise(async (resolve, reject) => {
			try {
				const userData = await Users.findOne(filter)
				resolve(userData)
			} catch (error) {
				reject(error)
			}
		})
	}

	static count(filter, projection = {}) {
		return new Promise(async (resolve, reject) => {
			try {
				const userData = await Users.count(filter)
				resolve(userData)
			} catch (error) {
				reject(error)
			}
		})
	}

	static findAllUsers(filter, projection = {}) {
		return new Promise(async (resolve, reject) => {
			try {
				const usersData = await Users.find(filter, projection)
				resolve(usersData)
			} catch (error) {
				reject(error)
			}
		})
	}

	static createUser(data) {
		return new Promise(async (resolve, reject) => {
			try {
				await new Users(data).save()
				resolve(true)
			} catch (error) {
				reject(error)
			}
		})
	}

	static updateOneUser(filter, update, options = {}) {
		return new Promise(async (resolve, reject) => {
			try {
				const res = await Users.updateOne(filter, update, options)
				if ((res.n === 1 && res.nModified === 1) || (res.matchedCount === 1 && res.modifiedCount === 1)) {
					resolve(true)
				} else {
					resolve(false)
				}
			} catch (error) {
				reject(error)
			}
		})
	}

	static searchUsers(page, limit, search, filters, type) {
		return new Promise(async (resolve, reject) => {
			try {
				let users = await Users.aggregate([
					{
						$match: {
							$and: [filters, { deleted: false, isAdmin: false }],
							$or: [
								{ userId: new RegExp(search, 'i') },
								{ name: new RegExp(search, 'i') },
								{ 'mobile.number': new RegExp(search) },
							],
						},
					},
					{
						$project: {
							mobile: 1,
							organisationId: 1,
							status: 1,
							name: 1,
							image: 1,
							areasOfExpertise: 1,
							type: 1,
							userId: 1,
							address: 1,
							aadharNumber: 1,
						},
					},
					{
						$sort: { name: 1 },
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
				]).collation({ locale: 'en', caseLevel: false })

				return resolve(users)
			} catch (error) {
				return reject(error)
			}
		})
	}
	static async listUsers(type, page, limit, search) {
		try {
			// let isAMentorFlag = true
			// if (type === 'mentor') {
			// 	isAMentorFlag = true
			// } else if (type === 'mentee') {
			// 	isAMentorFlag = false
			// }
			let users = await Users.aggregate([
				{
					$match: {
						deleted: false,
						// isAMentor: isAMentorFlag,
						$or: [{ name: new RegExp(search, 'i') }],
					},
				},
				{
					$project: {
						name: 1,
						userId: 1,
						address: 1,
						image: 1,
						areasOfExpertise: 1,
						aadharNumber: 1,
					},
				},
				{
					$sort: { name: 1 },
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
			]).collation({ locale: 'en', caseLevel: false })

			return users
		} catch (error) {
			return error
		}
	}
}
