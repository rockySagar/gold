/**
 * name : models/sessions/schema
 * author : Rakesh Kumar
 * Date : 07-Oct-2021
 * Description : Sessions schema data
 */

 const mongoose = require('mongoose')
const { stringify } = require('uuid')
 const Schema = mongoose.Schema
 
 let playSationSchema = new Schema({
     name: String,
     address:String,
     organisationId: {
		type: mongoose.Types.ObjectId,
		index: true,
		required: true,
	},
     status: {
         type: String,
         index: true,
         default: 'active',
     },
     
     deleted: {
         type: Boolean,
         default: false,
     },
     strength:String,
     price_hour:String,
     start:String,
     end:String
 })
 
 
 const products = db.model('playstation', playSationSchema)
 module.exports = products
 