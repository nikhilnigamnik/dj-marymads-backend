/** @format */

const mongoose = require('mongoose');

const QueueSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		songs: { type: [mongoose.Schema.Types.ObjectId] },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Queue', QueueSchema);
