var async = require('async');
var _ = require('underscore');

var config = require('./../config');
var db = require('./../config/db');
var mongoDb = db.mongo;
var esClient = db.elasticsearch;

var esIndex = config.CONSTANTS.autoCompleteEsIndex;
var esType = config.CONSTANTS.autoCompleteEsType;

function main(){
    console.log("Indexing destination and themes for autocomplete", esType, esIndex);

    async.auto({
        checkIndex: function(cb){
            esClient.indices.exists({
                index: esIndex
            }, function(err, indexExist){
                if(err)
                  return cb(err);
                console.log("indexExist", indexExist);
                return cb(null, indexExist);
            });
        },
        deleteIndex: ['checkIndex', function(results, cb){
            if(!results.checkIndex)
              return cb();

            //delete existing Index
            esClient.indices.delete({
                index: esIndex
            }, function(err, deletedIndex){
                if(err)
                 return cb(err);
                console.log("deletedIndex", deletedIndex);
                return cb();
            });
        }],
        createIndex: ['deleteIndex', function(results, cb){
            var settingsBody = {
                "settings": {
                    "number_of_shards": 1,
                    "analysis": {
                        "filter": {
                            "autocomplete_filter": {
                                "type":     "ngram",
                                "min_gram": 2,
                                "max_gram": 10
                            }
                        },
                        "analyzer": {
                            "autocomplete": {
                                "type":      "custom",
                                "tokenizer": "standard",
                                "filter": [
                                    "lowercase",
                                    "autocomplete_filter"
                                ]
                            }
                        }
                    }
                }
            };
            esClient.indices.create({
                index: esIndex,
                body: settingsBody
            }, function(err, createdIndex){
                if(err)
                  return cb(err);
                return cb(null, createdIndex);
            });
        }],
        putMapping: ['createIndex', function(results, cb){
            var mapping =  {
                "properties": {
                    "keyword": {
                        "type": "string"
                    },
                    "typeOf": {
                        "type": "string"
                    },
                    "suggest": {
                        "type" : "string",
                        "analyzer": "autocomplete"
                    }
                }
            };
            esClient.indices.putMapping({
                index: esIndex,
                type: esType,
                body: mapping
            }, function(err, response){
                if(err)
                  return cb(err);

                return cb();
            });
        }],
        indexDocument1: ['putMapping', function(results, cb){
            var doc = {
                keyword: 'Delhi',
                typeOf: 'destination',
                suggest: ['delhi', 'kelhi', 'melhi']
            };
            esClient.index({
                index: esIndex,
                type: esType,
                body: doc

            }, function(err, doc){
                if(err)
                  return cb(err);
                return cb(null, doc);
            });

        }],
        indexDocument2: ['putMapping', function(results, cb){
            var doc = {
                keyword: 'Adventure',
                typeOf: 'theme',
                suggest: 'adventure'
            };
            esClient.index({
                index: esIndex,
                type: esType,
                body: doc

            }, function(err, doc){
                if(err)
                    return cb(err);
                return cb(null, doc);
            });

        }],
        indexDocument3: ['putMapping', function(results, cb){
            var doc = {
                keyword: 'New York',
                typeOf: 'destination',
                suggest: 'new york'
            };
            esClient.index({
                index: esIndex,
                type: esType,
                body: doc

            }, function(err, doc){
                if(err)
                    return cb(err);
                return cb(null, doc);
            });

        }],
        indexDocument4: ['putMapping', function(results, cb){
            var doc = {
                keyword: 'Denmark',
                typeOf: 'destination',
                suggest: 'denmark'
            };
            esClient.index({
                index: esIndex,
                type: esType,
                body: doc

            }, function(err, doc){
                if(err)
                    return cb(err);
                return cb(null, doc);
            });

        }],
    }, function(err, results){
        if(err) {
            console.log(err);
            process.exit(1);
        }
        console.log('Indexing completed successfully');
        process.exit(0);
    });
}

main();