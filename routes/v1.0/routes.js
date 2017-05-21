var express = require('express');
var router = express.Router();

var searchController = require('./../../controllers/searchController');
var inviteController = require('./../../controllers/inviteController');
var userController = require('./../../controllers/userController');
var packageController = require('./../../controllers/packageController');

//middlewares
var isAuthenticated = require('./../../middlewares/isAuthenticated');
var isAdmin = require('./../../middlewares/isAdmin');

router.get('/holidays/suggest', searchController.autoComplete);
router.get('/holidays/theme/:keyword', searchController.themeSearch);
router.get('/holidays/destination/:keyword', searchController.destinationSearch);
router.get('/holidays/package/:packageId', packageController.packageDetails);

//invite-request
router.post('/invite/request', inviteController.addRequest);
  //admin only
router.get('/admin/invite/request',[isAuthenticated, isAdmin], inviteController.getRequest);
router.get('/admin/invite/request/:requestId', [isAuthenticated, isAdmin], inviteController.getRequest);
router.delete('/admin/invite/request/:requestId', [isAuthenticated, isAdmin], inviteController.deleteRequest);
router.post('/admin/invite/request/:requestId/send', [isAuthenticated, isAdmin], inviteController.sendInvite);

//user registration and authentication
router.post('/user/signup', userController.signup);
router.post('/user/login', userController.login);
router.post('/user/logout', [isAuthenticated], userController.logout);
  //admin only
router.post('/admin/signup', [isAuthenticated, isAdmin], userController.adminSignup);

//individual user
router.get('/me', [isAuthenticated], userController.me);

module.exports = router;