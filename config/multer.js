const multer = require("multer");

const storage = multer.memoryStorage({
	destination: function (req, file, callback) {
		callback(null, "");
	},
});

const uploadMedia = multer({ storage });

module.exports = uploadMedia;
