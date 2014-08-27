var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var cheerio = require('cheerio');
var _ = require('lodash');

module.exports = {
    movies: function () {
        return request({url: 'http://www.imdb.com/chart/top', gzip: true})
            .spread(function (response, body) {
                var $ = cheerio.load(body);
                return _.map($('div.lister table.chart tbody.lister-list tr td.titleColumn'), function (element) {
                    return {
                        name: $(element).find('a').text(),
                        id: $(element).find('a').attr('href').split('/')[2],
                        year: parseInt($(element).find('span.secondaryInfo').text().slice(1, -1))
                    };
                });
            });
    },
    movie: function (id) {
        var movie = {id: id};
        return request({url: 'http://www.imdb.com/title/' + id + '/', gzip: true})
            .spread(function (response, body) {
                var $ = cheerio.load(body);
                movie.name = $('td#overview-top h1.header span.itemprop').text();
                return $('td#img_primary a').attr('href')
            })
            .then(function (galleryLink) {
                return request({method: 'GET', url: 'http://www.imdb.com/' + galleryLink, gzip: true})
            })
            .spread(function (response, body) {
                var $ = cheerio.load(body);
                movie.imageUrl = $('img#primary-img').attr('src')
                return movie;
            });
    }
};