var async = require('async');
var _ = require('underscore');
var jwt = require('jsonwebtoken');
var utils = require('./../services/utils');
var config = require('./../config');

var mongoDb = require('./../config/db').mongo;

var userController = {
    signup: function(req, res){
        var userFeilds = ['name', 'emailId', 'mobile', 'password', 'isAdmin'];

        var user = _.pick(req.body, userFeilds);

        if(!user.mobile || !user.emailId || !user.password)
          return res.badRequest({
              code: 'BAD_REQUEST',
              msg: 'mandatory fields are missing'
          });

        if(user.mobile && user.mobile.length !== 10)
            return res.badRequest({
                code: 'BAD_REQUEST',
                msg: 'Invalid mobile number'
            });

        if(user.emailId && !utils.validateEmail(user.emailId))
            return res.badRequest({
                code: 'BAD_REQUEST',
                msg: 'Invalid email'
            });

        if(!utils.validatePassword(user.password))
            return res.badRequest({
                code: 'BAD_REQUEST',
                msg: 'Invalid password'
            });

        var userCol = mongoDb.get('user');

        async.auto({
            findUser: function(cb){
                userCol.findOne({
                    mobile: user.mobile
                },{}, function(err, user){
                    if(err)
                        return cb(err);
                    if(user)
                        return cb({
                            code: 'BAD_REQUEST',
                            msg: 'User already exist for mobile:' + user.mobile
                        });
                    return cb();
                });
            },
            createUser: ['findUser', function(results, cb){
                var toInsert = user;
                toInsert.uuid = utils.uuid();
                toInsert.password = utils.hashPassword(user.password);

                userCol.insert(toInsert, function(err, createdUser){
                    if(err)
                        return cb(err);
                    return cb(null, createdUser);
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

            return res.ok(results.createUser);
        });
    },

    login: function(req, res){
        var mobile = req.body.mobile;
        var password = req.body.password;

        if(!mobile || !password)
          return res.badRequest({
              code: 'BAD_REQUEST',
              msg: 'Invalid request'
          });
        var userCol = mongoDb.get('user');

        async.auto({
            findUser: function(cb){
                userCol.findOne({
                    mobile: mobile
                },{}, function(err, user){
                    if(err)
                        return cb(err);
                    if(!user)
                        return cb({
                            code: 'BAD_REQUEST',
                            msg: 'Invalid user'
                        });
                    if(!utils.comparePassword(password, user.password))
                       return cb({
                           code: 'BAD_REQUEST',
                           msg: 'Invalid password'
                       });
                    return cb(null, user);
                });
            },
            generateToken: ['findUser', function(results, cb){
                var aToken = jwt.sign({
                    userId: results.findUser.uuid
                }, config.CONSTANTS.jwtSecret, { expiresIn: '2h' });

                return cb(null, aToken);
            }],
            updateToken: ['generateToken', function(results, cb){
                userCol.findOneAndUpdate({
                    uuid: results.findUser.uuid
                },{
                    $set: {
                        aToken: results.generateToken
                    }
                },{}, function(err, updatedUser){
                    if(err)
                      return cb(err);
                    return cb();
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
            var toReturn = {aToken: results.generateToken};

            return res.ok(toReturn);
        });
    }
};

module.exports = userController;