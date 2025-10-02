const socket = io();
const mainContainer = document.getElementById('main-container');

let photoImg;
let stickerImages = [];
let selectedSticker = null;
let dragGhost = null;
let placedStickers = [];

// Función de P5.js para precargar assets
function preload() {
    // Cargar la imagen de sticker (palmera)
    for (let i = 0; i < 4; i++) {
        stickerImages[i] = loadImage('../assets/palmera.png');
    }
}

// Función de P5.js para configuración inicial
function setup() {
    noCanvas(); // No necesitamos canvas para esta interfaz
}

// Funciones de UI
function showWaitingInterface() {
    mainContainer.innerHTML = `
        <div class="header">
            <h1>🌴 Stickers</h1>
            <p class="subtitle">Bad Bunny DTMF Experience</p>
        </div>
        <div class="main-content">
            <div class="status-card">
                <div class="status-icon">📸</div>
                <p class="status-text">Esperando la foto...</p>
                <p style="font-size: 0.9em; color: #888;">La foto se tomará pronto</p>
            </div>
            <div class="photo-area">
                <div class="photo-placeholder">
                    <div class="icon">🖼️</div>
                    <p>La foto aparecerá aquí</p>
                </div>
            </div>
            <div class="instructions">
                <p>📸 Espera a que se tome la foto para agregar stickers</p>
            </div>
        </div>
    `;
}

function showStickerInterface(photoData) {
    mainContainer.innerHTML = `
        <div class="header">
            <h1>🌴 Agregar Stickers</h1>
            <p class="subtitle">Arrastra un sticker a la foto</p>
        </div>
        <div class="main-content">
            <div class="photo-area" id="photo-area">
                <img src="${photoData}" alt="Foto tomada" class="photo-img" id="photo-img">
            </div>
            <div class="sticker-palette">
                <p class="palette-title">Selecciona un sticker:</p>
                <div class="sticker-options">
                    <div class="sticker-option" data-sticker="0">🌴</div>
                    <div class="sticker-option" data-sticker="1">🌴</div>
                    <div class="sticker-option" data-sticker="2">🌴</div>
                    <div class="sticker-option" data-sticker="3">🌴</div>
                </div>
            </div>
            <div class="instructions">
                <p>1. Toca un sticker para seleccionarlo</p>
                <p>2. Arrastra y suelta en la foto</p>
            </div>
        </div>
    `;
    
    setupStickerInteraction();
}

function setupStickerInteraction() {
    const stickerOptions = document.querySelectorAll('.sticker-option');
    const photoArea = document.getElementById('photo-area');
    
    // Manejar selección de stickers
    stickerOptions.forEach((option, index) => {
        option.addEventListener('click', () => {
            // Remover selección previa
            stickerOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Seleccionar nuevo sticker
            option.classList.add('selected');
            selectedSticker = index;
        });
    });
    
    // Manejar drag and drop
    let isDragging = false;
    let startX, startY;
    
    // Touch events para móviles
    photoArea.addEventListener('touchstart', handleStart, { passive: false });
    photoArea.addEventListener('touchmove', handleMove, { passive: false });
    photoArea.addEventListener('touchend', handleEnd, { passive: false });
    
    // Mouse events para desktop
    photoArea.addEventListener('mousedown', handleStart);
    photoArea.addEventListener('mousemove', handleMove);
    photoArea.addEventListener('mouseup', handleEnd);
    
    function handleStart(e) {
        if (selectedSticker === null) return;
        
        e.preventDefault();
        isDragging = true;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        startX = clientX;
        startY = clientY;
        
        // Crear ghost del sticker
        createDragGhost(clientX, clientY);
    }
    
    function handleMove(e) {
        if (!isDragging || !dragGhost) return;
        
        e.preventDefault();
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        // Mover el ghost
        dragGhost.style.left = clientX + 'px';
        dragGhost.style.top = clientY + 'px';
    }
    
    function handleEnd(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        isDragging = false;
        
        const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
        
        // Verificar si se soltó sobre la foto
        const photoRect = photoArea.getBoundingClientRect();
        
        if (clientX >= photoRect.left && clientX <= photoRect.right &&
            clientY >= photoRect.top && clientY <= photoRect.bottom) {
            
            // Calcular posición relativa
            const relativeX = (clientX - photoRect.left) / photoRect.width;
            const relativeY = (clientY - photoRect.top) / photoRect.height;
            
            // Colocar sticker
            placeStickerOnPhoto(relativeX, relativeY, selectedSticker);
        }
        
        // Limpiar ghost
        if (dragGhost) {
            document.body.removeChild(dragGhost);
            dragGhost = null;
        }
    }
}

function createDragGhost(x, y) {
    dragGhost = document.createElement('div');
    dragGhost.className = 'drag-ghost';
    dragGhost.textContent = '🌴';
    dragGhost.style.left = x + 'px';
    dragGhost.style.top = y + 'px';
    document.body.appendChild(dragGhost);
}

