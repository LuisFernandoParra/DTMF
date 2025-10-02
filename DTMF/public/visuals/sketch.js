const socket = io();
const contentArea = document.getElementById('content-area');
const musicIndicator = document.getElementById('music-indicator');

let backgroundMusic;
let stickerImages = [];
let currentPhoto = null;
let placedStickers = [];
let selfieCollage = [];
let showingCollage = false;

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
    showNeutralScreen();
}

// Función para mostrar pantalla neutral inicial
function showNeutralScreen() {
    contentArea.innerHTML = `
        <div class="waiting-screen">
            <div class="logo">🎸</div>
            <h1 class="title">Bad Bunny DTMF</h1>
            <p class="subtitle">Experiencia Interactiva</p>
            <div class="status-message">
                Sistema en espera - Esperando activación...
            </div>
        </div>
    `;
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

function createLightBeam(data) {
    // Crear el rayo de luz que sube desde abajo
    const lightBeam = document.createElement('div');
    lightBeam.className = 'light-beam';
    
    // Posición inicial (abajo de la pantalla)
    const startX = data.mobileId === 1 ? '25%' : '75%'; // Móvil 1 a la izquierda, Móvil 2 a la derecha
    
    lightBeam.style.position = 'fixed';
    lightBeam.style.bottom = '0';
    lightBeam.style.left = startX;
    lightBeam.style.transform = 'translateX(-50%)';
    lightBeam.style.width = '20px';
    lightBeam.style.height = '100px';
    lightBeam.style.background = `linear-gradient(to top, ${data.color}, transparent)`;
    lightBeam.style.borderRadius = '10px';
    lightBeam.style.boxShadow = `0 0 30px ${data.color}`;
    lightBeam.style.zIndex = '1000';
    lightBeam.style.animation = 'lightBeamRise 2s ease-out forwards';
    
    document.body.appendChild(lightBeam);
    
    // Crear partículas brillantes que siguen el rayo
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createSparkle(startX, data.color);
        }, i * 200);
    }
    
    // Cuando el rayo llega arriba, crear fuegos artificiales
    setTimeout(() => {
        createFireworks(startX, data.color, data.intensity);
        
        // Remover el rayo
        if (lightBeam.parentNode) {
            lightBeam.parentNode.removeChild(lightBeam);
        }
    }, 2000);
}

function createSparkle(x, color) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.position = 'fixed';
    sparkle.style.left = x;
    sparkle.style.bottom = Math.random() * 80 + 10 + '%';
    sparkle.style.transform = 'translateX(-50%)';
    sparkle.style.width = '8px';
    sparkle.style.height = '8px';
    sparkle.style.background = color;
    sparkle.style.borderRadius = '50%';
    sparkle.style.boxShadow = `0 0 15px ${color}`;
    sparkle.style.zIndex = '999';
    sparkle.style.animation = 'sparkleFloat 1s ease-out forwards';
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
        if (sparkle.parentNode) {
            sparkle.parentNode.removeChild(sparkle);
        }
    }, 1000);
}

function createFireworks(x, color, intensity = 1) {
    // Crear múltiples explosiones de fuegos artificiales
    const numFireworks = Math.floor(intensity * 3) + 2;
    
    for (let i = 0; i < numFireworks; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.className = 'firework';
            
            // Posición cerca del punto de impacto
            const offsetX = (Math.random() - 0.5) * 200;
            const offsetY = (Math.random() - 0.5) * 100;
            
            firework.style.position = 'fixed';
            firework.style.left = `calc(${x} + ${offsetX}px)`;
            firework.style.top = `calc(20% + ${offsetY}px)`;
            firework.style.transform = 'translateX(-50%)';
            firework.style.fontSize = (2 + intensity) + 'em';
            firework.style.zIndex = '1001';
            firework.style.animation = 'fireworkExplode 1.5s ease-out forwards';
            firework.textContent = '🎆';
            firework.style.color = color;
            firework.style.textShadow = `0 0 20px ${color}`;
            
            document.body.appendChild(firework);
            
            // Crear partículas adicionales
            createFireworkParticles(firework, color);
            
            setTimeout(() => {
                if (firework.parentNode) {
                    firework.parentNode.removeChild(firework);
                }
            }, 1500);
        }, i * 300);
    }
    
    // Efecto de flash en toda la pantalla
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.background = color;
    flash.style.opacity = '0.3';
    flash.style.zIndex = '998';
    flash.style.pointerEvents = 'none';
    flash.style.animation = 'screenFlash 0.5s ease-out';
    
    document.body.appendChild(flash);
    
    setTimeout(() => {
        if (flash.parentNode) {
            flash.parentNode.removeChild(flash);
        }
    }, 500);
}

