/** @format */

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
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
		stripe_cus_id: { type: String, default: null },
		provider: { type: String, default: 'email' },
		bundles: [
			{
				lastDate: String,
				planid: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
				bundleid: { type: mongoose.Schema.Types.ObjectId, ref: 'Bundle' },
			},
		],
		isBlock: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
