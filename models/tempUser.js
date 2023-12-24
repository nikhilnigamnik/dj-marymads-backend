/** @format */

const mongoose = require('mongoose');

const TempUserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
		},
		profile: { type: String },
		password: {
			type: String,
		},
		email: {
			type: String,
		},
		password: { type: String },
		code: {
			type: String,
		},
		expireAt: {
			type: Date,
			default: Date.now,
			index: { expires: '30m' },
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('TempUser', TempUserSchema);
