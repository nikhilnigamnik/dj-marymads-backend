/** @format */

const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema(
	{
		name: String,
		days: { type: Number, default: 3 },
		description: { type: String },
		features: { type: [String] },
		price: Number,
		isActive: { type: Boolean, default: true },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Plan', PlanSchema);
