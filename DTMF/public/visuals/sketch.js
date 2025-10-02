const socket = io();
const contentArea = document.getElementById('content-area');
const musicIndicator = document.getElementById('music-indicator');

let backgroundMusic;
let stickerImages = [];
let currentPhoto = null;
let placedStickers = [];

// Función de P5.js para precargar assets
function preload() {
    // Cargar música de fondo
    backgroundMusic = loadSound('../assets/sonido/cancion.mp3');
    
    // Cargar imágenes de stickers
    for (let i = 0; i < 4; i++) {
        stickerImages[i] = loadImage('../assets/palmera.png');
    }
}

// Función de P5.js para configuración inicial
function setup() {
    noCanvas(); // No necesitamos canvas para esta interfaz
    showWaitingScreen();
}

// Funciones de UI
function showWaitingScreen() {
    contentArea.innerHTML = `
        <div class="waiting-screen">
            <div class="logo">🎸</div>
            <h1 class="title">Bad Bunny DTMF</h1>
            <p class="subtitle">Experiencia Interactiva</p>
            <div class="status-message">
                Esperando instrucciones del control remoto...
            </div>
        </div>
    `;
}

function showInstructionScreen(message, icon = "📸") {
    contentArea.innerHTML = `
        <div class="instruction-screen">
            <div class="instruction-icon">${icon}</div>
            <h2 class="instruction-text">${message}</h2>
            <p class="instruction-subtext">Sigue las instrucciones del presentador</p>
        </div>
    `;
}

function showPhotoWithStickers(photoData) {
    currentPhoto = photoData;
    
    contentArea.innerHTML = `
        <div class="photo-display" id="photo-display">
            <img src="${photoData}" alt="Foto grupal" class="photo-img">
        </div>
    `;
    
    // Volver a agregar stickers existentes
    placedStickers.forEach(sticker => {
        addStickerToPhoto(sticker);
    });
}

function addStickerToPhoto(stickerData) {
    const photoDisplay = document.getElementById('photo-display');
    if (!photoDisplay) return;
    
    const stickerElement = document.createElement('div');
    stickerElement.className = 'sticker-overlay';
    stickerElement.style.left = (stickerData.x * 100) + '%';
    stickerElement.style.top = (stickerData.y * 100) + '%';
    stickerElement.style.transform = 'translate(-50%, -50%)';
    stickerElement.textContent = '🌴';
    
    photoDisplay.appendChild(stickerElement);
}

function showMaracaEffect() {
    // Crear efecto visual de maraca
    const maracaEffect = document.createElement('div');
    maracaEffect.className = 'maraca-effect';
    maracaEffect.textContent = '🎸';
    document.body.appendChild(maracaEffect);
    
    // Remover después de la animación
    setTimeout(() => {
        if (maracaEffect.parentNode) {
            maracaEffect.parentNode.removeChild(maracaEffect);
        }
    }, 500);
    
    // Efecto de vibración en la pantalla
    const container = document.querySelector('.visualizer-container');
    container.style.animation = 'none';
    container.offsetHeight; // Trigger reflow
    container.style.animation = 'shake 0.5s ease-in-out';
    
    setTimeout(() => {
        container.style.animation = '';
    }, 500);
}

function showSmileVideo() {
    // Crear elemento de video para "¡Sonríe!"
    const video = document.createElement('video');
    video.className = 'smile-video';
    video.autoplay = true;
    video.muted = true;
    video.style.width = '400px';
    video.style.height = '300px';
    
    // Como no tenemos el video real, mostrar un mensaje animado
    const smileMessage = document.createElement('div');
    smileMessage.className = 'smile-video';
    smileMessage.style.background = 'linear-gradient(45deg, #ff6b6b, #4ecdc4)';
    smileMessage.style.padding = '40px 60px';
    smileMessage.style.fontSize = '3em';
    smileMessage.style.fontWeight = 'bold';
    smileMessage.style.color = 'white';
    smileMessage.style.textAlign = 'center';
    smileMessage.style.animation = 'pulse 1s infinite';
    smileMessage.textContent = '😊 ¡SONRÍE! 📸';
    
    document.body.appendChild(smileMessage);
    
    // Remover después de 5 segundos
    setTimeout(() => {
        if (smileMessage.parentNode) {
            smileMessage.parentNode.removeChild(smileMessage);
        }
    }, 5000);
}

