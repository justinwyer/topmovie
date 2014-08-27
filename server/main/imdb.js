var http = require('q-io/http');
var cheerio = require('cheerio');
var _ = require('lodash');

module.exports = {
    movies: function () {
        var request = http.request({method: 'GET', url: 'http://www.imdb.com/chart/top'});
        return request
            .then(function (response) {
                return response.body.read();
            })
            .then(function (body) {
                var $ = cheerio.load(body);
                return _.map($('div.lister table.chart tbody.lister-list tr td.titleColumn'), function (element) {
                    return {
                        name: $(element).find('a').text(),
                        id: $(element).find('a').attr('href').split('/')[2],
                        year: parseInt($(element).find('span.secondaryInfo').text().slice(1, -1))
                    };
                });
            });
    }
};