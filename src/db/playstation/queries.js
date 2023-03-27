/**
 * name : models/sessions/queries
 * author : Rakesh  
 * Date : 07-Oct-2021
 * Description : Playstation database operations
 */

 const Playstation = require('./model')

 module.exports = class PlaystationClass {
     static create(data) {
         return new Promise(async (resolve, reject) => {
             try {
                 let response = await new Playstation(data).save()
                 resolve(response)
             } catch (error) {
                 reject(error)
             }
         })
     }
 
     static updateOne(filter, update, options = {}) {
         return new Promise(async (resolve, reject) => {
             try {
                 const updateResponse = await Playstation.updateOne(filter, update, options)
                 if (
                     (updateResponse.n === 1 && updateResponse.nModified === 1) ||
                     (updateResponse.matchedCount === 1 && updateResponse.modifiedCount === 1)
                 ) {
                     resolve('PRODUCT_UPDATED')
                 } else if (
                     (updateResponse.n === 1 && updateResponse.nModified === 0) ||
                     (updateResponse.matchedCount === 1 && updateResponse.modifiedCount === 0)
                 ) {
                     resolve('PRODUCT_ALREADY_UPDATED')
                 } else {
                     resolve('PRODUCT_NOT_FOUND')
                 }
             } catch (error) {
                 reject(error)
             }
         })
     }
 
     static findOne(filter, projection = {}) {
         return new Promise(async (resolve, reject) => {
             try {
                 const sessionData = await Playstation.findOne(filter, projection).lean()
                 resolve(sessionData)
             } catch (error) {
                 reject(error)
             }
         })
     }
 
     static findById(id) {
         return new Promise(async (resolve, reject) => {
             try {
                 const session = await Playstation.findOne({ _id: id, deleted: false, status: { $ne: 'cancelled' } }).lean()
                 resolve(session)
             } catch (error) {
                 reject(error)
             }
         })
     }
 
     static findAll(page, limit, search, filters) {
         return new Promise(async (resolve, reject) => {
             try {
                 let sessionData = await Playstation.aggregate([
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
                             price: 1,
                             description: 1,
                             categories: 1,
                             unit: 1,
                             status: 1,
                             images: 1,
                             inStock: 1,
                             userId: 1,
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
                 resolve(sessionData)
             } catch (error) {
                 reject(error)
             }
         })
     }
 
     static find(filter, projection = {}) {
         return new Promise(async (resolve, reject) => {
             try {
                 let sessionData = await Playstation.find(filter, projection).lean()
                 resolve(sessionData)
             } catch (error) {
                 reject(error)
             }
         })
     }
     static count(filter) {
         return new Promise(async (resolve, reject) => {
             try {
                 const count = await Playstation.countDocuments(filter)
                 resolve(count)
             } catch (error) {
                 reject(error)
             }
         })
     }
 
     static update(filter, update, options = {}) {
         return new Promise(async (resolve, reject) => {
             try {
                 const updateResponse = await Playstation.update(filter, update, options)
                 if (
                     (updateResponse.n === 1 && updateResponse.nModified === 1) ||
                     (updateResponse.matchedCount === 1 && updateResponse.modifiedCount === 1)
                 ) {
                     resolve('PRODUCT_UPDATED')
                 } else if (
                     (updateResponse.n === 1 && updateResponse.nModified === 0) ||
                     (updateResponse.matchedCount === 1 && updateResponse.modifiedCount === 0)
                 ) {
                     resolve('PRODUCT_ALREADY_UPDATED')
                 } else {
                     resolve('PRODUCT_NOT_FOUND')
                 }
             } catch (error) {
                 reject(error)
             }
         })
     }
 
 }
 