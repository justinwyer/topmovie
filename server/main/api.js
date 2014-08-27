var express = require('express');
var imdb = require('./imdb');
var _ = require('lodash');


var api = function (app) {
    app.get('/movie/:id', function (req, res) {
        imdb.movies().then(function (movies) {
            res.json(_.find(movies, function (movie) {
                return _.contains(movie.url, req.params.id);
            }));
        });
    });
}

module.exports = api;