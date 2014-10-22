//Configuracion de Express
var express = require('express');
var app = express();
var server = require('http').createServer(app);

var io = require('socket.io')(server);

//Establece el puerto
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

server.listen(app.get('port'), function() {
  console.log("La aplicacion se esta ejecutando en localhost:" + app.get('port'));
});
