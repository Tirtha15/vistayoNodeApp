var _ = require('underscore');
var async = require('async');
var db = require('./../config/db');
var config = require('./../config');
var mongoDb = db.mongo;


var searchController  = {
    newRequest: function(req, res){
        async.auto({
            request: function(cb){
                var request = mongoDb.get('request');

                var toInsert = req.body;
                toInsert.uuid = utils.uuid();
                toInsert.createdAt = new Date();
                toInsert.updatedAt = new Date();

                request.insert(toInsert, function(err, insertedRequest){
                    if(err)
                      return cb(err);
                    return cb(null, insertedRequest);
                });
            },
        }, function(err, results){
            if(err)
              return res.serverError(err);
            return res.created(results.request);
        });
    },

    updateRequest:function(res, res){

        var reqId = req.params.requestId;

        var toUpdate = req.body;
        toUpdate.updatedAt = new Date();

        var request = mongoDb.get('request');
        async.auto({
            request: function(cb){
                request.findOne({
                    uuid: reqId
                },{}, function(err, matchReq){
                    if(err)
                      return cb(err);

                    if(!matchReq)
                      return cb({
                          code: 'NOT_FOUND',
                          msg: 'Invalid request ID'
                      });

                    return cb(null, matchReq);
                });
            },
            updateRequest: ['request', function(results, cb){
                request.findAndModify({
                    uuid: reqId
                }, {
                    $set: toUpdate
                }, {}, function(err, updatedReq){
                    if(err)
                      return cb(err);
                    return cb(null, updatedReq);
                });
            }]
        }, function(err, results){
              if(err){
                  if(err.code && err.code === 'NOT_FOUND')
                    return res.notFound(err);

                  return res.serverError(err);
              }

              return res.send(results.updateRequest);
        });
    },

    getRequest: function(req, res) {

        var reqId = req.params.requestId;

        var findCriteria = {};

        if(req.params.requestId)
            findCriteria =  {uuid: req.params.requestId};

        var request = mongoDb.get('request');

        request.find(findCriteria, {}, function(err, requests){
            if(err)
              return res.serverError(err);

            if(!requests || requests.length < 1)
              return res.notFound({
                  code: 'NOT_FOUND',
                  msg: 'No request found'
              });

            return res.send(requests);
        });
    },

    sendToVendor: function(req, res){

        var vendorRequest = mongoDb.get('vendorRequest');

        var vendors = req.body.allVendors;
        var reqId = req.params.requestId;

        async.auto({
            create: function(cb){
                async.each(vendors, function(vendor, cb){
                    vendorRequest.insert({
                        request: reqId,
                        vendor: vendor
                    }, function(err, vendorReq){
                        if(err)
                          return cb(err);

                        return cb();
                    });
                }, function(err){
                    if(err)
                      return cb(err);

                    return cb();
                });
            }
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
            return res.send(results);
        });
    }

};

module.exports = searchController;