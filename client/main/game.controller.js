(function (app) {
    app.controller('GameController', function ($scope, $location, $http) {
        $scope.gameState = 'new';
        $scope.setName = function (name) {
            $scope.player = name;
            $scope.client = new GameClient('ws://' + $location.host() + ':' + $location.port() + '/quiz', $scope.player);
            $scope.gameState = 'waiting';
            $scope.client.on('joined game', function () {
                $scope.gameState = 'joined game';
                $scope.$apply();
            });
            $scope.client.on('game', function (message) {
                $scope.gameState = 'game';
                $scope.movie = message.movie;
                $scope.$apply();
            });
            $scope.client.on('game over', function (message) {
                $scope.gameState = 'game over';
                $scope.result = message;
                console.log($scope.result);
                $scope.$apply();
            });
            $scope.answer = function (movie, year) {
                $scope.client.answer(movie, year);
                $scope.gameState = 'answered';
                $scope.$apply();
            };
        };
        $scope.playAgain = function () {
            $location.path('/');
        };
    });
})(angular.module('top-movie', []));