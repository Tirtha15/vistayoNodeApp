var utils = require('./../services/utils');

var mongoDb = require('./../config/db').mongo;

var inviteController = {
    addRequest: function(req, res){
        if(!req.body.emailId || !req.body.mobile)
          return res.badRequest({
              code: 'BAD_REQUEST',
              msg: "Invalid request body. Mandatory Fields missing"
          });

        if(req.body.mobile && req.body.mobile.length !== 10)
          return res.badRequest({
              code: 'BAD_REQUEST',
              msg: 'Invalid mobile number'
          });

        if(req.body.emailId && !utils.validateEmail(req.body.emailId))
            return res.badRequest({
                code: 'BAD_REQUEST',
                msg: 'Invalid email'
            });

        var inviteRequest = mongoDb.get('inviteRequest');

        var toInsert = {
            uuid: utils.uuid(),
            email: req.body.emailId,
            mobile: req.body.mobile,
            status: 'pending'
        };

        inviteRequest.insert(toInsert, function(err, request){
            if(err){
                return res.serverError(err);
            }

            return res.created(request);
        });
    },

    allRequest: function(req, res){
        var inviteRequest = mongoDb.get('inviteRequest');

        inviteRequest.find({},{}, function(err, requests){
            if(err)
              return res.serverError(err);
            return res.ok(requests);
        });
    }
};

module.exports = inviteController;