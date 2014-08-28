function GameClient(url, name) {
    this.connected = false;
    this.websocket = new WebSocket(url);
    this.websocket.onopen = function () {
        this.connected = true;
        this.emit('open');
    }.bind(this);
    this.websocket.onmessage = function (rawMessage) {
        var message = JSON.parse(rawMessage.data);
        this.emit(message.event, message.data);
    }.bind(this);
    this.websocket.onclose = function () {
        this.connected = false;
        clearInterval(this.ping);
        this.emit('close');
    }.bind(this);
    this.on('open', function () {
        this.send({event: 'register', data: name});
        this.ping = setInterval(function() {
            this.send({event: 'ping'});
        }.bind(this), 30000);
    });
}

GameClient.prototype =  Object.create(EventEmitter.prototype);
GameClient.prototype.constructor = GameClient;

GameClient.prototype.send = function (message) {
    this.websocket.send(JSON.stringify(message));
};

GameClient.prototype.close = function () {
    this.websocket.close();
};

GameClient.prototype.answer = function (name, year) {
    this.send({event: 'answer', data: {name: name, year: year}})
};