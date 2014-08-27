(function (app) {
    app.controller('GameController', function ($scope, $location) {
        $scope.client = new GameClient('ws://' + $location.host() + ':' + $location.port() + '/quiz', 'player one');
        $scope.client.on('game', function (message) {
            $scope.movie = message.movie;
            console.log($scope.movie);
            $scope.$apply();
        });
    });
})(angular.module('top-movie', []));