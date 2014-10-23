$(function() {
    var FADE_TIME = 150; // ms
    var TYPING_TIMER_LENGTH = 400; // ms
    var COLORES = [
        '#e21400', '#91580f', '#f8a700', '#f78b00',
        '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
        '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];

    var socket = io();

    var $window = $(window);

    var $loginChat = $('#loginChat');
    var $panelConversacion = $('#conversation');
    var $ventanaChat = $('#ventanaChat');

    var $mensajes = $("#mensajes");

    var $entradaNombre = $('#entradaNombre');
    var $entradaMensaje = $('#entradaMensaje');
    var $currentInput = $entradaNombre.focus();

    var usuario;
    var ultEscribio;
    var escribiendo = false;
    var conectado = false;


    // Envia un mensaje al servidor
    function enviarMensaje() {
        var mensaje = $entradaMensaje.val();

        mensaje = cleanInput(mensaje);

        if (mensaje && conectado) {
            $entradaMensaje.val('');
            agregarElementoChat({
                usuario: usuario,
                mensaje: mensaje
            });

            socket.emit('nuevo mensaje', mensaje);
        }
    }

    // Agrega al usuario al chat
    function setUsuario() {
        usuario = cleanInput($entradaNombre.val().trim());

        if (usuario) {
            $loginChat.fadeOut();
            $loginChat.off('click');

            $ventanaChat.show();
            $ventanaChat.on('click');

            $currentInput = $entradaMensaje.focus();

            socket.emit('agregar usuario', usuario);
        }
    }

    function agregarElemento(elemento, opciones) {
        var $el = $(elemento);

        // Setup default opciones
        if (!opciones) {
            opciones = {};
        }
        if (typeof opciones.fade === 'undefined') {
            opciones.fade = true;
        }
        if (typeof opciones.prepend === 'undefined') {
            opciones.prepend = false;
        }

        // Apply opciones
        if (opciones.fade) {
            $el.hide().fadeIn(FADE_TIME);
        }
        if (opciones.prepend) {
            $mensajes.prepend($el);
        } else {
            $mensajes.append($el);
        }
        $panelConversacion[0].scrollTop = $panelConversacion[0].scrollHeight;
    }

    function escribir(mensaje, opciones) {
        var $el = $('<li class="linea log">').text(mensaje);
        agregarElemento($el, opciones);
    }

    function agregarElementoParticipantes(data) {
        var mensaje = '';
        if (data.numeroUsuarios === 1) {
            mensaje += "Hay 1 usuario conectado";
        } else {
            mensaje += "Hay " + data.numeroUsuarios + " usuarios conectados";
        }
        escribir(mensaje);
    }


    // Calcula el color de usuario con una funcion hash :magic:
    function getColorUsuario(usuario) {
        var hash = 7;
        for (var i = 0; i < usuario.length; i++) {
            hash = usuario.charCodeAt(i) + (hash << 5) - hash;
        }
        // Calculate color
        var index = Math.abs(hash % COLORES.length);
        return COLORES[index];
    }

    function agregarElementoChat(data, opciones) {

        var $mensajesEscribiendo = getmensajesEscribiendo(data);
        opciones = opciones || {};
        if ($mensajesEscribiendo.length !== 0) {
            opciones.fade = false;
            $mensajesEscribiendo.remove();
        }

        var $divUsuario = $('<span class="usuario"/>')
            .text(data.usuario)
            .css('color', getColorUsuario(data.usuario));
        var $divCuerpoMensaje = $('<span class="bodyMensaje">')
            .text(data.mensaje);

        var claseEscribiendo = data.escribiendo ? 'escribiendo' : '';
        var $messageDiv = $('<li class="mensaje"/>')
            .data('usuario', data.usuario)
            .addClass(claseEscribiendo)
            .append($divUsuario, ": ", $divCuerpoMensaje);

        agregarElemento($messageDiv, opciones);
    }

    // Agrega el mensaje de 'x esta escribiendo'
    function agregarElementoEscrib(data) {
        data.escribiendo = true;
        data.mensaje = 'esta escribiendo';
        agregarElementoChat(data);
    }

    function getmensajesEscribiendo(data) {
        return $('.escribiendo.mensaje').filter(function(i) {
            return $(this).data('usuario') === data.usuario;
        });
    }

    // Quita  los mensajes de usuario escribiendo
    function quitarMensajeEscri(data) {
        getmensajesEscribiendo(data).fadeOut(function() {
            $(this).remove();
        });
    }

    // Actualiza el estado de la entrada del usuario
    function actualizarEscribir() {
        if (conectado) {
            if (!escribiendo) {
                escribiendo = true;
                socket.emit('escribiendo');
            }
            ultEscribio = (new Date()).getTime();

            setTimeout(function() {
                var typingTimer = (new Date()).getTime();
                var timeDiff = typingTimer - ultEscribio;
                if (timeDiff >= TYPING_TIMER_LENGTH && escribiendo) {
                    socket.emit('detuvo escribir');
                    escribiendo = false;
                }
            }, TYPING_TIMER_LENGTH);
        }
    }

    // Cuando el server responda con 'escribi', imprima el mensaje de bienvenida
    socket.on('login', function(data) {
        conectado = true;
        var mensaje = "Bienvenido al chat";
        escribir(mensaje, {
            prepend: true
        });
        agregarElementoParticipantes(data);
    });

    // Informe que hay un nuevo usuario
    socket.on('nuevo usuario', function(data) {
        escribir(data.usuario + ' se ha unido');
        agregarElementoParticipantes(data);
    });

    // Informa sobre un usuario que ha salido de la sala
    socket.on('usuario desconectado', function(data) {
        escribir(data.usuario + ' se ha ido');
        agregarElementoParticipantes(data);
    });

    socket.on('nuevo mensaje', function(data) {
        agregarElementoChat(data);
    });

    socket.on('escribiendo', function(data) {
        agregarElementoEscrib(data);
    });

    socket.on('detuvo escribir', function(data) {
        quitarMensajeEscri(data);
    });

    socket.on('disconnect', function(data) {
        $loginChat.show();
        $loginChat.on('click');

        $ventanaChat.hide();
        $ventanaChat.off('click');

        $currentInput = $entradaMensaje.focus();
    });

    $window.keydown(function(event) {
        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
            $currentInput.focus();
        }
        // Cuando el usuario presione enter
        if (event.which === 13) {
            if (usuario) {
                enviarMensaje();
                socket.emit('detuvo escribir');
                escribiendo = false;
            } else {
                setUsuario();
            }
        }
    });

    $entradaMensaje.on('input', function() {
        actualizarEscribir();
    });

    $loginChat.click(function() {
        $entradaNombre.focus();
    });

    $ventanaChat.click(function() {
        $entradaMensaje.focus();
    });

    // Previene que se inyecte codigo
    function cleanInput(input) {
        return $('<div/>').text(input).text();
    }
});