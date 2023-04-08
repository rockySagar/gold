/**
 * name : models/sessions/schema
 * author : Rakesh Kumar
 * Date : 07-Oct-2021
 * Description : Sessions schema data
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

let contractSchema = new Schema({
	organisationId: { type: mongoose.Types.ObjectId, required: true },
	name: String,
	installments: [
		{
			amount: { type: Number, required: true },
			paidAt: { type: String, required: true },
		},
	],
	balance: { type: Number },
	terms: { type: Number },
	customerId: { type: mongoose.Types.ObjectId, required: true },
	userId: {
		type: mongoose.Types.ObjectId,
		index: true,
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
})

const products = db.model('savings', contractSchema)
module.exports = products
