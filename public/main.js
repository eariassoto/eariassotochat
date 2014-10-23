$(function() {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];
  
  var socket = io();

  var $window = $(window);

  var $loginChat = $('#loginChat');
  var $ventanaChat = $('#ventanaChat');

  var $mensajes = $("#mensajes");

  var $entradaNombre = $('#entradaNombre');
  var $entradaMensaje = $('#entradaMensaje');
  var $currentInput = $entradaNombre.focus();
  
  var usuario;
  var conectado = false;


    // Agrega al usuario al chat
  function setUsuario () {
    usuario = cleanInput($entradaNombre.val().trim());

    if (usuario) {
      $loginChat.fadeOut();
      $loginChat.off('click');

      $ventanaChat.show();
      $currentInput = $entradaMensaje.focus();

      socket.emit('agregar usuario', usuario);
    }
  }

   function agregarMensaje (elemento, opciones) {
    var $elemento = $(elemento);
    $mensajes.append($elemento);
   }

  function log (message, options) {
    var $el = $('<li>').text(message);
    agregarMensaje($el, options);
  }

   function agregarMensajeParticipantes (data) {
    var mensaje = '';
    if (data.numeroUsuarios === 1) {
      mensaje += "Hay 1 usuario conectado.";
    } else {
      mensaje += "Hay " + data.numeroUsuarios + " usuarios conectados.";
    }
    log(mensaje);
  }

  // Cuando el server responda con 'login', imprima el mensaje de bienvenida
  socket.on('login', function (data) {
    conectado = true;
    var mensaje = "Bienvenido al chat.";
    log(mensaje);
    //log(message, {
      //prepend: true
    //});
    agregarMensajeParticipantes(data);
  });

   // Informe que hay un nuevo usuario
  socket.on('nuevo usuario', function (data) {
    log(data.usuario + ' se ha unido.');
    agregarMensajeParticipantes(data);
  });

  socket.on('usuario desconectado', function (data) {
    log(data.usuario + ' se ha ido.');
    agregarMensajeParticipantes(data);
  });

  $window.keydown(function (event) {
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // Cuando el usuario presione enter
    if (event.which === 13) {
      if (usuario) {
        //sendMessage();
        //socket.emit('stop typing');
        //typing = false;
      } else {
        setUsuario();
      }
    }
  });

   // Previene que se inyecte codigo
  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }
});