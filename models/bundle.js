/** @format */

const mongoose = require('mongoose');

const BundleSchema = new mongoose.Schema(
	{
		title: String,
		thumbnail: String,
		category: [String],
		songs: [
			{
				title: String,
				audio: String,
			},
		],
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Bundle', BundleSchema);
