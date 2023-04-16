/**
 * name : models/sessions/schema
 * author : Rakesh Kumar
 * Date : 07-Oct-2021
 * Description : Sessions schema data
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema

let takeOverSchema = new Schema({
	organisationId: { type: mongoose.Types.ObjectId, required: true },
	name: String,
	items: [
		{
			name: { type: String, required: true },
			description: { type: String },
			qty: { type: Number, required: true },
			weight: { type: Number, required: true },
			image: { type: String, required: true },
		},
	],
	purchasedAmount: { type: Number },
	paidAt: { type: Date },
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

const products = db.model('takeover', takeOverSchema)
module.exports = products
