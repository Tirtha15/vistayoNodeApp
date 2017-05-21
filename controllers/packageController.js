var _ = require('underscore');
var async = require('async');
var db = require('./../config/db');
var config = require('./../config');
var mongoDb = db.mongo;


var packageController = {

    packageDetails: function(req, res){
        var packageId = req.params.packageId;

        async.auto({
            package: function(cb){
                var packagesCol = mongoDb.get('packages');

                packagesCol.findOne({
                    uuid: packageId
                }, {}, function(err, packageDetails){
                     if(err)
                       return cb(err);
                     if(!packageDetails)
                       return cb({
                           code: 'NOT_FOUND',
                           msg: 'Invalid package id'
                       });

                     return cb(null, packageDetails);
                });
            }
        }, function(err, results){
            if(err){
                if(err){
                    if(err.code && err.code === 'NOT_FOUND'){
                        return res.notFound(err);
                    }
                    if(err.code && err.code === 'BAD_REQUEST'){
                        return res.badRequest(err);
                    }
                    return res.serverError(err);
                }
            }

            return res.ok(results.package);
        });
    },

};

module.exports = packageController;