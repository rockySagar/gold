/**
 * name : models/sessions/schema
 * author : Rakesh Kumar
 * Date : 07-Oct-2021
 * Description : Sessions schema data
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

let productSchema = new Schema({
	name: String,
	productId: {
		type: String,
		index: true,
		required: true,
	},
	description: String,
	recommendedFor: Array,
	categories: Array,
	price: String,
	images: Array,
	organisationId: {
		type: mongoose.Types.ObjectId,
		index: true,
		required: true,
	},
	userId: {
		type: mongoose.Types.ObjectId,
		index: true,
	},
	unit: String,
	inStock: Number,
	status: {
		type: String,
		index: true,
		default: 'published',
	},
	deleted: {
		type: Boolean,
		default: false,
	},
})

const products = db.model('products', productSchema)
module.exports = products
