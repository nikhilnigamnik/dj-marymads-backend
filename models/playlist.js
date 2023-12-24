/** @format */

const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		songs: { type: [mongoose.Schema.Types.ObjectId] },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Playlist', PlaylistSchema);
