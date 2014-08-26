var events = require('events');
var WebSocketServer = require('ws').Server;
var _ = require('lodash');

function Game(server) {
    events.EventEmitter.call(this);
    var socketServer = new WebSocketServer({server: server});
    var lobby = [];
    var games = [];
    socketServer.on('connection', function (socket) {
        console.log('GOT A CONNECTION');
        socket.on('message', function (rawMessage) {
            console.log(rawMessage);
            var message = JSON.parse(rawMessage);
            console.log(message);
            if (message.event === 'register') {
                console.log('psuhing');
                lobby.push({name: message.data, socket: socket});
                console.log('telling them to wait');
                socket.send(JSON.stringify({event: 'waiting'}));
                console.log('registered ' + message.data);

                if (lobby.length >= 2) {
                    var game = {};
                    game.playerOne = lobby.shift();
                    game.playerTwo = lobby.shift();
                    game.round = 0;
                    game.name = game.playerOne.name + ' vs ' + game.playerTwo.name;
                    game.playerOne.socket.send(JSON.stringify({event: 'joined game', data: {name: game.name}}));
                    game.playerTwo.socket.send(JSON.stringify({event: 'joined game', data: {name: game.name}}));
                }
            }
        });
        socket.on('close', function () {
            lobby = _.remove(lobby, socket);
        });
    });
}

Game.prototype = Object.create(events.EventEmitter.prototype);

module.exports = Game;