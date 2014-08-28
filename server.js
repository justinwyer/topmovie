var http = require('http');
var express = require('express');
var request = require('request');
var app = express();
app.set('port', process.env.PORT);
app.use(express.static(__dirname + '/client/main'));
app.get('/images/*', function(req, res) {
    var image = req.url.split('/images/')[1];
    request({url: 'http://ia.media-imdb.com/images/' + image, gzip:true }).pipe(res);
});
var server = http.createServer(app);
var Quiz = require('./server/main/quiz').Quiz;
new Quiz(server);
server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