function placeStickerOnPhoto(relativeX, relativeY, stickerId) {
    // Crear elemento del sticker en la foto
    const photoArea = document.getElementById('photo-area');
    const stickerElement = document.createElement('div');
    stickerElement.style.position = 'absolute';
    stickerElement.style.left = (relativeX * 100) + '%';
    stickerElement.style.top = (relativeY * 100) + '%';
    stickerElement.style.transform = 'translate(-50%, -50%)';
    stickerElement.style.fontSize = '2em';
    stickerElement.style.zIndex = '10';
    stickerElement.textContent = '🌴';
    photoArea.appendChild(stickerElement);
    
    // Guardar sticker colocado
    const stickerData = {
        stickerId: stickerId,
        x: relativeX,
        y: relativeY,
        timestamp: Date.now()
    };
    
    placedStickers.push(stickerData);
    
    // Enviar al servidor
    socket.emit('sticker_enviado', stickerData);
    
    // Mostrar animación de éxito
    showSuccessAnimation();
    
    // Deseleccionar sticker
    const stickerOptions = document.querySelectorAll('.sticker-option');
    stickerOptions.forEach(opt => opt.classList.remove('selected'));
    selectedSticker = null;
}

function showSuccessAnimation() {
    const successMsg = document.createElement('div');
    successMsg.className = 'success-animation';
    successMsg.textContent = '🌴 ¡Sticker agregado!';
    document.body.appendChild(successMsg);
    
    setTimeout(() => {
        if (successMsg.parentNode) {
            successMsg.parentNode.removeChild(successMsg);
        }
    }, 2000);
}

// Variables para Estado 2 (Pistola de bengalas)
let pistolaModo = false;
let ultimaOrientacion = { beta: 0, gamma: 0 };

// Variables para selfies
let selfieMode = false;
let selfieVideo = null;

// Funciones para Estado 2
function showPistolaInterface() {
    mainContainer.innerHTML = `
        <div class="header">
            <h1>🔫 Pistola de Bengalas</h1>
            <p class="subtitle">Móvil 2 - Bad Bunny DTMF</p>
        </div>
        <div class="main-content">
            <div class="status-card">
                <div class="status-icon" id="pistola-icon">🎯</div>
                <p class="status-text" id="pistola-status">Apunta hacia arriba y espera la orden</p>
            </div>
            <div class="photo-area" style="border: 3px solid #e91e63; background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);">
                <div class="photo-placeholder">
                    <div class="icon" style="font-size: 4em;">🔫</div>
                    <p style="font-size: 1.2em; margin-top: 15px;">Sostén como una pistola</p>
                    <p style="font-size: 1em; color: #666;">Apunta hacia arriba ⬆️</p>
                </div>
            </div>
            <div class="instructions">
                <p>🔫 Sostén el teléfono como una pistola</p>
                <p>⬆️ Apunta hacia arriba para estar listo</p>
                <p>⚡ Espera la orden de disparo del productor</p>
            </div>
        </div>
    `;
}

function showDisparoEffect() {
    const container = document.querySelector('.container');
    const statusText = document.getElementById('pistola-status');
    const pistolaIcon = document.getElementById('pistola-icon');
    
    // Cambiar colores a efecto de disparo
    if (container) {
        container.style.background = 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)';
        setTimeout(() => {
            container.style.background = '';
        }, 1000);
    }
    
    if (pistolaIcon) {
        pistolaIcon.textContent = '💥';
        pistolaIcon.style.fontSize = '4em';
        pistolaIcon.style.animation = 'pulse 0.5s ease-out';
    }
    
    if (statusText) {
        statusText.textContent = '💥 ¡DISPARADO!';
        statusText.style.color = '#4ecdc4';
        statusText.style.fontWeight = 'bold';
        
        setTimeout(() => {
            statusText.textContent = 'Apunta hacia arriba y espera la orden';
            statusText.style.color = '';
            statusText.style.fontWeight = '';
            if (pistolaIcon) {
                pistolaIcon.textContent = '🎯';
                pistolaIcon.style.fontSize = '';
                pistolaIcon.style.animation = '';
            }
        }, 2000);
    }
    
    // Efecto de flash
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.background = '#4ecdc4';
    flash.style.zIndex = '9999';
    flash.style.opacity = '0.7';
    flash.style.pointerEvents = 'none';
    document.body.appendChild(flash);
    
    setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
        }, 200);
    }, 150);
}

function detectarOrientacion(event) {
    if (!pistolaModo) return;
    
    const beta = event.beta || 0;
    const gamma = event.gamma || 0;
    
    ultimaOrientacion = { beta, gamma };
    
    const apuntandoArriba = beta < -30;
    
    const pistolaIcon = document.getElementById('pistola-icon');
    const statusText = document.getElementById('pistola-status');
    
    if (apuntandoArriba) {
        if (pistolaIcon) {
            pistolaIcon.textContent = '🎯';
            pistolaIcon.style.color = '#4ecdc4';
        }
        if (statusText) {
            statusText.textContent = '¡Perfecto! Apuntando arriba - Listo para disparar';
            statusText.style.color = '#4ecdc4';
        }
    } else {
        if (pistolaIcon) {
            pistolaIcon.textContent = '📱';
            pistolaIcon.style.color = '#e91e63';
        }
        if (statusText) {
            statusText.textContent = 'Apunta más hacia arriba para estar listo';
            statusText.style.color = '#e91e63';
        }
    }
}

