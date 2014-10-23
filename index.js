var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

server.listen(app.get('port'), function() {
  console.log("La aplicacion se esta ejecutando en localhost:" + app.get('port'))
});

// lista global de usuarios
var usuarios = {};
var numeroUsuarios = 0;

io.on('connection', function (socket) {
  var usuarioAgregado = false;

  //se ha unido un nuevo usuario
  socket.on('agregar usuario', function (usuario) {

    //guardele al cliente su nombre
    socket.usuario = usuario;

    //agreguelo a la lista global
    usuarios[usuario] = usuario;
    ++numeroUsuarios;

    usuarioAgregado = true;
    socket.emit('login', {
      numeroUsuarios: numeroUsuarios
    });
    
    // informe a los demas que alguien se ha unido
    socket.broadcast.emit('nuevo usuario', {
      usuario: socket.usuario,
      numeroUsuarios: numeroUsuarios
    });

    console.log(socket.usuario + ' se ha conectado.');
  });

  // cuando un usuario se va
  socket.on('disconnect', function () {

    // borre al usuario de la lista de clientes
    if (usuarioAgregado) {
      delete usuarios[socket.usuario];
      --numeroUsuarios;

      // informe a todos que alguien se ha ido
      socket.broadcast.emit('usuario desconectado', {
        usuario: socket.usuario,
        numeroUsuarios: numeroUsuarios
      });

      console.log(socket.usuario + " se ha ido.");
    }
  });

  socket.on('nuevo mensaje', function (data) {
    //le enviamos a todos los clientes el mensaje
    socket.broadcast.emit('nuevo mensaje', {
      usuario: socket.usuario,
      mensaje: data
    });
  });


});