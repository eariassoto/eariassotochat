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
  var $ventanaChat = $('#ventanaChat').hide();

  var $mensajes = $("#mensajes");

  var $entradaNombre = $('#entradaNombre');
  var $entradaMensaje = $('#entradaMensaje');
  var $currentInput = $entradaNombre.focus();
  
  var usuario;
  var conectado = false;

  
   // Sends a chat message
  function enviarMensaje () {
    var mensaje = $entradaMensaje.val();
    // Prevent markup from being injected into the message
    mensaje = cleanInput(mensaje);
    // if there is a non-empty message and a socket connection
    if (mensaje && conectado) {
      $entradaMensaje.val('');
      agregarMensajeChat({
        usuario: usuario,
        mensaje: mensaje
      });

      socket.emit('nuevo mensaje', mensaje);
    }
  }

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


  function agregarMensajeChat (data, options) {
    // Don't fade the message in if there is an 'X was typing'
    /*var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);

    var typingClass = data.typing ? 'typing' : '';*/
    var $messageDiv = $('<li/>').append(data.usuario + ": " +data.mensaje);
      //.addClass(typingClass)
      //.append($usernameDiv, $messageBodyDiv);

    agregarMensaje($messageDiv, options);
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

  socket.on('nuevo mensaje', function (data) {
    agregarMensajeChat(data);
  });

  $window.keydown(function (event) {
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // Cuando el usuario presione enter
    if (event.which === 13) {
      if (usuario) {
        enviarMensaje();
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