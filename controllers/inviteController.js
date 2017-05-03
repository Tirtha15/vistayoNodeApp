var async = require('async');
var utils = require('./../services/utils');
var config = require('./../config');

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

        async.auto({
            inviteRequest: function(cb){
                inviteRequest.findOne({
                    mobile: req.body.mobile
                },{}, function(err, request){
                    if(err)
                      return cb(err);
                    console.log(request);
                    if(request)
                      return cb({
                          code: 'BAD_REQUEST',
                          msg: 'Invite request already exist for mobile:' + req.body.mobile
                      });
                    return cb();
                });
            },
            createRequest: ['inviteRequest', function(results, cb){
                var toInsert = {
                    uuid: utils.uuid(),
                    email: req.body.emailId,
                    mobile: req.body.mobile,
                    status: 'pending',
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                inviteRequest.insert(toInsert, function(err, request){
                    if(err)
                        return cb(err);
                    return cb(null, request);
                });
            }]
        }, function(err, results){
            if(err){
                if(err.code && err.code === 'NOT_FOUND'){
                    return res.notFound(err);
                }
                if(err.code && err.code === 'BAD_REQUEST'){
                    return res.badRequest(err);
                }
                return res.serverError(err);
            }

            return res.ok(results.createRequest);
        });
    },

    getRequest: function(req, res){
        var inviteRequest = mongoDb.get('inviteRequest');
        var requestId = req.params.requestId;
        var findCriteria = {};

        var from = (req.query.from && req.query.from > 0) ? parseInt(req.query.from ) : config.CONSTANTS.from;
        var limit = (req.query.limit && req.query.limit > 0) ? parseInt(req.query.limit ) : config.CONSTANTS.from;

        if(requestId){
            findCriteria.uuid = requestId;
            from = 0;
            limit = 1;
        }

        inviteRequest.find(findCriteria,{sort: {createdAt: -1}, skip: from, limit: limit}, function(err, requests){
            if(err)
              return res.serverError(err);
            if(!requests || requests.length < 1)
              return res.notFound({
                  code: 'NOT_FOUND',
                  msg: 'Invalid criteria'
              });
            return res.ok(requests);
        });
    },

    deleteRequest: function(req, res){
        var inviteRequest = mongoDb.get('inviteRequest');
        var requestId = req.params.requestId;

        inviteRequest.remove({
            uuid: requestId
        }, function(err, result){
            if(err)
              return res.serverError(err);
            if(result.result.n < 1)
              return res.notFound({
                  code: 'NOT_FOUND',
                  msg: 'Invalid uuid'
              });

            return res.noContent();
        });
    },

    sendInvite: function(req, res){
        var inviteRequest = mongoDb.get('inviteRequest');
        var requestUuid = req.params.requestId;

        async.auto({
            inviteRequest: function(cb){
                inviteRequest.findOne({
                    uuid: requestUuid
                },{}, function(err, invite){
                    if(err)
                      return cb(err);
                    if(!invite)
                      return cb({
                          code: 'NOT_FOUND',
                          msg: 'Invalid request id'
                      });

                    if(invite.status === 'completed')
                      return cb({
                          code: 'BAD_REQUEST',
                          msg: 'Invite is already completed'
                      });

                    return cb(null, invite);
                });
            },
            setRegistrationCode:['inviteRequest', function(results, cb){
                var request = results.inviteRequest;

                if(request.status === 'sent' && request.registrationCode)
                  return cb(null, request);

                var toUpdate = {};
                toUpdate.registrationCode = utils.getRandomCode(5);
                toUpdate.status = 'sent';
                toUpdate.updatedAt = new Date();

                inviteRequest.findOneAndUpdate({
                    uuid: request.uuid
                }, {
                    $set: toUpdate
                }, {}, function(err, updatedRequest){
                    if(err)
                      return cb(err);
                    return cb(null, updatedRequest);
                });
            }],
            sendCommunications:['setRegistrationCode', function(results, cb){
                //send sms,
                //send email

                return cb();
            }]
        }, function(err, results){
            if(err){
                if(err.code && err.code === 'NOT_FOUND'){
                    return res.notFound(err);
                }
                if(err.code && err.code === 'BAD_REQUEST'){
                    return res.badRequest(err);
                }
                return res.serverError(err);
            }

            return res.ok(results.setRegistrationCode);
        });
    }
};

module.exports = inviteController;