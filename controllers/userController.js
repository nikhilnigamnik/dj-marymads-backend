/** @format */

const User = require('../models/user');
const Bundle = require('../models/bundle');
const Playlist = require('../models/playlist');
const Queue = require('../models/queue');
const Plans = require('../models/plan');
const Payments = require('../models/payment');
const TempPayment = require('../models/tempPayment');
const Requests = require('../models/requests');
const Notification = require('../models/notification');
require('dotenv/config');

const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const {
	successmessage,
	errormessage,
	verifypassword,
	hashPassword,
} = require('../middlewares/util');
const user = require('../models/user');

module.exports.GetProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user).populate('bundles.bundleid');

		return res.status(200).json(successmessage('Fetched Successfuly!', user));
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

module.exports.UpdateProfile = async (req, res) => {
	try {
		if (req.body.email) {
			const user = await User.findOne({
				email: req.body.email,
				_id: { $ne: req.user },
			});
			if (user) {
				return res.status(400).json(errormessage('Email already exists'));
			}
		}
		const data = await User.findByIdAndUpdate(req.user, req.body, {
			new: true,
		});

		return res.status(200).json(successmessage('Updated Successfuly!', data));
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

module.exports.UpdatePassword = async (req, res) => {
	try {
		const user = await User.findById(req.user);
		const verify = verifypassword(req.body.password, user.password);

		if (!verify) {
			return res.status(400).json(errormessage('Invalid current password'));
		}

		user.password = hashPassword(req.body.newPassword);
		await user.save();

		return res.status(200).json(successmessage('Updated Successfuly!', user));
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

module.exports.GetNotification = async (req, res) => {
	try {
		const noti = await Notification.find({ user: req.user }).sort({
			createdAt: -1,
		});

		return res.status(200).json(successmessage('Fetched Successfuly!', noti));
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
		var limit = req.query.limit ? req.query.limit : 100;

		// const total = await Bundle.find(query).count();
		// const totalPages = Math.ceil(total / limit);
		const data = await Bundle.find(query)
			.sort({
				createdAt: -1,
			})
			.skip((page - 1) * limit)
			.limit(limit);

		let result = [];
		for (const rev of data) {
			const user = await User.findOne({
				_id: req.user,
				'bundles.bundleid': rev._id,
			});
			if (user) {
				result.push({
					...rev._doc,
					isPurchased: true,
				});
			} else {
				result.push({
					...rev._doc,
					isPurchased: true,
				});
			}
		}

		return res.status(200).json(successmessage('Fetched Successfuly!', result));
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

module.exports.GetBundleById = async (req, res) => {
	try {
		const data = await Bundle.findById(req.params.id);
		const user = await User.findOne({
			_id: req.user,
			'bundles.bundleid': req.params.id,
		});
		let result = data;
		if (user) {
			result = {
				...data._doc,
				isPurchased: true,
			};
		} else {
			result = {
				...data._doc,
				isPurchased: true,
			};
		}

		return res.status(200).json(successmessage('Fetched Successfuly!', result));
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

module.exports.AddRemovePlaylist = async (req, res) => {
	try {
		const findP = await Playlist.findOne({ user: req.user });
		if (!findP) {
			await Playlist.create({ user: req.user });
		}
		const data = await Playlist.findOne({ user: req.user });
		if (data.songs.includes(req.body.songid)) {
			data.songs = data.songs.filter(
				(e) => e.toString() !== req.body.songid.toString()
			);
		} else {
			data.songs.push(req.body.songid);
		}
		await data.save();

		return res.status(200).json(successmessage('Updated Successfuly!', data));
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

module.exports.AddRemoveQueue = async (req, res) => {
	try {
		const findP = await Queue.findOne({ user: req.user });
		if (!findP) {
			await Queue.create({ user: req.user });
		}
		const data = await Queue.findOne({ user: req.user });
		if (data.songs.includes(req.body.songid)) {
			data.songs = data.songs.filter(
				(e) => e.toString() !== req.body.songid.toString()
			);
		} else {
			data.songs.push(req.body.songid);
		}
		await data.save();

		return res.status(200).json(successmessage('Updated Successfuly!', data));
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

module.exports.GetMyPlaylist = async (req, res) => {
	try {
		var data = await Playlist.findOne({ user: req.user });
		if (!data) {
			data = await Playlist.create({ user: req.user });
		}
		var result = [];
		const all = await Playlist.findOne({ user: req.user });
		for (const rev of all.songs) {
			const bundle = await Bundle.findOne({ 'songs._id': rev });
			if (bundle) {
				for (const ele of bundle.songs) {
					if (ele._id.toString() === rev.toString()) {
						var item = ele;
						item['bundletitle'] = bundle.title;
						item['bundlecategory'] = bundle.category;
						item['thumbnail'] = bundle.thumbnail;
						result.push(item);
					}
				}
			}
		}

		return res.status(200).json(successmessage('Fetched Succesfully', result));
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

module.exports.GetMyQueue = async (req, res) => {
	try {
		var data = await Queue.findOne({ user: req.user });
		if (!data) {
			data = await Queue.create({ user: req.user });
		}
		var result = [];
		const all = await Queue.findOne({ user: req.user });
		for (const rev of all.songs) {
			const bundle = await Bundle.findOne({ 'songs._id': rev });
			if (bundle) {
				for (const ele of bundle.songs) {
					if (ele._id.toString() === rev.toString()) {
						var item = ele;
						item['bundletitle'] = bundle.title;
						item['bundlecategory'] = bundle.category;
						item['thumbnail'] = bundle.thumbnail;
						result.push(item);
					}
				}
			}
		}

		return res.status(200).json(successmessage('Fetched Succesfully', result));
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

//Payments
module.exports.GetPlans = async (req, res) => {
	try {
		const data = await Plans.find({ isActive: true });

		return res.status(200).json(successmessage('Fetched Succesfully', data));
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

module.exports.paymentSheet = async (req, res) => {
	try {
		const user = await User.findById(req.user);
		var customerId;
		if (user.stripe_cus_id) {
			customerId = user.stripe_cus_id;
		} else {
			const customer = await Stripe.customers.create({ email: user.email });
			user.stripe_cus_id = customer.id;
			await user.save();
			customerId = customer.id;
		}

		const ephemeralKey = await Stripe.ephemeralKeys.create(
			{ customer: customerId },
			{ apiVersion: '2023-10-16' }
		);
		const paymentIntent = await Stripe.paymentIntents.create({
			amount: Number(req.body.price) * 100,
			currency: 'usd',
			customer: customerId,
			automatic_payment_methods: {
				enabled: true,
			},
		});

		return res.status(200).json({
			message: 'Created Successfuly!',
			data: {
				paymentIntent: paymentIntent.client_secret,
				ephemeralKey: ephemeralKey.secret,
				customer: customerId,
			},
		});
	} catch (err) {
		return res.status(400).json({ message: err.message });
	}
};

module.exports.BuyPlan = async (req, res) => {
	try {
		const user = await User.findById(req.user);
		if (!user) {
			return res.status(200).json(errormessage('User not found'));
		}
		const plan = await Plans.findById(req.body.planId);
		if (!plan) {
			return res.status(200).json(errormessage('Plan not found'));
		}
		var lastDate = new Date();
		lastDate.setDate(lastDate.getDate() + plan.days);
		var payment = await Payments.create({
			user: req.user,
			planId: req.body.planId,
			price: req.body.price,
			days: plan.days,
			lastDate: lastDate,
			status: req.body.status,
			transactionId: req.body.paymentId,
		});

		user.bundles.push({
			lastDate: lastDate,
			bundleid: req.body.bundleId,
			planid: req.body.planId,
		});
		await user.save();

		return res.status(200).json(successmessage('Added Successfully', payment));
	} catch (err) {
		return res.status(400).json({ err });
	}
};

module.exports.myPayments = async (req, res) => {
	try {
		const payments = await Payments.find({ user: req.user }).sort({
			createdAt: -1,
		});

		return res.status(200).json({ message: 'Created Successfuly!', payments });
	} catch (err) {
		return res.status(400).json({ message: err.message });
	}
};

//Requests
module.exports.request = async (req, res) => {
	try {
		req.body.user = req.user;
		const data = await Requests.create(req.body);

		return res.status(200).json({ message: 'Submitted Successfuly!', data });
	} catch (err) {
		return res.status(400).json({ message: err.message });
	}
};
