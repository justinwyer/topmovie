(function (app) {
    app.factory('GameService', function () {
        GameService = function(url, name, client) {
            if (!client) {
                this.client = new GameClient(url, name);
            } else {
                this.client = client;
            }
        };

        GameService.prototype.isRegistered = function () {
            return this.client.isRegistered();
        };

        return GameService;
    });
})(angular.module('top-movie', []));