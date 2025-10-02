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

// Socket.IO Event Handlers
if (typeof io !== 'undefined') {
    // Cambiar a escena 3
    socket.on('cambiar_a_escena_3', () => {
        showWaitingInterface();
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

// Mostrar interfaz inicial
showWaitingInterface();