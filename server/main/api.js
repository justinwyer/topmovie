var express = require('express');
var imdb = require('./imdb');
var _ = require('lodash');


var api = function (app) {
    app.get('/movie/:id', function (req, res) {
        imdb.movie(req.params.id).then(function (movie) {
            res.json(movie);
        });
    });
};

module.exports = api;