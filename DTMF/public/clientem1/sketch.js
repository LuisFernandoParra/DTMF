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

// Variables para Estado 2 (Pistola de bengalas)
let pistolaModo = false;
let orientacionListener = null;
let ultimaOrientacion = { beta: 0, gamma: 0 };

// Variables para selfies
let selfieMode = false;
let selfieVideo = null;

// Funciones para Estado 2
function showPistolaInterface() {
    mainContainer.innerHTML = `
        <div class="maraca-header">
            <div class="maraca-icon">🔫</div>
            <h1>Pistola de Bengalas</h1>
            <p class="subtitle">Móvil 1 - Bad Bunny DTMF</p>
        </div>
        <div class="status-container">
            <div class="status-indicator waiting">
                🎯
            </div>
            <p class="status-text" id="pistola-status">Apunta hacia arriba y espera la orden</p>
            <div class="instructions">
                <p>🔫 Sostén el teléfono como una pistola</p>
                <p>⬆️ Apunta hacia arriba</p>
                <p>⚡ Espera la orden de disparo</p>
            </div>
        </div>
    `;
}

function showPistolaReady() {
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.getElementById('pistola-status');
    
    if (statusIndicator) {
        statusIndicator.className = 'status-indicator ready';
        statusIndicator.textContent = '🎯';
    }
    
    if (statusText) {
        statusText.textContent = '¡Listo para disparar! Esperando orden...';
    }
}

function showDisparoEffect() {
    // Efecto visual de disparo
    const container = document.querySelector('.container');
    const statusText = document.getElementById('pistola-status');
    
    if (container) {
        container.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%)';
        container.classList.add('shake-animation');
        
        setTimeout(() => {
            container.classList.remove('shake-animation');
            container.style.background = '';
        }, 1000);
    }
    
    if (statusText) {
        statusText.textContent = '💥 ¡DISPARADO!';
        setTimeout(() => {
            statusText.textContent = 'Apunta hacia arriba y espera la orden';
        }, 2000);
    }
    
    // Efecto de flash
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.background = '#fff';
    flash.style.zIndex = '9999';
    flash.style.opacity = '0.8';
    flash.style.pointerEvents = 'none';
    document.body.appendChild(flash);
    
    setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
        }, 200);
    }, 100);
}

function detectarOrientacion(event) {
    if (!pistolaModo) return;
    
    const beta = event.beta || 0; // Inclinación adelante/atrás
    const gamma = event.gamma || 0; // Inclinación izquierda/derecha
    
    ultimaOrientacion = { beta, gamma };
    
    // Detectar si está apuntando hacia arriba
    // Beta negativo significa que apunta hacia arriba
    const apuntandoArriba = beta < -30; // Más de 30 grados hacia arriba
    
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.getElementById('pistola-status');
    
    if (apuntandoArriba) {
        if (statusIndicator) {
            statusIndicator.className = 'status-indicator ready';
            statusIndicator.textContent = '🎯';
        }
        if (statusText) {
            statusText.textContent = '¡Perfecto! Apuntando arriba - Listo para disparar';
        }
    } else {
        if (statusIndicator) {
            statusIndicator.className = 'status-indicator waiting';
            statusIndicator.textContent = '📱';
        }
        if (statusText) {
            statusText.textContent = 'Apunta más hacia arriba para estar listo';
        }
    }
}

// Funciones para selfies
function showSelfieInterface() {
    mainContainer.innerHTML = `
        <div class="maraca-header">
            <div class="maraca-icon">🤳</div>
            <h1>¡Hora de la Selfie!</h1>
            <p class="subtitle">Móvil 1 - Tómate una selfie</p>
        </div>
        <div class="status-container">
            <div class="camera-preview" id="selfie-preview" style="width: 100%; height: 300px; background: #000; border-radius: 15px; overflow: hidden; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white;">
                    📷 Iniciando cámara...
                </div>
            </div>
            <button id="take-selfie-btn" class="selfie-button" style="
                width: 100%; 
                padding: 20px; 
                font-size: 1.5em; 
                background: linear-gradient(45deg, #ff6b6b, #ff4757); 
                color: white; 
                border: none; 
                border-radius: 15px; 
                cursor: pointer;
                font-weight: bold;
            ">
                📸 ¡Tomar Selfie!
            </button>
        </div>
    `;
    
    initializeSelfieCamera();
}

