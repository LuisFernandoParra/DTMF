const socket = io();
const mainContainer = document.getElementById('main-container');

let maracaSound;
let maracaActivated = false;
let lastSentTime = 0;
const throttleDelay = 100;

// Función de P5.js para precargar assets
function preload() {
    maracaSound = loadSound('../assets/sonido/maracas.mp3');
}

// Función de P5.js para configuración inicial
function setup() {
    noCanvas(); // No necesitamos canvas para esta interfaz
}

// Funciones de UI
function showWaitingInterface() {
    mainContainer.innerHTML = `
        <div class="maraca-header">
            <div class="maraca-icon">🎸</div>
            <h1>Maraca Virtual</h1>
            <p class="subtitle">Bad Bunny DTMF Experience</p>
        </div>
        <div class="status-container">
            <div class="status-indicator waiting">
                📸
            </div>
            <p class="status-text">Esperando la foto...</p>
            <div class="instructions">
                <p>📸 Espera a que se tome la foto</p>
                <p>🎵 Luego agita tu teléfono para hacer sonar la maraca</p>
            </div>
        </div>
    `;
}

function showReadyInterface() {
    mainContainer.innerHTML = `
        <div class="maraca-header">
            <div class="maraca-icon">🎸</div>
            <h1>¡Es hora de agitar!</h1>
            <p class="subtitle">Maraca activada</p>
        </div>
        <div class="status-container">
            <div class="status-indicator active">
                🎵
            </div>
            <p class="status-text" id="status-message">¡Agita tu teléfono!</p>
            <div class="instructions">
                <p>🎶 Mueve el teléfono para hacer sonar la maraca</p>
                <p>📊 Los sensores están activos</p>
            </div>
        </div>
    `;
}

function showShakeEffect() {
    const container = document.querySelector('.container');
    const statusMessage = document.getElementById('status-message');
    
    if (container) {
        container.classList.add('shake-animation');
        setTimeout(() => {
            container.classList.remove('shake-animation');
        }, 500);
    }
    
    if (statusMessage) {
        statusMessage.textContent = '¡Agitando! 🎸';
        setTimeout(() => {
            statusMessage.textContent = '¡Agita tu teléfono!';
        }, 1000);
    }
    
    // Mostrar mensaje de éxito temporal
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.textContent = '🎵 ¡Maraca sonando!';
    document.body.appendChild(successMsg);
    
    setTimeout(() => {
        if (successMsg.parentNode) {
            successMsg.parentNode.removeChild(successMsg);
        }
    }, 2000);
}

// Socket.IO Event Handlers
if (typeof io !== 'undefined') {
    // 1. Manejador para cambiar a la escena 3
    socket.on('cambiar_a_escena_3', () => {
        showWaitingInterface();
    });

    // 2. Manejador para activar la maraca
    socket.on('activar_maraca', async () => {
        try {
            // Solicitar permisos para iOS
            if (typeof DeviceMotionEvent?.requestPermission === 'function') {
                const r1 = await DeviceMotionEvent.requestPermission();
                const r2 = await DeviceOrientationEvent.requestPermission();
                
                if (r1 !== 'granted' || r2 !== 'granted') {
                    throw new Error('Permisos denegados');
                }
            }
            
            // Activar la maraca
            maracaActivated = true;
            showReadyInterface();
            
            // Agregar listener de movimiento
            window.addEventListener('devicemotion', (e) => {
                if (!maracaActivated) return;
                
                const now = Date.now();
                if (now - lastSentTime < throttleDelay) return;
                
                const acceleration = e.accelerationIncludingGravity;
                if (acceleration) {
                    const x = acceleration.x || 0;
                    const y = acceleration.y || 0;
                    const z = acceleration.z || 0;
                    const magnitude = Math.sqrt(x*x + y*y + z*z);
                    
                    // Detectar movimiento significativo
                    if (magnitude > 15) {
                        // Mostrar efecto visual
                        showShakeEffect();
                        
                        // Reproducir sonido
                        if (maracaSound) {
                            try {
                                maracaSound.currentTime = 0;
                                maracaSound.play().catch(console.log);
                            } catch (error) {
                                console.log('Error reproduciendo sonido:', error);
                            }
                        }
                        
                        // Enviar datos al servidor
                        socket.emit('maraca_agitada', {
                            x: x,
                            y: y,
                            z: z,
                            magnitude: magnitude,
                            timestamp: Date.now(),
                            real: true
                        });
                        
                        lastSentTime = now;
                    }
                }
            }, { passive: true });
            
            // Reproducir sonido de prueba
            if (maracaSound) {
                maracaSound.play().catch(console.log);
            }
            
        } catch (err) {
            console.error('Error activando maraca:', err);
            mainContainer.innerHTML = `
                <div class="maraca-header">
                    <div class="maraca-icon">❌</div>
                    <h1>Error</h1>
                    <p class="subtitle">No se pudo activar la maraca</p>
                </div>
                <div class="status-container">
                    <div class="status-indicator waiting">
                        ⚠️
                    </div>
                    <p class="status-text">Error: ${err.message}</p>
                    <div class="instructions">
                        <p>Por favor, recarga la página e intenta de nuevo</p>
                    </div>
                </div>
            `;
        }
    });
}

// Mostrar interfaz inicial
showWaitingInterface();