function createFireworkParticles(centerElement, color) {
    const rect = centerElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Crear 8 partículas que salen en todas las direcciones
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.width = '6px';
        particle.style.height = '6px';
        particle.style.background = color;
        particle.style.borderRadius = '50%';
        particle.style.boxShadow = `0 0 10px ${color}`;
        particle.style.zIndex = '1000';
        
        const angle = (i / 8) * 2 * Math.PI;
        const distance = 100 + Math.random() * 50;
        const endX = centerX + Math.cos(angle) * distance;
        const endY = centerY + Math.sin(angle) * distance;
        
        particle.style.animation = `particleExplode 1s ease-out forwards`;
        particle.style.setProperty('--end-x', endX + 'px');
        particle.style.setProperty('--end-y', endY + 'px');
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 1000);
    }
}

// Funciones para el collage de selfies
function showSelfieCollage() {
    showingCollage = true;
    
    contentArea.innerHTML = `
        <div class="selfie-collage-container">
            <div class="collage-header">
                <h1 class="collage-title">🤳 ¡Collage de Selfies!</h1>
                <p class="collage-subtitle">Bad Bunny DTMF Experience</p>
            </div>
            <div class="selfie-grid" id="selfie-grid">
                <!-- Las selfies se agregarán aquí dinámicamente -->
            </div>
            <div class="collage-footer">
                <p>Esperando más selfies...</p>
            </div>
        </div>
    `;
    
    // Agregar estilos para el collage
    addCollageStyles();
    
    // Mostrar selfies existentes
    selfieCollage.forEach(selfie => {
        addSelfieToCollage(selfie);
    });
}

function addSelfieToCollage(selfie) {
    const selfieGrid = document.getElementById('selfie-grid');
    if (!selfieGrid) return;
    
    // Crear contenedor para la selfie
    const selfieContainer = document.createElement('div');
    selfieContainer.className = 'selfie-item';
    selfieContainer.style.animationDelay = (selfieCollage.length * 0.3) + 's';
    
    // Crear imagen
    const selfieImg = document.createElement('img');
    selfieImg.src = selfie.imageData;
    selfieImg.alt = `Selfie Móvil ${selfie.mobileId}`;
    selfieImg.className = 'selfie-image';
    
    // Crear etiqueta
    const selfieLabel = document.createElement('div');
    selfieLabel.className = 'selfie-label';
    selfieLabel.textContent = `Móvil ${selfie.mobileId}`;
    selfieLabel.style.background = selfie.mobileId === 1 ? '#ff6b6b' : '#4ecdc4';
    
    selfieContainer.appendChild(selfieImg);
    selfieContainer.appendChild(selfieLabel);
    selfieGrid.appendChild(selfieContainer);
    
    // Actualizar contador
    const footer = document.querySelector('.collage-footer p');
    if (footer) {
        const totalSelfies = selfieCollage.length;
        if (totalSelfies >= 2) {
            footer.textContent = `¡Collage completo con ${totalSelfies} selfies!`;
        } else {
            footer.textContent = `${totalSelfies}/2 selfies recibidas...`;
        }
    }
}

