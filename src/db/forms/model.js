/**
 * name : db/forms/model
 * author : Rakesh Kumar
 * Date : 03-Nov-2021
 * Description : Forms schema
 */

// Dependencies
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const formSchema = new Schema({
	type: {
		type: String,
		required: true,
	},
	subType: {
		type: String,
		required: true,
	},
	action: {
		type: String,
		required: true,
	},
	ver: {
		type: String,
		required: true,
	},
	data: {
		templateName: {
			type: String,
			required: true,
		},
		fields: {
			type: Object,
			required: true,
		},
	},
})

const Forms = db.model('forms', formSchema)

module.exports = Forms