async function initializeSelfieCamera() {
    try {
        // Solicitar acceso a la cámara frontal
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'user', // Cámara frontal
                width: { ideal: 640 }, 
                height: { ideal: 480 }
            } 
        });
        
        // Crear elemento de video
        const videoElement = document.createElement('video');
        videoElement.srcObject = stream;
        videoElement.autoplay = true;
        videoElement.muted = true;
        videoElement.style.width = '100%';
        videoElement.style.height = '100%';
        videoElement.style.objectFit = 'cover';
        
        // Reemplazar placeholder con video
        const preview = document.getElementById('selfie-preview');
        if (preview) {
            preview.innerHTML = '';
            preview.appendChild(videoElement);
        }
        
        selfieVideo = videoElement;
        
        // Agregar evento al botón
        const takeSelfieBtn = document.getElementById('take-selfie-btn');
        if (takeSelfieBtn) {
            takeSelfieBtn.addEventListener('click', takeSelfie);
        }
        
    } catch (error) {
        console.error('Error accediendo a la cámara:', error);
        const preview = document.getElementById('selfie-preview');
        if (preview) {
            preview.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; text-align: center;">
                    ❌ Error accediendo a la cámara<br>
                    <small>${error.message}</small>
                </div>
            `;
        }
    }
}

function takeSelfie() {
    if (!selfieVideo) return;
    
    // Crear canvas para capturar la imagen
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = selfieVideo.videoWidth || 640;
    canvas.height = selfieVideo.videoHeight || 480;
    
    // Dibujar el frame actual del video
    ctx.drawImage(selfieVideo, 0, 0);
    
    // Convertir a base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    // Enviar al servidor
    socket.emit('selfie_tomada', {
        mobileId: 1,
        imageData: imageData,
        timestamp: Date.now()
    });
    
    // Mostrar efecto de captura
    showSelfieEffect();
    
    // Deshabilitar botón temporalmente
    const takeSelfieBtn = document.getElementById('take-selfie-btn');
    if (takeSelfieBtn) {
        takeSelfieBtn.disabled = true;
        takeSelfieBtn.textContent = '✅ ¡Selfie enviada!';
        takeSelfieBtn.style.background = '#27ae60';
    }
}

function showSelfieEffect() {
    // Efecto de flash blanco
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.background = '#fff';
    flash.style.zIndex = '9999';
    flash.style.opacity = '0.8';
    flash.style.pointerEvents = 'none';
    document.body.appendChild(flash);
    
    setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
        }, 200);
    }, 100);
    
    // Sonido de cámara (si está disponible)
    if (maracaSound) {
        maracaSound.play().catch(console.log);
    }
}

// Socket.IO Event Handlers
if (typeof io !== 'undefined') {
    // 1. Manejador para activar pistolas de bengalas (Estado 2)
    socket.on('activar_pistolas_bengalas', async () => {
        try {
            pistolaModo = true;
            showPistolaInterface();
            
            // Solicitar permisos de orientación
            if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission !== 'granted') {
                    throw new Error('Permisos de orientación denegados');
                }
            }
            
            // Agregar listener de orientación
            window.addEventListener('deviceorientation', detectarOrientacion, { passive: true });
            
        } catch (err) {
            console.error('Error activando pistola:', err);
        }
    });
    
    // 2. Manejador para orden de disparo
    socket.on('orden_disparar', () => {
        if (!pistolaModo) return;
        
        // Verificar si está apuntando hacia arriba
        const apuntandoArriba = ultimaOrientacion.beta < -30;
        
        if (apuntandoArriba) {
            // Realizar disparo
            showDisparoEffect();
            
            // Enviar disparo al servidor
            socket.emit('disparo_realizado', {
                mobileId: 1, // Móvil 1
                orientation: ultimaOrientacion,
                apuntandoArriba: true,
                intensity: Math.abs(ultimaOrientacion.beta) / 90, // Intensidad basada en ángulo
                timestamp: Date.now()
            });
        } else {
            // Disparo fallido
            const statusText = document.getElementById('pistola-status');
            if (statusText) {
                statusText.textContent = '❌ ¡Apunta hacia arriba para disparar!';
                setTimeout(() => {
                    statusText.textContent = 'Apunta hacia arriba y espera la orden';
                }, 2000);
            }
        }
    });

    // 3. Manejador para cambiar a la escena 3
    socket.on('cambiar_a_escena_3', () => {
        // Desactivar modo pistola
        pistolaModo = false;
        if (orientacionListener) {
            window.removeEventListener('deviceorientation', detectarOrientacion);
        }
        showWaitingInterface();
    });
    
    // 4. Manejador para activar selfies
    socket.on('activar_selfies', () => {
        console.log('🤳 Activando modo selfie...');
        selfieMode = true;
        pistolaModo = false; // Desactivar modo pistola
        
        // Remover listener de orientación
        window.removeEventListener('deviceorientation', detectarOrientacion);
        
        showSelfieInterface();
    });

    // 5. Manejador para finalizar experiencia (volver a estado neutral)
    socket.on('finalizar_experiencia', () => {
        // Desactivar todos los modos
        pistolaModo = false;
        maracaActivated = false;
        selfieMode = false;
        
        // Remover listeners
        window.removeEventListener('deviceorientation', detectarOrientacion);
        
        // Detener cámara si está activa
        if (selfieVideo && selfieVideo.srcObject) {
            selfieVideo.srcObject.getTracks().forEach(track => track.stop());
        }
        
        showNeutralState();
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

// Función para mostrar estado neutral inicial
function showNeutralState() {
    mainContainer.innerHTML = `
        <div class="maraca-header">
            <div class="maraca-icon">🎸</div>
            <h1>Bad Bunny DTMF</h1>
            <p class="subtitle">Móvil 1 - Esperando instrucciones</p>
        </div>
        <div class="status-container">
            <div class="status-indicator waiting">
                ⏳
            </div>
            <p class="status-text">Sistema en espera...</p>
            <div class="instructions">
                <p>📱 Mantén el teléfono listo</p>
                <p>⚡ Esperando activación desde el control remoto</p>
            </div>
        </div>
    `;
}

// Mostrar estado inicial neutral
showNeutralState();