function updateMusicIndicator(isPlaying, action = '') {
    if (isPlaying) {
        musicIndicator.style.display = 'block';
        musicIndicator.classList.add('music-playing');
        
        switch(action) {
            case 'play':
                musicIndicator.textContent = '🎵 Reproduciendo';
                break;
            case 'pause':
                musicIndicator.textContent = '⏸️ Pausado';
                musicIndicator.classList.remove('music-playing');
                break;
            case 'forward':
                musicIndicator.textContent = '⏭️ Siguiente';
                break;
            default:
                musicIndicator.textContent = '🎵 Música';
        }
    } else {
        musicIndicator.style.display = 'none';
        musicIndicator.classList.remove('music-playing');
    }
}

// Socket.IO Event Handlers
if (typeof io !== 'undefined') {
    
    // Cambiar a escena 3
    socket.on('cambiar_a_escena_3', () => {
        showInstructionScreen('Reúnanse todos para la foto', '📸');
    });
    
    // Mostrar GIF de sonríe
    socket.on('mostrar_gif_sonrie', () => {
        showSmileVideo();
    });
    
    // Mostrar foto
    socket.on('mostrar_foto', (photoData) => {
        showPhotoWithStickers(photoData);
    });
    
    // Agregar sticker
    socket.on('agregar_sticker_visualizador', (stickerData) => {
        placedStickers.push(stickerData);
        if (currentPhoto) {
            addStickerToPhoto(stickerData);
        }
    });
    
    // Efecto de maraca
    socket.on('efecto_maraca', (data) => {
        if (data.real) {
            showMaracaEffect();
        }
    });
    
    // Mostrar foto final
    socket.on('mostrar_foto_final', (data) => {
        if (data.foto) {
            showPhotoWithStickers(data.foto);
            
            // Agregar todos los stickers finales
            if (data.stickers && data.stickers.length > 0) {
                data.stickers.forEach(sticker => {
                    addStickerToPhoto(sticker);
                });
            }
            
            // Mostrar mensaje de finalización
            setTimeout(() => {
                const finalMessage = document.createElement('div');
                finalMessage.style.position = 'fixed';
                finalMessage.style.bottom = '50px';
                finalMessage.style.left = '50%';
                finalMessage.style.transform = 'translateX(-50%)';
                finalMessage.style.background = 'rgba(0, 0, 0, 0.8)';
                finalMessage.style.color = 'white';
                finalMessage.style.padding = '20px 40px';
                finalMessage.style.borderRadius = '20px';
                finalMessage.style.fontSize = '2em';
                finalMessage.style.fontWeight = 'bold';
                finalMessage.style.zIndex = '1000';
                finalMessage.textContent = '🎉 ¡Experiencia completada!';
                document.body.appendChild(finalMessage);
            }, 2000);
        }
    });
    
    // Control de música
    socket.on('control_musica_visualizador', (action) => {
        if (backgroundMusic) {
            switch(action) {
                case 'play':
                    backgroundMusic.play();
                    updateMusicIndicator(true, 'play');
                    break;
                case 'pause':
                    backgroundMusic.pause();
                    updateMusicIndicator(false, 'pause');
                    break;
                case 'forward':
                    // Adelantar 30 segundos
                    if (backgroundMusic.isPlaying()) {
                        backgroundMusic.jump(backgroundMusic.currentTime() + 30);
                    }
                    updateMusicIndicator(true, 'forward');
                    break;
            }
        }
    });
    
    // Iniciar estado 2 (fuegos artificiales)
    socket.on('activar_estado_2_moviles', () => {
        showInstructionScreen('¡Fuegos artificiales!', '🎆');
    });
    
    socket.on('cambiar_a_escena_2', () => {
        showInstructionScreen('Estado 2: Petardos y Tiros', '🎆');
    });
    
    socket.on('mostrar_fuego_artificial', (data) => {
        // Crear efecto de fuego artificial
        const firework = document.createElement('div');
        firework.style.position = 'fixed';
        firework.style.top = Math.random() * 50 + 25 + '%';
        firework.style.left = Math.random() * 50 + 25 + '%';
        firework.style.fontSize = '4em';
        firework.style.zIndex = '100';
        firework.style.animation = 'fireworkExplode 1s ease-out';
        firework.textContent = '🎆';
        
        document.body.appendChild(firework);
        
        setTimeout(() => {
            if (firework.parentNode) {
                firework.parentNode.removeChild(firework);
            }
        }, 1000);
    });
}

// Agregar estilos CSS dinámicos para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    @keyframes fireworkExplode {
        0% { transform: scale(0) rotate(0deg); opacity: 1; }
        50% { transform: scale(1.5) rotate(180deg); opacity: 0.8; }
        100% { transform: scale(2) rotate(360deg); opacity: 0; }
    }
`;
document.head.appendChild(style);
