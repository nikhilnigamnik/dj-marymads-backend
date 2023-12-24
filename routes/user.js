/** @format */

const router = require('express').Router();
const { auth } = require('../middlewares/auth');
const {
	GetProfile,
	UpdateProfile,
	UpdatePassword,
	GetNotification,
	GetBundles,
	GetBundleById,
	GetMyPlaylist,
	GetMyQueue,
	AddRemovePlaylist,
	AddRemoveQueue,
	BuyPlan,
	myPayments,
	paymentSheet,
	GetPlans,
	request,
} = require('../controllers/userController');

router.route('/getProfile').get(auth, GetProfile);
router.route('/updateProfile').post(auth, UpdateProfile);
router.route('/updatePassword').post(auth, UpdatePassword);

router.route('/notifications').get(auth, GetNotification);

router.route('/bundles').get(auth, GetBundles);
router.route('/bundle/:id').get(auth, GetBundleById);
router.route('/myPlaylist').get(auth, GetMyPlaylist);
router.route('/myQueue').get(auth, GetMyQueue);
router.route('/addRemovePlaylist').post(auth, AddRemovePlaylist);
router.route('/addRemoveQueue').post(auth, AddRemoveQueue);

router.route('/plans').get(GetPlans);
router.route('/paymentSheet').post(auth, paymentSheet);
router.route('/buyPlan').post(auth, BuyPlan);
router.route('/payments').get(auth, myPayments);

router.route('/request').post(auth, request);

module.exports = router;
