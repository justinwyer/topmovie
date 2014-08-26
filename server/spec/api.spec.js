var request= require('supertest');
var api = require('../main/api');
var nock = require('nock');
var FS = require('q-io/fs');

describe('REST API', function () {
    describe('#movie', function () {
        beforeEach(function () {
            return FS.read('server/spec/top.html')
                .then(function (content) {
                    nock('http://www.imdb.com')
                        .get('/chart/top')
                        .reply(200, content);
                });
        });

        it('should return the details for the movie with the given id', function (done) {
            request(api)
                .get('/movie/tt0111161')
                .expect(200, done);
        });
    });
});