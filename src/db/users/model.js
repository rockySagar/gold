/**
 * name : db/users/model
 * author : Rakesh
 * Date : 07-Oct-2021
 * Description : User schema data
 */

// Dependencies
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
	organisationId: {
		type: mongoose.Types.ObjectId,
		index: true,
		required: true,
	},
	password: String,
	mobile: {
		number: {
			type: String,
			index: {
				unique: true,
			},
			required: true,
		},
		verified: {
			type: Boolean,
			default: false,
		},
	},
	email: {
		type: String,
		required: false,
	},
	name: {
		type: String,
		required: false,
	},
	lastName: {
		type: String,
		required: false,
	},
	gender: String,
	about: String,
	areasOfExpertise: [{ value: String, label: String }],
	image: String,
	experience: String,
	lastLoggedInAt: Date,
	isAdmin: {
		type: Boolean,
		default: false,
		index: true,
	},
	hasAcceptedTAndC: {
		type: Boolean,
		default: false,
	},
	deleted: {
		type: Boolean,
		default: false,
		required: true,
	},
	refreshTokens: [{ token: String, exp: Number }],
	otpInfo: {
		otp: Number,
		exp: Number,
	},
	languages: [{ value: String, label: String }],
	rating: {
		type: Object,
	},
	type:{
		type: String,
		required: false,
		default: "customer"
	}
})

const Users = db.model('users', userSchema)

module.exports = Users
