var async = require('async');
var jwt = require('jsonwebtoken');
var _ = require('underscore');
var config = require('./../config');
var mongoDb = require('./../config/db').mongo;
module.exports = function(req, res, next){
    var aToken = req.headers.atoken;

    if(!aToken)
      return res.notAuthorized({
          code: 'NOT_AUTHORIZED',
          msg: 'No access token in request'
      });

    async.auto({
        validateToken: function(cb){
            jwt.verify(aToken, config.CONSTANTS.jwtSecret, function(err, payload){
                if(err)
                  return cb(err);
                return cb(null, payload);
            })
        },
        user: ['validateToken', function(results, cb){
            var userCol = mongoDb.get('user');
            userCol.findOne({
                uuid: results.validateToken.userId
            },{}, function(err, user){
                if(err)
                    return cb(err);
                if(!user)
                    return cb({
                        code: 'BAD_REQUEST',
                        msg: 'Invalid user'
                    });
                if(user.aToken !== aToken)
                   return cb({
                       code: 'NOT_AUTHORIZED',
                       msg: 'Could not be authorized'
                   });

                var keysToPick = ['uuid', 'mobile', 'email', 'isAdmin', 'isVendor'];

                req.user = _.pick(user,keysToPick);
                return cb(null, user);
            });
        }]
    }, function(err, results){
        if(err)
          return res.notAuthorized({
              code: 'NOT_AUTHORIZED',
              msg: 'Could not be authorized'
          });

        return next();
    });

};