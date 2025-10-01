const socket = io();

let currentState = 0;
let musicPlaying = false;
let photoUnlocked = false;
let maracaUnlocked = false;

function setup() {
    createCanvas(800, 600);
    background(20);
    
    // Crear interfaz de control
    createControlInterface();
    
    // Escuchar eventos del servidor
    socket.on('currentState', (data) => {
        currentState = data.state;
        musicPlaying = data.musicPlaying;
        photoUnlocked = data.photoUnlocked;
        maracaUnlocked = data.maracaUnlocked;
    });
    
    socket.on('stateChanged', (data) => {
        currentState = data.state;
        musicPlaying = data.musicPlaying;
        photoUnlocked = data.photoUnlocked;
        maracaUnlocked = data.maracaUnlocked;
    });
}

function draw() {
    background(20);
    
    // Título
    fill(255);
    textAlign(CENTER);
    textSize(32);
    text("CONTROL REMOTO DTMF", width/2, 50);
    
    // Estado actual
    textSize(20);
    fill(100);
    text(`Estado Actual: ${currentState}`, width/2, 100);
    
    // Botones de estado
    drawStateButtons();
    
    // Controles de música
    drawMusicControls();
    
    // Controles del estado 3
    if (currentState === 3) {
        drawState3Controls();
    }
}

function createControlInterface() {
    // Los botones se dibujan en draw()
}

function drawStateButtons() {
    // Botón Estado 1
    fill(currentState === 1 ? color(0, 255, 0) : color(100));
    rect(50, 150, 150, 60);
    fill(255);
    textAlign(CENTER);
    text("Estado 1", 125, 190);
    
    // Botón Estado 2
    fill(currentState === 2 ? color(0, 255, 0) : color(100));
    rect(250, 150, 150, 60);
    fill(255);
    text("Estado 2", 325, 190);
    
    // Botón Estado 3
    fill(currentState === 3 ? color(0, 255, 0) : color(100));
    rect(450, 150, 150, 60);
    fill(255);
    text("Estado 3", 525, 190);
}

function drawMusicControls() {
    // Control de música
    fill(255);
    textAlign(LEFT);
    text("Control de Música:", 50, 250);
    
    // Botón Play/Pause
    fill(musicPlaying ? color(255, 0, 0) : color(0, 255, 0));
    rect(50, 270, 100, 40);
    fill(255);
    textAlign(CENTER);
    text(musicPlaying ? "PAUSE" : "PLAY", 100, 295);
}

function drawState3Controls() {
    fill(255);
    textAlign(LEFT);
    text("Controles Estado 3:", 50, 350);
    
    // Botón desbloquear foto
    fill(photoUnlocked ? color(0, 255, 0) : color(255, 165, 0));
    rect(50, 370, 150, 40);
    fill(255);
    textAlign(CENTER);
    text("Desbloquear Foto", 125, 395);
    
    // Botón desbloquear maraca
    fill(maracaUnlocked ? color(0, 255, 0) : color(255, 165, 0));
    rect(250, 370, 150, 40);
    fill(255);
    text("Desbloquear Maraca", 325, 395);
}

function mousePressed() {
    // Botones de estado
    if (mouseX >= 50 && mouseX <= 200 && mouseY >= 150 && mouseY <= 210) {
        socket.emit('changeState', { state: 1 });
    }
    if (mouseX >= 250 && mouseX <= 400 && mouseY >= 150 && mouseY <= 210) {
        socket.emit('changeState', { state: 2 });
    }
    if (mouseX >= 450 && mouseX <= 600 && mouseY >= 150 && mouseY <= 210) {
        socket.emit('changeState', { state: 3 });
    }
    
    // Control de música
    if (mouseX >= 50 && mouseX <= 150 && mouseY >= 270 && mouseY <= 310) {
        musicPlaying = !musicPlaying;
        socket.emit('toggleMusic', { playing: musicPlaying });
    }
    
    // Controles del estado 3
    if (currentState === 3) {
        // Desbloquear foto
        if (mouseX >= 50 && mouseX <= 200 && mouseY >= 370 && mouseY <= 410) {
            socket.emit('unlockPhoto');
        }
        
        // Desbloquear maraca
        if (mouseX >= 250 && mouseX <= 400 && mouseY >= 370 && mouseY <= 410) {
            socket.emit('unlockMaraca');
        }
    }
}