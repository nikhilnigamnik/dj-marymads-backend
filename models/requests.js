/** @format */

const mongoose = require('mongoose');

const RequestsSchema = new mongoose.Schema(
	{
		name: String,
		description: String,
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Requests', RequestsSchema);
