const socket = io();
const mainContainer = document.getElementById('main-container');

let video;
let photoEnabled = false;

// Función de P5.js para configuración inicial
function setup() {
    noCanvas(); // No necesitamos canvas para esta interfaz
}

// Funciones de UI
function showWaitingInterface() {
    mainContainer.innerHTML = `
        <div class="header">
            <h1>📸 Cámara de Producción</h1>
            <p class="subtitle">Bad Bunny DTMF Experience</p>
        </div>
        
        <div class="status-indicator">
            <p class="status-text">
                <span class="waiting-animation">⏳</span> 
                Esperando activación del Estado 3
            </p>
            <p class="status-subtext">La cámara se activará automáticamente</p>
        </div>
        
        <div class="camera-section">
            <div class="camera-preview">
                <div class="camera-placeholder">
                    <div class="icon">📷</div>
                    <p>Cámara inactiva</p>
                    <p style="font-size: 0.8em; margin-top: 10px;">Esperando señal del control remoto</p>
                </div>
            </div>
        </div>
    `;
}

function showCameraInterface() {
    mainContainer.innerHTML = `
        <div class="header">
            <h1>📸 Cámara Activada</h1>
            <p class="subtitle">Lista para tomar la foto del grupo</p>
        </div>
        
        <div class="status-indicator">
            <p class="status-text">
                <span class="waiting-animation">📸</span> 
                Esperando autorización para tomar foto
            </p>
            <p class="status-subtext">El botón se habilitará cuando sea el momento</p>
        </div>
        
        <div class="camera-section">
            <div class="camera-preview" id="camera-preview">
                <div class="camera-placeholder">
                    <div class="icon">🔄</div>
                    <p>Iniciando cámara...</p>
                </div>
            </div>
            
            <div class="controls">
                <button class="btn btn-primary" id="test-camera-btn">
                    🔧 Probar Cámara
                </button>
                <button class="btn btn-success" id="take-photo-btn" disabled>
                    📸 Tomar Foto
                </button>
            </div>
        </div>
    `;
    
    setupCameraControls();
}

function showReadyInterface() {
    const statusIndicator = document.querySelector('.status-indicator');
    const takePhotoBtn = document.getElementById('take-photo-btn');
    
    if (statusIndicator) {
        statusIndicator.innerHTML = `
            <p class="status-text ready-indicator">
                ✅ ¡Listo para tomar la foto!
            </p>
            <p class="status-subtext">Presiona el botón cuando todos estén listos</p>
        `;
    }
    
    if (takePhotoBtn) {
        takePhotoBtn.disabled = false;
        takePhotoBtn.innerHTML = '📸 ¡TOMAR FOTO AHORA!';
    }
}

function setupCameraControls() {
    const testCameraBtn = document.getElementById('test-camera-btn');
    const takePhotoBtn = document.getElementById('take-photo-btn');
    const cameraPreview = document.getElementById('camera-preview');
    
    // Botón para probar cámara
    testCameraBtn.addEventListener('click', async () => {
        try {
            testCameraBtn.disabled = true;
            testCameraBtn.textContent = '🔄 Iniciando...';
            
            await initializeCamera();
            
            testCameraBtn.textContent = '✅ Cámara OK';
            testCameraBtn.style.background = '#27ae60';
            
        } catch (error) {
            console.error('Error inicializando cámara:', error);
            testCameraBtn.textContent = '❌ Error';
            testCameraBtn.style.background = '#e74c3c';
            
            cameraPreview.innerHTML = `
                <div class="camera-placeholder">
                    <div class="icon">❌</div>
                    <p>Error al acceder a la cámara</p>
                    <p style="font-size: 0.8em; margin-top: 10px;">
                        ${error.message || 'Verifica los permisos de cámara'}
                    </p>
                </div>
            `;
        }
    });
    
    // Botón para tomar foto
    takePhotoBtn.addEventListener('click', () => {
        if (photoEnabled && video) {
            takePhoto();
        }
    });
    
    // Inicializar cámara automáticamente
    setTimeout(() => {
        testCameraBtn.click();
    }, 1000);
}

