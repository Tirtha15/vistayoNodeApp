var express = require('express');
var router = express.Router();

var searchController = require('./../../controllers/searchController');
var inviteController = require('./../../controllers/inviteController');

router.get('/holidays/suggest', searchController.autoComplete);
router.get('/holidays/theme/:keyword', searchController.themeSearch);
router.get('/holidays/destination/:keyword', searchController.destinationSearch);

router.post('/request-invite', inviteController.addRequest);
router.get('/request-invite', inviteController.allRequest);

module.exports = router;