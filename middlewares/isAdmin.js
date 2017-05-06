module.exports = function(req, res, next){
    if(!req.user || !req.user.isAdmin)
      return res.notAuthorized({
          code: 'NOT_AUTHORIZED',
          msg: 'No permission'
      });

    next();
}