async function initializeCamera() {
    const cameraPreview = document.getElementById('camera-preview');
    
    try {
        // Solicitar acceso a la cámara
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 1280 }, 
                height: { ideal: 720 },
                facingMode: 'user'
            } 
        });
        
        // Crear elemento de video
        const videoElement = document.createElement('video');
        videoElement.className = 'video-element';
        videoElement.srcObject = stream;
        videoElement.autoplay = true;
        videoElement.muted = true;
        
        // Reemplazar placeholder con video
        cameraPreview.innerHTML = '';
        cameraPreview.appendChild(videoElement);
        
        // Guardar referencia para p5.js
        video = createCapture(VIDEO);
        video.hide(); // Ocultar el elemento de p5.js, usamos el nuestro
        
        return videoElement;
        
    } catch (error) {
        throw new Error('No se pudo acceder a la cámara: ' + error.message);
    }
}

function takePhoto() {
    if (!video) return;
    
    // Efecto de flash
    const flash = document.getElementById('capture-flash');
    flash.classList.add('active');
    setTimeout(() => {
        flash.classList.remove('active');
    }, 300);
    
    // Capturar imagen
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Obtener el elemento de video actual
    const videoElement = document.querySelector('.video-element');
    if (videoElement) {
        canvas.width = videoElement.videoWidth || 640;
        canvas.height = videoElement.videoHeight || 480;
        ctx.drawImage(videoElement, 0, 0);
    } else {
        // Fallback usando p5.js
        canvas.width = video.width;
        canvas.height = video.height;
        ctx.drawImage(video.canvas, 0, 0);
    }
    
    // Convertir a base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    // Enviar al servidor
    socket.emit('foto_tomada', imageData);
    
    // Mostrar mensaje de éxito
    showSuccessMessage();
    
    // Deshabilitar botón
    const takePhotoBtn = document.getElementById('take-photo-btn');
    if (takePhotoBtn) {
        takePhotoBtn.disabled = true;
        takePhotoBtn.textContent = '✅ Foto Enviada';
        takePhotoBtn.style.background = '#27ae60';
    }
    
    // Actualizar estado
    const statusIndicator = document.querySelector('.status-indicator');
    if (statusIndicator) {
        statusIndicator.innerHTML = `
            <p class="status-text" style="color: #27ae60;">
                ✅ ¡Foto tomada y enviada!
            </p>
            <p class="status-subtext">La foto se ha enviado al visualizador y móviles</p>
        `;
    }
}

function showSuccessMessage() {
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.textContent = '📸 ¡Foto capturada exitosamente!';
    document.body.appendChild(successMsg);
    
    setTimeout(() => {
        if (successMsg.parentNode) {
            successMsg.parentNode.removeChild(successMsg);
        }
    }, 3000);
}

// Socket.IO Event Handlers
if (typeof io !== 'undefined') {
    // Cambiar a escena 3
    socket.on('cambiar_a_escena_3', () => {
        showCameraInterface();
    });
    
    // Habilitar foto
    socket.on('habilitar_foto', () => {
        photoEnabled = true;
        showReadyInterface();
    });
    
    // Finalizar experiencia (volver a estado neutral)
    socket.on('finalizar_experiencia', () => {
        photoEnabled = false;
        showNeutralState();
    });
}

// Función para mostrar estado neutral inicial
function showNeutralState() {
    mainContainer.innerHTML = `
        <div class="header">
            <h1>📸 Bad Bunny DTMF</h1>
            <p class="subtitle">Cliente Desktop - Esperando instrucciones</p>
        </div>
        
        <div class="status-indicator">
            <p class="status-text">
                <span class="waiting-animation">⏳</span> 
                Sistema en espera
            </p>
            <p class="status-subtext">Esperando activación desde el control remoto</p>
        </div>
        
        <div class="camera-section">
            <div class="camera-preview">
                <div class="camera-placeholder">
                    <div class="icon">💻</div>
                    <p>Cliente de producción listo</p>
                    <p style="font-size: 0.8em; margin-top: 10px;">La cámara se activará automáticamente</p>
                </div>
            </div>
        </div>
    `;
}

// Mostrar estado inicial neutral
showNeutralState();