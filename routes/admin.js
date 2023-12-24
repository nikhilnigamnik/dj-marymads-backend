/** @format */

const router = require('express').Router();
const { admin } = require('../middlewares/auth');
const uploadMedia = require('../config/multer');
const {
	Login,
	dashboard,
	getUsers,
	manageUser,
	deleteUser,
	GetBundles,
	bundleById,
	addBundle,
	GetPayments,
	manageBundle,
	deleteBundle,
	UploadAudio,
	UploadInlay,
	GetPlans,
	GetPlanById,
	AddPlan,
	UpdatePlan,
	DeletePlan,
	request,
} = require('../controllers/adminController');

router.route('/login').post(Login);

router.route('/dashboard').get(admin, dashboard);
router.route('/users').get(admin, getUsers);
router.route('/manageUser').post(admin, manageUser);
router.route('/deleteUser/:id').delete(admin, deleteUser);

router.route('/payments').get(admin, GetPayments);

router.route('/bundles').get(admin, GetBundles);
router.route('/bundle').post(admin, addBundle);
router
	.route('/bundle/:id')
	.get(admin, bundleById)
	.patch(admin, manageBundle)
	.delete(admin, deleteBundle);

router
	.route('/uploadAudio')
	.post(admin, uploadMedia.array('file'), UploadAudio);
router
	.route('/uploadThumbnail')
	.post(admin, uploadMedia.array('file'), UploadInlay);

router.route('/plans').get(admin, GetPlans);
router.route('/plan').post(admin, AddPlan);
router
	.route('/plan/:id')
	.get(admin, GetPlanById)
	.patch(admin, UpdatePlan)
	.delete(admin, DeletePlan);

router.route('/request').get(admin, request);

module.exports = router;
