var _ = require('underscore');
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
        var dataToSend = [{
            keyword: keyword,
            name: 'honeymoon',
            imgUrls: ['img1', 'img2'],
            attractions: ['wilflife', 'adventure'],
            monthOftravel: ['january', 'february', 'march'],
            idealFor: ['adventurers']
        }];

        res.ok(dataToSend);
    },

    destinationSearch: function(req, res){
        var keyword = req.params.keyword;
        var dataToSend = [{
            keyword: keyword,
            name: 'honeymoon',
            cities:['bangalore'],
            imgUrls: ['img1', 'img2'],
            attractions: ['wilflife', 'adventure'],
            monthOftravel: ['january', 'february', 'march'],
            idealFor: ['adventurers']
        }];

        res.ok(dataToSend);
    }

};

module.exports = searchController;