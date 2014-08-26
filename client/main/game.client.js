function GameClient(url, name) {
    this.websocket = new WebSocket(url);
    this.websocket.onopen = function () {
        this.emit('open');
    }.bind(this);
    this.websocket.onmessage = function (rawMessage) {
        var message = JSON.parse(rawMessage.data);
        this.emit(message.event, message.data);
    }.bind(this);
    this.websocket.onclose = function () {
        this.emit('close');
    }.bind(this);
}

GameClient.prototype = Object.create(EventEmitter.prototype);
GameClient.prototype.constructor = GameClient;

GameClient.prototype.send = function (message) {
    this.websocket.send(JSON.stringify(message));
};

GameClient.prototype.close = function () {
    this.websocket.close();
};