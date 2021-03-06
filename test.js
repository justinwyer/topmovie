var seedrandom = require('seedrandom');
seedrandom(0, { global: true });
var FS = require('q-io/fs');
var nock = require('nock');
process.env.PORT = 3000;
FS.read('server/spec/top.html')
    .then(function (content) {
        nock('http://www.imdb.com', {allowUnmocked: true})
            .get('/chart/top')
            .times(1000)
            .reply(200, content);
        require('./server');
    });
var Constants = require('./server/main/quiz').Constants;
Constants.NUMBER_OF_ROUNDS = 8;
Constants.ROUND_LENGTH = 200;