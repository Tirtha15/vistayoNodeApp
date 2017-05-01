var utils = require('./../services/utils');

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

        //insert to db

        return res.ok({
            emailId: req.body.emailId,
            mobile: req.body.mobile
        });
    },

    allRequest: function(req, res){

        var dataToReturn = [{
            emailId: 'tirtha@gmail.com',
            mobile: '9038757810',
            status: 'pending'
        }];


        return res.ok(dataToReturn);
    }
};

module.exports = inviteController;