function addCollageStyles() {
    const collageStyle = document.createElement('style');
    collageStyle.textContent = `
        .selfie-collage-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            padding: 40px;
            text-align: center;
        }
        
        .collage-header {
            margin-bottom: 40px;
        }
        
        .collage-title {
            font-size: 4em;
            margin-bottom: 15px;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: titlePulse 2s infinite;
        }
        
        @keyframes titlePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        .collage-subtitle {
            font-size: 1.5em;
            color: rgba(255, 255, 255, 0.8);
        }
        
        .selfie-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            max-width: 800px;
            width: 100%;
            margin-bottom: 30px;
        }
        
        .selfie-item {
            position: relative;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            overflow: hidden;
            backdrop-filter: blur(10px);
            border: 3px solid rgba(255, 255, 255, 0.2);
            animation: selfieAppear 0.8s ease-out forwards;
            transform: scale(0) rotate(180deg);
        }
        
        @keyframes selfieAppear {
            0% { 
                transform: scale(0) rotate(180deg);
                opacity: 0;
            }
            50% {
                transform: scale(1.1) rotate(90deg);
                opacity: 0.8;
            }
            100% { 
                transform: scale(1) rotate(0deg);
                opacity: 1;
            }
        }
        
        .selfie-image {
            width: 100%;
            height: 250px;
            object-fit: cover;
            display: block;
        }
        
        .selfie-label {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 15px;
            color: white;
            font-weight: bold;
            font-size: 1.2em;
            text-align: center;
        }
        
        .collage-footer {
            font-size: 1.3em;
            color: rgba(255, 255, 255, 0.9);
            animation: footerPulse 1.5s infinite;
        }
        
        @keyframes footerPulse {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .selfie-grid {
                grid-template-columns: 1fr;
                max-width: 400px;
            }
            
            .collage-title {
                font-size: 2.5em;
            }
        }
    `;
    document.head.appendChild(collageStyle);
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
                
                // Volver al estado neutral después de 5 segundos
                setTimeout(() => {
                    if (finalMessage.parentNode) {
                        finalMessage.parentNode.removeChild(finalMessage);
                    }
                    showNeutralScreen();
                }, 5000);
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
    
    // Mostrar disparo de luz que sube (Estado 2)
    socket.on('mostrar_disparo_luz', (data) => {
        createLightBeam(data);
    });
    
    // Activar modo selfie después de los fuegos artificiales
    socket.on('activar_selfies', () => {
        // Esperar 2 segundos después de los fuegos artificiales para mostrar el collage
        setTimeout(() => {
            showSelfieCollage();
        }, 2000);
    });
    
    // Agregar selfie al collage
    socket.on('agregar_selfie_collage', (selfie) => {
        console.log('🤳 Nueva selfie recibida:', selfie.mobileId);
        
        // Agregar a la colección
        selfieCollage.push(selfie);
        
        // Si ya estamos mostrando el collage, agregar la selfie
        if (showingCollage) {
            addSelfieToCollage(selfie);
        }
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
    
    @keyframes lightBeamRise {
        0% { 
            transform: translateX(-50%) scaleY(0);
            transform-origin: bottom;
            opacity: 0.8;
        }
        20% {
            transform: translateX(-50%) scaleY(1);
            opacity: 1;
        }
        100% { 
            transform: translateX(-50%) scaleY(8) translateY(-50%);
            opacity: 0.9;
        }
    }
    
    @keyframes sparkleFloat {
        0% { 
            opacity: 0;
            transform: translateX(-50%) scale(0);
        }
        50% {
            opacity: 1;
            transform: translateX(-50%) scale(1.2);
        }
        100% { 
            opacity: 0;
            transform: translateX(-50%) scale(0) translateY(-50px);
        }
    }
    
    @keyframes screenFlash {
        0% { opacity: 0.3; }
        50% { opacity: 0.6; }
        100% { opacity: 0; }
    }
    
    @keyframes particleExplode {
        0% { 
            opacity: 1;
            transform: scale(1);
        }
        100% { 
            opacity: 0;
            transform: scale(0.5) translate(
                calc(var(--end-x) - 50vw), 
                calc(var(--end-y) - 50vh)
            );
        }
    }
    
    .light-beam {
        filter: blur(2px);
    }
    
    .sparkle {
        filter: blur(1px);
    }
`;
document.head.appendChild(style);
