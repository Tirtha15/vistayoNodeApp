var monk = require('monk');
var elasticsearch = require('elasticsearch');
var config = require('./index');

var db = {};
db.mongo = monk(config.mongo_db.uri);

db.elasticsearch = new elasticsearch.Client({
    host: config.elasticsearch.host,
    //log: 'trace'
});

module.exports = db;