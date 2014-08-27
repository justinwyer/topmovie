(function (app) {
    app.factory('GameService', function ($rootScope) {
        GameService = function(url, name) {
            this.client = new GameClient(url, name);
        };

        return GameService;
    });
})(angular.module('top-movie', []));