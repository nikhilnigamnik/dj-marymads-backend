/** @format */

const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		lastDate: String,
		price: Number,
		days: { type: Number, default: 0 },
		planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
		transactionId: String,
		paymentIntent: String,
		status: String,
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Payments', PaymentSchema);
