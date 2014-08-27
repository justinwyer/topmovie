var http = require('http');
var express = require('express');
var app = express();
app.set('port', 3000);
app.use(express.static(__dirname + '/client/main'));
var api = require('./server/main/api')(app);
var server = http.createServer(app);
var Quiz = require('./server/main/quiz').Quiz;
new Quiz(server);
server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
