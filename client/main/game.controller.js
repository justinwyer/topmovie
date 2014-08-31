(function (app) {
    app.directive('img', function() {
        return {
            restrict: 'E',
            link: function(scope, element) {
                element.bind('load', function() {
                    scope.$emit('image loaded');
                });
            }
        };
    });

    app.controller('GameController', function ($scope, $location, $window) {
        $scope.gameState = 'new';
        $scope.$on('image loaded', function () {
            $scope.gameState = 'game';
            $scope.$apply();
        });
        $scope.setName = function (name) {
            $scope.player = name;
            $scope.client = new GameClient('ws://top-movie.herokuapp.com/quiz', $scope.player);
            $scope.client.on('searching', function () {
                $scope.gameState = 'searching';
                $scope.$apply();
            });
            $scope.client.on('waiting', function () {
                $scope.gameState = 'waiting';
                $scope.$apply();
            });
            $scope.client.on('joined game', function () {
                $scope.gameState = 'joined game';
                $scope.$apply();
            });
            $scope.client.on('game', function (message) {
                $scope.gameState = 'loading';
                $scope.movie = message.movie;
                $scope.movie.imageUrl = '/images/' + $scope.movie.imageUrl.split('/images/')[1];
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
            };
        };
        $scope.playAgain = function () {
            $window.location.reload();
        };
    });
})(angular.module('top-movie', []));