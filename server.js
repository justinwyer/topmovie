var http = require('http');
var api = require('./server/main/api');

api.set('port', 3000);
var server = http.createServer(api);
var game = require('./server/main/game')(server);
server.listen(api.get('port'), function(){
    console.log('Express server listening on port ' + api.get('port'));
});
