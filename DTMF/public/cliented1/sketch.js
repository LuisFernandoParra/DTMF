const socket = io();

let currentState = 0;
let photoUnlocked = false;
let video;
let capture;
let photoTaken = false;
let photoData = null;

function setup() {
    createCanvas(800, 600);
    background(0);
    
    // Inicializar cámara
    video = createCapture(VIDEO);
    video.size(640, 480);
    video.hide();
    
    // Escuchar eventos del servidor
    socket.on('currentState', (data) => {
        currentState = data.state;
        photoUnlocked = data.photoUnlocked;
    });
    
    socket.on('stateChanged', (data) => {
        currentState = data.state;
        photoUnlocked = data.photoUnlocked;
        
        if (currentState === 3) {
            showCameraInterface();
        }
    });
    
    socket.on('photoUnlocked', () => {
        photoUnlocked = true;
        showCameraReady();
    });
}

function draw() {
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
    background(0);
    fill(255);
    textAlign(CENTER);
    textSize(24);
    text("ESPERANDO ACTIVACIÓN", width/2, height/2);
}

function showState1() {
    background(0);
    fill(255);
    textAlign(CENTER);
    textSize(24);
    text("ESTADO 1", width/2, height/2);
}

function showState2() {
    background(0);
    fill(255);
    textAlign(CENTER);
    textSize(24);
    text("ESTADO 2", width/2, height/2);
}

function showState3() {
    if (!photoUnlocked) {
        showCameraInterface();
    } else {
        showCameraActive();
    }
}

function showCameraInterface() {
    background(0);
    
    // Mostrar previsualización de cámara
    if (video) {
        image(video, 50, 100, 640, 480);
    }
    
    // Título
    fill(255);
    textAlign(CENTER);
    textSize(28);
    text("CÁMARA", width/2, 50);
    
    // Botón de tomar foto (bloqueado)
    fill(100);
    rect(width/2 - 100, 600, 200, 50);
    fill(255);
    textAlign(CENTER);
    textSize(18);
    text("TOMAR FOTO (BLOQUEADO)", width/2, 630);
    
    // Mensaje de espera
    textSize(16);
    text("Esperando desbloqueo...", width/2, 680);
}

function showCameraActive() {
    background(0);
    
    // Mostrar previsualización de cámara
    if (video) {
        image(video, 50, 100, 640, 480);
    }
    
    // Título
    fill(255);
    textAlign(CENTER);
    textSize(28);
    text("CÁMARA ACTIVA", width/2, 50);
    
    // Botón de tomar foto (desbloqueado)
    fill(0, 255, 0);
    rect(width/2 - 100, 600, 200, 50);
    fill(0);
    textAlign(CENTER);
    textSize(18);
    text("TOMAR FOTO", width/2, 630);
    
    // Instrucciones
    textSize(16);
    fill(255);
    text("¡Haz clic para tomar la foto!", width/2, 680);
}

function showCameraReady() {
    background(0, 255, 0);
    fill(255);
    textAlign(CENTER);
    textSize(32);
    text("¡CÁMARA LISTA!", width/2, height/2);
    
    textSize(20);
    text("Puedes tomar la foto", width/2, height/2 + 50);
}

function mousePressed() {
    if (currentState === 3 && photoUnlocked) {
        // Verificar si se hizo clic en el botón de tomar foto
        if (mouseX >= width/2 - 100 && mouseX <= width/2 + 100 && 
            mouseY >= 600 && mouseY <= 650) {
            takePhoto();
        }
    }
}

function takePhoto() {
    if (video && !photoTaken) {
        // Capturar frame de la cámara
        capture = createGraphics(640, 480);
        capture.image(video, 0, 0);
        
        // Convertir a base64 para enviar
        photoData = capture.canvas.toDataURL('image/jpeg');
        
        // Enviar foto al servidor
        socket.emit('photoTaken', {
            photoData: photoData,
            timestamp: Date.now()
        });
        
        photoTaken = true;
        
        // Mostrar confirmación
        showPhotoTaken();
    }
}

function showPhotoTaken() {
    background(0, 255, 0);
    fill(255);
    textAlign(CENTER);
    textSize(32);
    text("¡FOTO TOMADA!", width/2, height/2);
    
    textSize(20);
    text("Foto enviada al visualizador", width/2, height/2 + 50);
    
    // Mostrar la foto tomada
    if (capture) {
        image(capture, width/2 - 160, height/2 + 100, 320, 240);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}