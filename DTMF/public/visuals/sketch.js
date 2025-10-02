const socket = io();

let currentState = 0;
let musicPlaying = false;
let photoData = null;
let stickers = [];
let maracaActive = false;
let maracaIntensity = 0;
let videoElement;
let showVideo = false;
let videoStartTime = 0;
let musica;
let stickerImages = [];

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(0);
    
    // Crear elemento de video
    videoElement = createVideo('../assets/sonido/cancion.mp3');
    videoElement.hide();

    // Cargar sonido
    musica = loadSound('../assets/sonido/cancion.mp3');
    
    // Cargar imágenes de stickers (todas palmeras por ahora)
    stickerImages[0] = loadImage('../assets/palmera.png');
    stickerImages[1] = loadImage('../assets/palmera.png');
    stickerImages[2] = loadImage('../assets/palmera.png');
    stickerImages[3] = loadImage('../assets/palmera.png');
    
    // Escuchar eventos del servidor
    socket.on('currentState', (data) => {
        currentState = data.state;
        musicPlaying = data.musicPlaying;
        photoData = data.photoData;
    });
    
    socket.on('stateChanged', (data) => {
        currentState = data.state;
        musicPlaying = data.musicPlaying;
        
        if (currentState === 3) {
            showState3Message();
        }
    });
    
    socket.on('musicControl', (data) => {
        musicPlaying = data.playing;
        if (musicPlaying) {
            // Reproducir música de fondo
            // Aquí se implementaría la reproducción de música
            if (!musica.isPlaying()) {
                musica.loop();
            }
        }
        else {
            // Detener música de fondo
            musica.stop();
        }
    });
    
    socket.on('photoReceived', (data) => {
        photoData = data.photoData;
        showVideo = true;
        videoStartTime = millis();
    });
    
    socket.on('stickerAdded', (data) => {
        stickers.push(data);
    });
    
    socket.on('maracaMovement', (data) => {
        maracaActive = true;
        maracaIntensity = data.intensity || 0;
    });
}

function draw() {
    background(0);
    
    if (currentState === 0) {
        showWaitingScreen();
    } else if (currentState === 1) {
        showState1();
    } else if (currentState === 2) {
        showState2();
    } else if (currentState === 3) {
        showState3();
    }
}

function showWaitingScreen() {
    fill(255);
    textAlign(CENTER);
    textSize(48);
    text("ESPERANDO ACTIVACIÓN", width/2, height/2);
}

function showState1() {
    fill(255);
    textAlign(CENTER);
    textSize(48);
    text("ESTADO 1", width/2, height/2);
}

function showState2() {
    fill(255);
    textAlign(CENTER);
    textSize(48);
    text("ESTADO 2", width/2, height/2);
}

function showState3() {
    // Mostrar mensaje de reunión
    fill(255);
    textAlign(CENTER);
    textSize(36);
    text("¡REÚNANSE TODOS PARA LA FOTO!", width/2, 100);
    
    // Mostrar video de instrucción si está activo
    if (showVideo && millis() - videoStartTime < 5000) {
        showInstructionVideo();
    }
    
    // Mostrar foto si está disponible
    if (photoData) {
        showPhoto();
    }
    
    // Mostrar efectos de maraca
    if (maracaActive) {
        showMaracaEffects();
    }
}

function showInstructionVideo() {
    // Aquí se mostraría el video de "¡Sonríe!" por 5 segundos
    fill(255, 0, 0);
    textAlign(CENTER);
    textSize(72);
    text("¡SONRÍE!", width/2, height/2);
    
    // Contador de tiempo
    let timeLeft = 5 - Math.floor((millis() - videoStartTime) / 1000);
    if (timeLeft > 0) {
        textSize(48);
        text(timeLeft, width/2, height/2 + 100);
    }
}

function showPhoto() {
    if (photoData) {
        // Mostrar la foto principal
        let img = createImg(photoData);
        img.size(width * 0.8, height * 0.6);
        image(img, width/2 - img.width/2, height/2 - img.height/2);
        
        // Mostrar stickers sobre la foto
        for (let sticker of stickers) {
            showSticker(sticker);
        }
    }
}

function showSticker(stickerData) {
    // Dibujar sticker en la posición correcta
    push();
    translate(stickerData.x * width, stickerData.y * height);
    
    // Mostrar imagen de sticker según su tipo
    let stickerIndex = parseInt(stickerData.stickerId.replace('sticker', '')) - 1;
    if (stickerImages[stickerIndex]) {
        image(stickerImages[stickerIndex], -30, -30, 60, 60);
    }
    pop();
}

function showMaracaEffects() {
    // Efectos visuales cuando se agita la maraca
    for (let i = 0; i < maracaIntensity * 10; i++) {
        fill(random(255), random(255), random(255));
        ellipse(random(width), random(height), random(5, 20));
    }
}

function showState3Message() {
    // Mensaje inicial del estado 3
    fill(255);
    textAlign(CENTER);
    textSize(48);
    text("¡REÚNANSE TODOS PARA LA FOTO!", width/2, height/2);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}