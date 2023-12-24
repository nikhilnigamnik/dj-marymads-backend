const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
	{
		name: {
			type: String,
		},
		password: {
			type: String,
		},
		email: {
			type: String,
		},
		number: {
			type: String,
		},
		role: { type: String },
		code: { type: Number },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Admin", AdminSchema);
