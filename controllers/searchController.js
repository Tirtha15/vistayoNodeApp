var _ = require('underscore');
var async = require('async');
var db = require('./../config/db');
var config = require('./../config');
var mongoDb = db.mongo;
var esClient = db.elasticsearch;


var searchController  = {

    autoComplete: function(req, res){
        var term = req.query.term;
        if(!term || term.length < 2)
          return res.badRequest({
              code: "BAD_REQUEST",
              msg: 'No search term, or term length is below 2'
          });

        var query = {
            "query": {
                "match": {
                    "suggest": {
                        "query":    term,
                        "analyzer": "standard"
                    }
                }
            }
        };

        esClient.search({
            index: config.CONSTANTS.autoCompleteEsIndex,
            type: config.CONSTANTS.autoCompleteEsType,
            body: query
        }, function(err, suggestions){
            if(err)
              return res.serverError(err);

            var allHits = _.map(suggestions.hits.hits, function(hit){
                return hit._source;
            });

            var toReturn = {
                total: suggestions.hits.total,
                searchTerm: term,
                suggestions: allHits
            };
            return res.ok(toReturn);
        });
    },

    themeSearch: function(req, res){
        var keyword = req.params.keyword;

        var idealForSelections = req.query.idealFor ? req.query.idealFor.split(',') : null;
        var monthOfTravelSelections = req.query.monthOfTravel ? req.query.monthOfTravel.split(',') : null;
        var attractionsSelections = req.query.attractions ? req.query.attractions.split(',') : null;
        var isInternational = req.query.isInternational || false;
        var isDomestic = req.query.isDomestic || false;



        async.auto({
            travelTheme: function(cb){
                var travelThemes = mongoDb.get('travelThemes');

                travelThemes.findOne({
                    slug: keyword
                },{}, function(err, theme){
                    if(err)
                      return cb(err);
                    if(!theme)
                      return cb({
                          code: 'NOT_FOUND',
                          msg: 'requested travel theme not found'
                      });

                    return cb(null, theme);
                });
            },
            destinations:['travelTheme', function(results, cb){
                var destinationsCol = mongoDb.get('destinations');

                var findCriteria = {};

                findCriteria.travelThemes = results.travelTheme.uuid;

                if(isInternational)
                    findCriteria.isInternational = true;

                if(isDomestic)
                    findCriteria.isInternational = false;

                if(isInternational && isDomestic)
                    delete findCriteria.isInternational;

                if(idealForSelections)
                    findCriteria.idealFor = { $in: idealForSelections};

                if(monthOfTravelSelections)
                    findCriteria.monthOfTravel = { $in: monthOfTravelSelections};

                if(attractionsSelections)
                    findCriteria.attractions = { $in: attractionsSelections};

                destinationsCol.find(findCriteria, {}, function(err, matchingDestination){
                    if(err)
                      return cb(err);
                    return cb(null, matchingDestination);
                });
            }],
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

            return res.ok(results);
        });
    },

    destinationSearch: function(req, res){
        var keyword = req.params.keyword;

        async.auto({
            destination: function(cb){
                var destinationsCol = mongoDb.get('destinations');

                destinationsCol.findOne({
                    slug: keyword
                }, {}, function(err, destination){
                    if(err)
                      return cb(err);
                    if(!destination)
                      return cb({
                          code: 'NOT_FOUND',
                          msg: 'requested destination not found'
                      });
                    return cb(null, destination);
                });
            },
            packages:['destination', function(results, cb){
                var packagesCol = mongoDb.get('packages');

                packagesCol.find({
                    destination: results.destination.uuid
                }, {}, function(err, packages){
                    if(err)
                      return cb(err);
                    return cb(null, packages);
                });
            }]
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

            return res.ok(results);
        });
    }

};

module.exports = searchController;