// Funciones para selfies
function showSelfieInterface() {
    mainContainer.innerHTML = `
        <div class="header">
            <h1>🤳 ¡Hora de la Selfie!</h1>
            <p class="subtitle">Móvil 2 - Tómate una selfie</p>
        </div>
        <div class="main-content">
            <div class="status-card">
                <div class="status-icon">📸</div>
                <p class="status-text">¡Sonríe para la cámara!</p>
            </div>
            <div class="photo-area" id="selfie-preview" style="height: 300px; background: #000; border: 3px solid #4ecdc4;">
                <div class="photo-placeholder">
                    <div class="icon">📷</div>
                    <p>Iniciando cámara...</p>
                </div>
            </div>
            <button id="take-selfie-btn" style="
                width: 100%; 
                padding: 20px; 
                font-size: 1.5em; 
                background: linear-gradient(45deg, #4ecdc4, #44a08d); 
                color: white; 
                border: none; 
                border-radius: 15px; 
                cursor: pointer;
                font-weight: bold;
                margin-top: 15px;
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
        videoElement.style.borderRadius = '12px';
        
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
                <div class="photo-placeholder">
                    <div class="icon">❌</div>
                    <p>Error accediendo a la cámara</p>
                    <p style="font-size: 0.8em;">${error.message}</p>
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
        mobileId: 2,
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
    // Efecto de flash azul/verde
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.background = '#4ecdc4';
    flash.style.zIndex = '9999';
    flash.style.opacity = '0.7';
    flash.style.pointerEvents = 'none';
    document.body.appendChild(flash);
    
    setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
        }, 200);
    }, 150);
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
        
        const apuntandoArriba = ultimaOrientacion.beta < -30;
        
        if (apuntandoArriba) {
            showDisparoEffect();
            
            socket.emit('disparo_realizado', {
                mobileId: 2, // Móvil 2
                orientation: ultimaOrientacion,
                apuntandoArriba: true,
                intensity: Math.abs(ultimaOrientacion.beta) / 90,
                timestamp: Date.now()
            });
        } else {
            const statusText = document.getElementById('pistola-status');
            if (statusText) {
                statusText.textContent = '❌ ¡Apunta hacia arriba para disparar!';
                statusText.style.color = '#ff4757';
                setTimeout(() => {
                    statusText.textContent = 'Apunta hacia arriba y espera la orden';
                    statusText.style.color = '';
                }, 2000);
            }
        }
    });

    // 3. Cambiar a escena 3
    socket.on('cambiar_a_escena_3', () => {
        // Desactivar modo pistola
        pistolaModo = false;
        window.removeEventListener('deviceorientation', detectarOrientacion);
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

    // 5. Finalizar experiencia (volver a estado neutral)
    socket.on('finalizar_experiencia', () => {
        // Desactivar todos los modos
        pistolaModo = false;
        selfieMode = false;
        
        // Remover listeners
        window.removeEventListener('deviceorientation', detectarOrientacion);
        
        // Detener cámara si está activa
        if (selfieVideo && selfieVideo.srcObject) {
            selfieVideo.srcObject.getTracks().forEach(track => track.stop());
        }
        
        showNeutralState();
    });
    
    // Mostrar foto
    socket.on('mostrar_foto', (photoData) => {
        showStickerInterface(photoData);
    });
    
    // Agregar sticker desde otro cliente
    socket.on('agregar_sticker_visualizador', (stickerData) => {
        // Este evento es principalmente para el visualizador
        // Aquí podríamos mostrar que otro usuario agregó un sticker
    });
}

// Función para mostrar estado neutral inicial
function showNeutralState() {
    mainContainer.innerHTML = `
        <div class="header">
            <h1>🌴 Bad Bunny DTMF</h1>
            <p class="subtitle">Móvil 2 - Esperando instrucciones</p>
        </div>
        <div class="main-content">
            <div class="status-card">
                <div class="status-icon">⏳</div>
                <p class="status-text">Sistema en espera...</p>
                <p style="font-size: 0.9em; color: #888;">Esperando activación desde el control remoto</p>
            </div>
            <div class="photo-area">
                <div class="photo-placeholder">
                    <div class="icon">📱</div>
                    <p>Mantén el teléfono listo</p>
                </div>
            </div>
            <div class="instructions">
                <p>⚡ El sistema se activará automáticamente</p>
            </div>
        </div>
    `;
}

// Mostrar estado inicial neutral
showNeutralState();