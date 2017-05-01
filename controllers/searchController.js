var searchController  = {

    autoComplete: function(req, res){
        var term = req.query.term;
        if(!term || term.length < 2)
          return res.badRequest({
              code: "BAD_REQUEST",
              msg: 'No search term, or term length is below 2'
          });
        var dataTosend = [
            {
                keyword: "key",
                type: "theme"
            }
        ];
        res.ok(dataTosend);
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