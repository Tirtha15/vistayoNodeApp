var utils = {
    validateEmail: function (email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    },
    uuid: function(){
        var uuidV4 = require('uuid/v4');
        return uuidV4();
    },
    getRandomCode: function(length){
        var code = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$&";

        for( var i=0; i < length; i++ )
            code += possible.charAt(Math.floor(Math.random() * possible.length));

        return code;
    },
};

module.exports = utils;