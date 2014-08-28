var events = require('events');
var WebSocketServer = require('ws').Server;
var _ = require('lodash');
var Promise = require('bluebird');
var imdb = require('./imdb');

var Constants = {
    NUMBER_OF_ROUNDS: 8,
    ROUND_LENGTH: 8000
};

function Client(quiz, socket) {
    this.quiz = quiz;
    this.socket = socket;
    this.socket.on('message', function (rawMessage) {
        var message = JSON.parse(rawMessage);
        this.emit(message.event, message.data);
    }.bind(this));
    socket.on('close', function () {
        this.quiz.deregister(this);
        if(this.game) {
            this.game.playerDisconnected(this);
        }
    }.bind(this));
    this.on('register', function (message) {
        this.name = message;
        this.quiz.register(this);
    }.bind(this));
}

Client.prototype = Object.create(events.EventEmitter.prototype);
Client.prototype.constructor = Client;

Client.prototype.send = function (message) {
    var jsonMessage = JSON.stringify(message);
    this.socket.send(jsonMessage, function (error) {
    });
};

Client.prototype.close = function () {
    this.socket.close();
};

Client.prototype.joinGame = function (game) {
    this.game = game;
    this.send({event: 'joined game', data: {name: this.game.name}});
};

function Game(quiz) {
    this.quiz = quiz;
    this.currentRound = 0;
    imdb.movies()
    .then(function (topMovies) {
        var movies = _.sample(topMovies, Constants.NUMBER_OF_ROUNDS);
        function generateYears(year) {
            var years = _.range(year - 3, year + 3)
            years.splice(3, 1);
            years = _.sample(years, 2);
            years.push(year);
            return _.shuffle(years);
        }

        function scrapeImageUrls(rounds) {
            return _.map(rounds, function(round) {
                return imdb.movie(round.movie.id)
                    .then(function (movie) {
                        round.movie.imageUrl = movie.imageUrl;
                    })
            });
        }

        this.rounds = _.map(movies, function (movie) {
            movie.years = generateYears(movie.year);
            var round = {movie: movie, answers: {}};
            return round;
        });
        Promise.all(scrapeImageUrls(this.rounds))
        .then(function () {
             this.emit('ready');
        }.bind(this));
    }.bind(this));
}

Game.prototype = Object.create(events.EventEmitter.prototype);
Game.prototype.constructor = Game;

Game.prototype.send = function (message) {
    this.playerOne.send(message);
    this.playerTwo.send(message);
};

Game.prototype.onPlayer = function (event, handler) {
    this.playerOne.on(event, _.partial(handler, this.playerOne).bind(this));
    this.playerTwo.on(event, _.partial(handler, this.playerTwo).bind(this));
};

Game.prototype.start = function (playerOne, playerTwo) {
    this.playerOne = playerOne;
    this.playerTwo = playerTwo;
    this.name = playerOne.name + ' vs ' + playerTwo.name;
    this.scores = {};
    this.scores[playerOne.name] = {};
    this.scores[playerTwo.name] = {};
    this.playerOne.joinGame(this);
    this.playerTwo.joinGame(this);
    this.onPlayer('answer', function (player, data) {
        if (data.name === this.round().movie.name) {
            this.round().answers[player.name] = data.year;
        }
    });
    this.newRound();
};

Game.prototype.end = function () {
    var scores = {scores: this.sumScores()};
    this.send({event: 'game over', data: scores} );
    this.playerOne.close();
    this.playerTwo.close();
};

Game.prototype.playerDisconnected = function () {
    if (!this.playerOne.connected && !this.playerTwo.connected) {
        clearTimeout(this.nextRound);
    }
};

Game.prototype.sumScores = function () {
    var _scores = {};
    _scores[this.playerOne.name] = 0;
    _scores[this.playerTwo.name] = 0;
    return _.reduce(this.rounds, function(scores, round) {
        _.each(round.answers, function (value, key) {
            if (value != undefined) {
                scores[key] += value == round.movie.year ? 5 : -3;
            }
        });
        return scores;
    }, _scores);
};

Game.prototype.round = function () {
    return this.rounds[this.currentRound -1];
}

Game.prototype.newRound = function () {
    this.currentRound++;
    if (this.currentRound > Constants.NUMBER_OF_ROUNDS) {
        clearTimeout(this.nextRound);
        this.end();
        return;
    }
    this.send({
        event: 'game',
        data: {
            movie: {
                name: this.round().movie.name,
                years: this.round().movie.years,
                imageUrl: this.round().movie.imageUrl
            }
        }
    });
    this.nextRound = setTimeout(this.newRound.bind(this), Constants.ROUND_LENGTH);
};

function Quiz(server) {
    var quiz = this;
    this.socketServer = new WebSocketServer({server: server, path: '/quiz'});
    this.clients = [];
    this.socketServer.on('connection', function (socket) {
        new Client(quiz, socket);
    });
}

Quiz.prototype = Object.create(events.EventEmitter.prototype);
Quiz.prototype.constructor = Quiz;

Quiz.prototype.register = function (client) {
    this.clients.push(client);
    client.send({event: 'searching'});
    if (this.clients.length >= 2) {
        var playerOne = this.clients.shift();
        var playerTwo = this.clients.shift();
        var game = new Game(this);
        playerOne.send({event: 'waiting'});
        playerTwo.send({event: 'waiting'});
        game.on('ready', function () {
            game.start(playerOne, playerTwo);
        });
    }
};

Quiz.prototype.deregister = function (client) {
    _.remove(this.clients, client);
};

module.exports.Quiz = Quiz;
module.exports.Constants = Constants;