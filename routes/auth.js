/** @format */

const router = require('express').Router();
const {
	UserLogin,
	UserSignup,
	Activate,
	ResendOtp,
	SocialLogin,
	ForgetPassword,
	VerifyCode,
	ResetPassword,
} = require('../controllers/authController');

router.route('/login').post(UserLogin);
router.route('/signup').post(UserSignup);
router.route('/resend').post(ResendOtp);
router.route('/activate').post(Activate);

router.route('/socialLogin').post(SocialLogin);

router.route('/forgetpassword').post(ForgetPassword);
router.route('/verifyCode').post(VerifyCode);
router.route('/resetpassword').post(ResetPassword);

module.exports = router;
