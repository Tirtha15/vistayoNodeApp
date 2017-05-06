var express = require('express');
var router = express.Router();

var searchController = require('./../../controllers/searchController');
var inviteController = require('./../../controllers/inviteController');
var userController = require('./../../controllers/userController');

router.get('/holidays/suggest', searchController.autoComplete);
router.get('/holidays/theme/:keyword', searchController.themeSearch);
router.get('/holidays/destination/:keyword', searchController.destinationSearch);

//invite-request
router.post('/invite/request', inviteController.addRequest);
router.get('/admin/invite/request', inviteController.getRequest);
router.get('/admin/invite/request/:requestId', inviteController.getRequest);
router.delete('/admin/invite/request/:requestId', inviteController.deleteRequest);
router.post('/admin/invite/request/:requestId/send', inviteController.sendInvite);

//user registration and authentication
router.post('/user/signup', userController.signup);
router.post('/user/login', userController.login);

module.exports = router;