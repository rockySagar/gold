/**
 * name : models/sessions/schema
 * author : Rakesh Kumar
 * Date : 07-Oct-2021
 * Description : Sessions schema data
 */

 const mongoose = require('mongoose')
const { stringify } = require('uuid')
 const Schema = mongoose.Schema
 
 let orgSchema = new Schema({
     name: String,
     description:String,
     status: {
         type: String,
         index: true,
         default: 'active',
     },
     mobile:String,
     address:String,
     gstNo:String,
     deleted: {
         type: Boolean,
         default: false,
     },
     images:{
         type: String
     }
 })
 
 
 const products = db.model('organisation', orgSchema)
 module.exports = products
 