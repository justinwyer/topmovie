var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var imdb = require('../main/imdb');

chai.use(chaiAsPromised);
var expect = chai.expect;
chai.config.truncateThreshold = 0;

describe('imdb', function () {
    describe('#movies', function () {

        it('should return a list of the top 250 movies from IMDB', function () {
            var movies = imdb.movies();
            return expect(movies).to.eventually.have.property('length', 250);
        });

        it('should expect The Shawshank Redemption to be in the list', function () {
            var movies = imdb.movies();
            return expect(movies).to.eventually.contain(
                {
                    name: 'The Shawshank Redemption',
                    id: 'tt0111161',
                    year: 1994
                });
        });
    });

    describe('#movie', function () {
        it('should return the detail for The Shawshank Redemption', function () {
            var movie = imdb.movie('tt0111161');
            return expect(movie).to.eventually.deep.equal({
                id: 'tt0111161',
                name: 'The Shawshank Redemption',
                imageUrl: 'http://ia.media-imdb.com/images/M/MV5BODU4MjU4NjIwNl5BMl5BanBnXkFtZTgwMDU2MjEyMDE@._V1_SX640_SY720_.jpg'
            });
        });
    });
});