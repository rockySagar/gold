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
	items: [
		{
			name: { type: String, required: true },
			description: { type: String },
			qty: { type: Number, required: true },
			grossWeight: { type: Number, required: true },
			image: { type: String, required: false },
			purity: { type: String, required: true },
			netWeight: { type: String, required: true },
			caret: { type: String, required: true },
		},
	],
	installments: [
		{
			amount: { type: Number, required: true },
			paidAt: { type: String, required: true },
			prinicpleAmountDeducted: { type: String, required: true },
			interestDeducted: { type: String, required: true },
			balance: { type: String, required: true },
			days: { type: Number },
		},
	],
	interestBalance: { type: String, default: 0 },
	lastPaid: { type: String },
	balance: { type: String, required: true },
	terms: { type: Number, required: true },
	loanAmount: { type: Number, required: true },
	intrestRate: { type: Number, required: true },
	customerId: { type: mongoose.Types.ObjectId, required: true },
	userId: {
		type: mongoose.Types.ObjectId,
		index: true,
	},
	disbursementType: { type: String, required: true },
	disbursementAt: { type: String, required: true },
	dueDate: { type: String, required: true },
	tax: {
		type: Object,
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

const products = db.model('contract', contractSchema)
module.exports = products
