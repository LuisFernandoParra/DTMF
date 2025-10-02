const socket = io();

// Función para mostrar notificaciones
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    if (type === 'error') {
        notification.style.background = 'rgba(231, 76, 60, 0.9)';
    } else if (type === 'warning') {
        notification.style.background = 'rgba(243, 156, 18, 0.9)';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Función para deshabilitar botón temporalmente
function disableButtonTemporarily(button, duration = 2000) {
    const originalText = button.innerHTML;
    const originalClass = button.className;
    
    button.disabled = true;
    button.style.opacity = '0.6';
    button.innerHTML = '✅ Enviado';
    
    setTimeout(() => {
        button.disabled = false;
        button.style.opacity = '1';
        button.innerHTML = originalText;
    }, duration);
}

// Event Listeners para los botones
document.addEventListener('DOMContentLoaded', () => {
    
    // Estado 2 - Fuegos artificiales
    const btnEstado2 = document.getElementById('btn-estado2');
    if (btnEstado2) {
        btnEstado2.addEventListener('click', () => {
            socket.emit('iniciar_estado_2');
            showNotification('🎆 Estado 2 activado - Fuegos artificiales iniciados');
            disableButtonTemporarily(btnEstado2);
        });
    }
    
    // Estado 3 - Foto y maraca
    const btnEstado3 = document.getElementById('btn-estado3');
    if (btnEstado3) {
        btnEstado3.addEventListener('click', () => {
            socket.emit('activar_estado_3');
            showNotification('📸 Estado 3 activado - Preparando foto grupal');
            disableButtonTemporarily(btnEstado3);
        });
    }
    
    // Habilitar foto
    const btnFoto = document.getElementById('btn-foto');
    if (btnFoto) {
        btnFoto.addEventListener('click', () => {
            socket.emit('habilitar_foto_desktop');
            showNotification('🔓 Foto habilitada - El desktop puede tomar la foto');
            disableButtonTemporarily(btnFoto);
        });
    }
    
    // Finalizar experiencia
    const btnFinalizar = document.getElementById('btn-finalizar');
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres finalizar la experiencia?')) {
                socket.emit('finalizar_experiencia');
                showNotification('🏁 Experiencia finalizada', 'warning');
                disableButtonTemporarily(btnFinalizar, 5000);
            }
        });
    }
    
    // Controles de música
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const forwardBtn = document.getElementById('forward-btn');
    
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            socket.emit('control_musica', 'play');
            showNotification('▶️ Música reproduciendo');
            disableButtonTemporarily(playBtn, 1000);
        });
    }
    
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            socket.emit('control_musica', 'pause');
            showNotification('⏸️ Música pausada');
            disableButtonTemporarily(pauseBtn, 1000);
        });
    }
    
    if (forwardBtn) {
        forwardBtn.addEventListener('click', () => {
            socket.emit('control_musica', 'forward');
            showNotification('⏭️ Canción adelantada');
            disableButtonTemporarily(forwardBtn, 1000);
        });
    }
});

// Socket.IO Event Handlers
if (typeof io !== 'undefined') {
    
    socket.on('connect', () => {
        console.log('Control remoto conectado');
        showNotification('🔗 Conectado al servidor');
    });
    
    socket.on('disconnect', () => {
        console.log('Control remoto desconectado');
        showNotification('❌ Desconectado del servidor', 'error');
    });
    
    // Opcional: Recibir confirmaciones del servidor
    socket.on('estado_cambiado', (estado) => {
        console.log('Estado cambiado a:', estado);
    });
    
    socket.on('foto_habilitada', () => {
        console.log('Foto habilitada confirmada');
    });
    
    socket.on('musica_controlada', (accion) => {
        console.log('Control de música confirmado:', accion);
    });
}

// Función para actualizar el estado de conexión
function updateConnectionStatus() {
    const statusText = document.querySelector('.status-text');
    const indicator = document.querySelector('.active-indicator');
    
    if (socket.connected) {
        statusText.innerHTML = '<span class="active-indicator"></span>Sistema activo - Todos los clientes conectados';
        indicator.style.background = '#27ae60';
    } else {
        statusText.innerHTML = '<span class="active-indicator"></span>Desconectado - Intentando reconectar...';
        indicator.style.background = '#e74c3c';
    }
}

// Actualizar estado cada 5 segundos
setInterval(updateConnectionStatus, 5000);