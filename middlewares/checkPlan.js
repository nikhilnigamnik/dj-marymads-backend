/** @format */

const User = require('../models/user');
const Plans = require('../models/plan');

const { successmessage, errormessage } = require('./util');

exports.checkPlan = async (req, res, next) => {
	const user = await User.findById(req.user);
	if (user.isExpired === false) {
		return res
			.status(400)
			.json(errormessage('User does not have any active plan.'));
	}
	next();
};
