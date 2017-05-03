var monk = require('monk');
var config = require('./index');

var db = {};
db.mongo = monk(config.mongo_db.uri);

module.exports = db;