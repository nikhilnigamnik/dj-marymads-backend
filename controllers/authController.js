/** @format */

const User = require('../models/user');
const tempUsers = require('../models/tempUser');
const nodemailer = require('nodemailer');
const {
	successmessage,
	generateToken,
	hashPassword,
	verifypassword,
	errormessage,
} = require('../middlewares/util');

module.exports.UserSignup = async (req, res) => {
	try {
		const user3 = await tempUsers.findOne({ email: req.body.email });
		if (user3) await tempUsers.findOneAndDelete({ email: req.body.email });

		const user1 = await User.findOne({ email: req.body.email });
		if (user1) {
			return res.status(400).json('User with this Email already exists!');
		}

		const hashpassword = hashPassword(req.body.password);

		var code = Math.floor(10000 + Math.random() * 9000);

		const addTempUser = await tempUsers.create({
			email: req.body.email,
			name: req.body.name,
			password: hashpassword,
			code: code,
		});

		const msg = {
			to: req.body.email,
			from: process.env.EMAIL_USERNAME,
			subject: 'Account Activation',
			html: `<p>Hi!</p><br><p>You are almost done! Your verification code is ${code}.</p>`,
		};

		let transport = nodemailer.createTransport({
			pool: true,
			host: 'smtp.gmail.com',
			port: 465,
			service: 'gmail',
			secure: false,
			auth: {
				user: process.env.EMAIL_USERNAME,
				pass: process.env.EMAIL_PASSWORD,
			},
		});

		transport.sendMail(msg, (err) => {
			if (err) {
				return res.status(400).json(err);
			} else {
				return res.json({
					message: 'Account Activation Mail Sent!',
					user: { _id: addTempUser._id },
				});
			}
		});
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

module.exports.ResendOtp = async (req, res) => {
	try {
		var code = Math.floor(10000 + Math.random() * 9000);
		const tempUser = await tempUsers.findById(req.body.id);

		if (!tempUser) return res.status(400).json('Register Again');

		tempUser.code = code;
		await tempUser.save({ validateBeforeSave: false });

		const msg = {
			to: tempUser.email,
			from: process.env.EMAIL_USERNAME,
			subject: 'Account Activation',
			html: `<p>Hi!</p><br><p>You are almost done! Your verification code is ${code}.</p>`,
		};
		let transport = nodemailer.createTransport({
			pool: true,
			host: 'smtp.gmail.com',
			port: 465,
			secure: true,
			auth: {
				user: process.env.EMAIL_USERNAME,
				pass: process.env.EMAIL_PASSWORD,
			},
		});

		transport.sendMail(msg, (err, info) => {
			if (err) {
				return res.status(400).json(err);
			} else {
				return res.status(200).json({ message: 'Code Resend', tempUser });
			}
		});
	} catch (error) {
		res.status(400).json('There was some error! Please try again');
	}
};

module.exports.Activate = async (req, res) => {
	try {
		const tempUser = await tempUsers.findById(req.body.id);

		if (!tempUser) return res.status(400).json('Code Expires');

		if (tempUser.code !== req.body.code)
			return res.status(400).json('Invalid Code');

		const addUser = await User.create({
			email: tempUser.email,
			name: tempUser.name,
			password: tempUser.password,
		});

		await tempUsers.findByIdAndDelete(req.body.id);
		const token = generateToken({ id: addUser._id });

		return res.json(
			successmessage('Account Activated!', {
				token: token,
				user: addUser,
			})
		);
	} catch (error) {
		res.status(400).json('There was some error! Please try again');
	}
};

module.exports.UserLogin = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email: email });
		if (!user) {
			return res.status(400).json(errormessage('User does not exists'));
		}
		if (user.isBlock === true) {
			return res
				.status(400)
				.json(errormessage(`Access blocked, contact admin`));
		}

		if (!user.password) {
			return res.status(400).json(errormessage('Invalid Credentials'));
		}
		const verify = verifypassword(password, user.password);

		if (!verify) {
			return res.status(400).json(errormessage('Invalid Credentials'));
		}

		const token = generateToken({ id: user._id });

		return res.status(200).json(
			successmessage('Logged In Successfuly!', {
				token: token,
				user: user,
			})
		);
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

//Social
module.exports.SocialLogin = async (req, res) => {
	try {
		const { email, name, profile, provider } = req.body;
		var user = await User.findOne({ email: email, provider: provider });
		if (user) {
			if (user.isBlock === true) {
				return res
					.status(400)
					.json(errormessage(`Access blocked, contact admin`));
			}
			const token = generateToken({ id: user._id });

			return res.status(200).json(
				successmessage('Logged In Successfuly!', {
					token: token,
					user: user,
				})
			);
		}

		user = await User.create({
			email: email,
			name: name,
			profile: profile,
			provider: provider,
		});

		const token = generateToken({ id: user._id });

		return res.status(200).json(
			successmessage('Logged In Successfuly!', {
				token: token,
				user: user,
			})
		);
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

//forget password
module.exports.ForgetPassword = async (req, res) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email: email });

		if (!user) {
			return res.status(400).json(errormessage('User does not exists'));
		}

		if (user.provider !== 'email') {
			return res
				.status(400)
				.json(errormessage('User created using social account'));
		}

		var code = Math.floor(10000 + Math.random() * 9000);
		user.code = code;
		await user.save({ validateBeforeSave: false });

		var mailOptions = {
			from: process.env.EMAIL_USERNAME,
			to: req.body.email,
			subject: 'Verification Code - Reset Your Password',
			html: `<p>Hi!</p><br><p>You are almost done! Your verification code is ${code}.</p>`,
		};
		let transport = nodemailer.createTransport({
			pool: true,
			host: 'smtp.gmail.com',
			port: 465,
			secure: true,
			auth: {
				user: process.env.EMAIL_USERNAME,
				pass: process.env.EMAIL_PASSWORD,
			},
		});
		transport.sendMail(mailOptions, function (error, info) {
			if (error) {
				console.log(error);
				return res.status(400).json({ error });
			} else {
				console.log('Email sent: ' + info.response);
				return res.status(200).json(successmessage('Email Sent', email));
			}
		});
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

module.exports.VerifyCode = async (req, res) => {
	try {
		const { code, email } = req.body;

		if (!code) {
			return res.status(400).json(errormessage('Code is required'));
		}

		const user = await User.findOne({ email: email });

		if (!user) {
			return res.status(400).json(errormessage('User not found'));
		}

		if (code === user.code) {
			return res
				.status(200)
				.json(successmessage('Verification Successful', code));
		}
		return res.status(400).json(errormessage('Invalid Code'));
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};

module.exports.ResetPassword = async (req, res) => {
	try {
		const { password, email } = req.body;

		const user = await User.findOne({ email: email });

		if (!user) {
			return res.status(400).json(errormessage('User not found'));
		}

		user.password = hashPassword(password);
		await user.save({ validateBeforeSave: false });
		return res
			.status(200)
			.json(successmessage('Password Reset Successful', user));
	} catch (err) {
		return res.status(400).json(errormessage(err.message));
	}
};
