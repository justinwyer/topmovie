var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var nock = require('nock');
var FS = require('q-io/fs');

var imdb = require('../main/imdb');


chai.use(chaiAsPromised);
var expect = chai.expect;

describe('imdb', function () {
    describe('#movies', function () {
        beforeEach(function () {
            return FS.read('server/spec/top.html')
                .then(function (content) {
                    nock('http://www.imdb.com')
                        .get('/chart/top')
                        .reply(200, content);
                });
        });

        it('should return a list of the top 250 movies from IMDB', function () {
            var movies = imdb.movies();
            return expect(movies).to.eventually.have.property('length', 250);
        });

        it('should expect The Shawshank Redemption to be in the list', function () {
            var movies = imdb.movies();
            return expect(movies).to.eventually.contain({name: 'The Shawshank Redemption', url: '/title/tt0111161/?ref_=chttp_tt_1'});
        });
    });
});