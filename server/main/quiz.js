var events = require('events');
var WebSocketServer = require('ws').Server;
var _ = require('lodash');
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

function Game(quiz, playerOne, playerTwo) {
    this.quiz = quiz;
    this.playerOne = playerOne;
    this.playerTwo = playerTwo;
    this.name = playerOne.name + ' vs ' + playerTwo.name;
    this.round = {number: 0};
    this.scores = {};
    this.scores[playerOne.name] = {};
    this.scores[playerTwo.name] = {};
    this.playerOne.joinGame(this);
    this.playerTwo.joinGame(this);
    this.newRound();
    this.playedMovies = [];
    this.on('answer', function (player, data) {
        if (data.name === this.round.movie.name) {
            if (data.year === this.round.movie.year) {
                this.scores[player.name][data.name] = 5;
            } else {
                this.scores[player.name][data.name] = -3;
            }
        }
    });
}

Game.prototype = Object.create(events.EventEmitter.prototype);
Game.prototype.constructor = Game;

Game.prototype.send = function (message) {
    this.playerOne.send(message);
    this.playerTwo.send(message);
};

Game.prototype.on = function (event, handler) {
    this.playerOne.on(event, _.partial(handler, this.playerOne).bind(this));
    this.playerTwo.on(event, _.partial(handler, this.playerTwo).bind(this));
};

Game.prototype.end = function (message) {
    this.playerOne.close();
    this.playerTwo.close();
};

Game.prototype.playerDisconnected = function () {
    if (!this.playerOne.connected && !this.playerTwo.connected) {
        clearTimeout(this.nextRound);
    }
};

Game.prototype.sumScores = function () {
    var scores = {};
    var sumScore = function (player) {
        return _.reduce(this.scores[player.name], function (sum, score, key) {
            return sum + score;
        }, 0);
    }.bind(this);
    scores[this.playerOne.name] = sumScore(this.playerOne);
    scores[this.playerTwo.name] = sumScore(this.playerTwo);
    return scores
};

Game.prototype.newRound = function () {
    this.round.number++;
    if (this.round.number > Constants.NUMBER_OF_ROUNDS) {
        clearTimeout(this.nextRound);
        this.send({event: 'game over', data: {scores: this.sumScores()}} );
        this.end();
        return;
    }
    imdb.movies()
        .then(function (movies) {
            var movie;
            do {
                movie = _.sample(movies);
            } while (_.contains(this.playedMovies, movie.name));
            this.playedMovies.push(movie.name);
            this.round.movie = movie;
            var years = _.range(movie.year - 3, movie.year + 3);
            _.remove(years, function (year) {
                return year === movie.year
            });
            years = _.sample(years, 2);
            years.push(movie.year);
            this.send({event: 'game', data: {scores: this.sumScores(),
                       movie: {name: movie.name, years: _.shuffle(years), id: movie.id}}});
            this.nextRound = setTimeout(this.newRound.bind(this), Constants.ROUND_LENGTH);
        }.bind(this))
        .catch(function (error) {
        });
};

function Quiz(server) {
    var quiz = this;
    this.socketServer = new WebSocketServer({server: server, path: '/quiz'});
    this.clients = [];
    this.games = [];
    this.socketServer.on('connection', function (socket) {
        new Client(quiz, socket);
    });
}

Quiz.prototype = Object.create(events.EventEmitter.prototype);
Quiz.prototype.constructor = Quiz;

Quiz.prototype.register = function (client) {
    this.clients.push(client);
    client.send({event: 'waiting'});
    if (this.clients.length >= 2) {
        this.games.push(new Game(this, this.clients.shift(), this.clients.shift()))
    }
};

Quiz.prototype.deregister = function (client) {
    _.remove(this.clients, client);
};

module.exports.Quiz = Quiz;
module.exports.Constants = Constants;