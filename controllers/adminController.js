/** @format */

require('dotenv/config');
const Admin = require('../models/admin');
const User = require('../models/user');
const Payments = require('../models/payment');
const Bundle = require('../models/bundle');
const Plans = require('../models/plan');
const Requests = require('../models/requests');
const {
	generateToken,
	successmessage,
	errormessage,
} = require('../middlewares/util');

const AWS = require('aws-sdk');

AWS.config.update({
	accessKeyId: process.env.awsKey,
	secretAccessKey: process.env.awsSecret,
});

let s3 = new AWS.S3();

module.exports.Login = async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await Admin.findOne({ email: email });

		if (!user) {
			return res.status(400).json(errormessage('Admin does not exists'));
		}

		if (user.password !== password) {
			return res.status(400).json(errormessage('Invalid Credentials'));
		}

		const token = generateToken({ id: user._id });
		var data = { token, user };

		return res.status(200).json(successmessage('Login Successfuly!', data));
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

module.exports.dashboard = async (req, res) => {
	try {
		var totalUser = await User.countDocuments();
		var totalBundles = await Bundle.countDocuments();
		var payments = await Payments.find();
		var totalRevenue = 0;
		for (const rev of payments) {
			totalRevenue += rev.price;
		}

		var data = {
			totalUser,
			totalRevenue,
			totalBundles,
		};

		return res.status(200).json(successmessage('Fetched Successfuly!', data));
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

module.exports.getUsers = async (req, res) => {
	try {
		var query = {};
		if (req.query.name) {
			query['name'] = { $regex: req.body.name, $options: 'i' };
		}
		if (req.query.date) {
			var startDate = new Date(req.query.date);
			startDate.setDate(startDate.getDate() - 1);
			var endDate = new Date(req.query.date);
			endDate.setDate(endDate.getDate() + 1);

			query['createdAt'] = { $gt: startDate, $lt: endDate };
		}

		var page = req.query.query ? req.query.page : 1;
		var limit = req.query.limit ? req.query.limit : 15;

		const total = await User.find(query).count();
		const totalPages = Math.ceil(total / limit);
		const details = await User.find(query)
			.skip((page - 1) * limit)
			.limit(limit);

		var data = {
			totalPages,
			details,
		};

		return res.status(200).json(successmessage('Fetched Successfuly!', data));
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

module.exports.manageUser = async (req, res) => {
	try {
		const data = await User.findByIdAndUpdate(req.body.id, req.body, {
			new: true,
		});

		return res.status(200).json(successmessage('Updated Successfuly!', data));
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

module.exports.deleteUser = async (req, res) => {
	try {
		const data = await User.findByIdAndDelete(req.params.id);

		return res.status(200).json(successmessage('Deleted Successfuly!', data));
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

module.exports.GetPayments = async (req, res) => {
	try {
		var query = {};
		if (req.query.name) {
			query['name'] = { $regex: req.body.name, $options: 'i' };
		}
		if (req.query.date) {
			var startDate = new Date(req.query.date);
			startDate.setDate(startDate.getDate() - 1);
			var endDate = new Date(req.query.date);
			endDate.setDate(endDate.getDate() + 1);

			query['createdAt'] = { $gt: startDate, $lt: endDate };
		}

		var page = req.query.query ? req.query.page : 1;
		var limit = req.query.limit ? req.query.limit : 15;

		const total = await Payments.find(query).count();
		const totalPages = Math.ceil(total / limit);
		const details = await Payments.find(query)
			.sort({
				createdAt: -1,
			})
			.skip((page - 1) * limit)
			.limit(limit)
			.populate('user');

		var data = {
			totalPages,
			details,
		};

		return res.status(200).json(successmessage('Fetched Successfuly!', data));
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

module.exports.GetBundles = async (req, res) => {
	try {
		var query = {};
		if (req.query.name) {
			query['name'] = { $regex: req.body.name, $options: 'i' };
		}
		if (req.query.category) {
			query['category'] = req.body.category;
		}
		if (req.query.date) {
			var startDate = new Date(req.query.date);
			startDate.setDate(startDate.getDate() - 1);
			var endDate = new Date(req.query.date);
			endDate.setDate(endDate.getDate() + 1);

			query['createdAt'] = { $gt: startDate, $lt: endDate };
		}

		var page = req.query.query ? req.query.page : 1;
		var limit = req.query.limit ? req.query.limit : 15;

		const total = await Bundle.find(query).count();
		const totalPages = Math.ceil(total / limit);
		const details = await Bundle.find(query)
			.sort({
				createdAt: -1,
			})
			.skip((page - 1) * limit)
			.limit(limit);

		var data = {
			totalPages,
			details,
		};

		return res.status(200).json(successmessage('Fetched Successfuly!', data));
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

module.exports.bundleById = async (req, res) => {
	try {
		const data = await Bundle.findById(req.params.id);

		return res.status(200).json(successmessage('Fetched Succesfully', data));
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

module.exports.addBundle = async (req, res) => {
	try {
		const data = await Bundle.create(req.body);

		return res.status(200).json(successmessage('Added Successfuly!', data));
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

module.exports.manageBundle = async (req, res) => {
	try {
		const data = await Bundle.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});

		return res.status(200).json(successmessage('Updated Successfuly!', data));
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

module.exports.deleteBundle = async (req, res) => {
	try {
		const data = await Bundle.findByIdAndDelete(req.params.id);

		return res.status(200).json(successmessage('Updated Successfuly!', data));
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

module.exports.UploadAudio = async (req, res) => {
	try {
		let result = [];
		if (req.files) {
			for (const rev of req.files) {
				const fileExtension = rev.originalname.split('.').pop().toLowerCase();

				if (fileExtension !== 'wav' && fileExtension !== 'mp3') {
					return res
						.status(400)
						.json(errormessage('Only .mp3 and .wav is allowed.'));
				}
			}
			for (const rev of req.files) {
				var date = new Date().toISOString();
				const params = {
					Bucket: process.env.awsBucket,
					Key: 'song/' + date + rev.originalname,
					Body: rev.buffer,
					ACL: 'public-read',
				};

				// Uploading files to the bucket
				const { Location } = await s3.upload(params).promise();
				result.push({ filename: rev.originalname, link: Location });
			}
			return res
				.status(200)
				.json(successmessage('Uploaded Successfuly!', result));
		} else {
			return res.status(400).json(errormessage('Files are required'));
		}
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

module.exports.UploadInlay = async (req, res) => {
	try {
		let result = [];
		if (req.files) {
			for (const rev of req.files) {
				const fileExtension = rev.originalname.split('.').pop().toLowerCase();

				if (
					fileExtension !== 'png' &&
					fileExtension !== 'jpg' &&
					fileExtension !== 'jpeg'
				) {
					return res
						.status(400)
						.json(errormessage('Only .png, .jpg and .jpeg is allowed.'));
				}
			}
			for (const rev of req.files) {
				var date = new Date().toISOString();
				const params = {
					Bucket: process.env.awsBucket,
					Key: 'inlay/' + date + rev.originalname,
					Body: rev.buffer,
					ACL: 'public-read',
				};

				// Uploading files to the bucket
				const { Location } = await s3.upload(params).promise();
				result.push({ filename: rev.originalname, link: Location });
			}
			return res
				.status(200)
				.json(successmessage('Uploaded Successfuly!', result));
		} else {
			return res.status(400).json(errormessage('Files are required'));
		}
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

module.exports.AddPlan = async (req, res) => {
	try {
		var plan = await Plans.findOne({ name: req.body.name });
		if (plan) {
			return res
				.status(400)
				.json(errormessage('Plan with this name already exists.'));
		}

		const data = await Plans.create(req.body);

		return res.status(200).json(successmessage('Added Succesfully', data));
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

module.exports.GetPlans = async (req, res) => {
	try {
		const data = await Plans.find();

		return res.status(200).json(successmessage('Fetched Succesfully', data));
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

module.exports.GetPlanById = async (req, res) => {
	try {
		const data = await Plans.findById(req.params.id);

		return res.status(200).json(successmessage('Fetched Succesfully', data));
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

module.exports.UpdatePlan = async (req, res) => {
	try {
		const data = await Plans.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});

		return res.status(200).json(successmessage('Updated Succesfully', data));
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

module.exports.DeletePlan = async (req, res) => {
	try {
		const data = await Plans.findByIdAndDelete(req.params.id);

		return res.status(200).json(successmessage('Deleted Succesfully', data));
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

module.exports.request = async (req, res) => {
	try {
		var page = req.query.query ? req.query.page : 1;
		var limit = req.query.limit ? req.query.limit : 15;

		const total = await Requests.find().count();
		const totalPages = Math.ceil(total / limit);
		const details = await Requests.find()
			.sort({ createdAt: -1 })
			.skip((page - 1) * limit)
			.limit(limit)
			.populate('user');

		var data = {
			totalPages,
			details,
		};

		return res.status(200).json({ message: 'Fetched Successfuly!', data });
	} catch (err) {
		return res.status(400).json({ message: err.message });
	}
};
