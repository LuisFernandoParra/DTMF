const socket = io();

let currentState = 0; // 0 = esperando, 2 = pistolas, 3 = foto

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
    
    button.disabled = true;
    button.style.opacity = '0.6';
    button.innerHTML = '✅ Enviado';
    
    setTimeout(() => {
        button.disabled = false;
        button.style.opacity = '1';
        button.innerHTML = originalText;
    }, duration);
}

// Función para actualizar el indicador de estado
function updateStateIndicator(state) {
    const stateIndicator = document.getElementById('state-indicator');
    const stateText = document.getElementById('state-text');
    
    switch(state) {
        case 0:
            stateIndicator.textContent = '⏳';
            stateText.textContent = 'Sistema en espera - Selecciona un estado para comenzar';
            break;
        case 2:
            stateIndicator.textContent = '🔫';
            stateText.textContent = 'Estado 2 Activo: Pistolas de Bengalas';
            break;
        case 3:
            stateIndicator.textContent = '📸';
            stateText.textContent = 'Estado 3 Activo: Foto Grupal y Maraca';
            break;
    }
}

// Función para mostrar/ocultar controles según el estado
function toggleStateControls(state) {
    const estado2Controls = document.getElementById('estado2-controls');
    const estado3Controls = document.getElementById('estado3-controls');
    
    // Ocultar todos los controles primero
    estado2Controls.classList.add('hidden');
    estado3Controls.classList.add('hidden');
    
    // Mostrar controles relevantes
    if (state === 2) {
        estado2Controls.classList.remove('hidden');
    } else if (state === 3) {
        estado3Controls.classList.remove('hidden');
    }
    
    currentState = state;
    updateStateIndicator(state);
}

// Event Listeners para los botones
document.addEventListener('DOMContentLoaded', () => {
    
    // Estado 2 - Pistolas de bengalas
    const btnEstado2 = document.getElementById('btn-estado2');
    const btnDisparar = document.getElementById('btn-disparar');
    
    if (btnEstado2) {
        btnEstado2.addEventListener('click', () => {
            socket.emit('iniciar_estado_2');
            showNotification('🔫 Estado 2 activado - Pistolas de bengalas listas');
            disableButtonTemporarily(btnEstado2);
            toggleStateControls(2);
        });
    }
    
    if (btnDisparar) {
        btnDisparar.addEventListener('click', () => {
            socket.emit('disparar_bengalas');
            showNotification('💥 ¡ORDEN DE DISPARO ENVIADA!', 'warning');
            
            // Efecto visual en el botón
            btnDisparar.style.animation = 'none';
            btnDisparar.style.background = 'linear-gradient(45deg, #ff4757, #ff3742)';
            btnDisparar.innerHTML = '🔥 ¡DISPARANDO!';
            
            setTimeout(() => {
                btnDisparar.innerHTML = '💥 ¡DISPARAR BENGALAS!<div style="font-size: 0.8em; margin-top: 5px;">Orden de fuego</div>';
                btnDisparar.style.background = '';
            }, 2000);
        });
    }
    
    // Estado 3 - Foto y maraca
    const btnEstado3 = document.getElementById('btn-estado3');
    const btnFoto = document.getElementById('btn-foto');
    const btnFinalizar = document.getElementById('btn-finalizar');
    
    if (btnEstado3) {
        btnEstado3.addEventListener('click', () => {
            socket.emit('activar_estado_3');
            showNotification('📸 Estado 3 activado - Preparando foto grupal');
            disableButtonTemporarily(btnEstado3);
            toggleStateControls(3);
        });
    }
    
    if (btnFoto) {
        btnFoto.addEventListener('click', () => {
            socket.emit('habilitar_foto_desktop');
            showNotification('🔓 Foto habilitada - El desktop puede tomar la foto');
            disableButtonTemporarily(btnFoto);
        });
    }
    
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres finalizar la experiencia?')) {
                socket.emit('finalizar_experiencia');
                showNotification('🏁 Experiencia finalizada', 'warning');
                disableButtonTemporarily(btnFinalizar, 5000);
                
                // Volver al estado inicial
                setTimeout(() => {
                    toggleStateControls(0);
                }, 3000);
            }
        });
    }
    
    // Controles de música (siempre disponibles)
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

// Inicializar en estado 0
updateStateIndicator(0);