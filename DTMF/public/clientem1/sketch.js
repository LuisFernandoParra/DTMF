const socket = io();

let currentState = 0;
let maracaUnlocked = false;
let isShaking = false;
let shakeIntensity = 0;
let lastShakeTime = 0;
let maracaSound;
let accelerometerData = { x: 0, y: 0, z: 0 };
let gyroscopeData = { x: 0, y: 0, z: 0 };

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(255);
    
    // Solicitar permisos para sensores en dispositivos móviles
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission();
    }
    
    // Cargar sonido de maraca
    maracaSound = loadSound('../assets/sonido/maracas.mp3');
    
    // Escuchar eventos del servidor
    socket.on('currentState', (data) => {
        currentState = data.state;
        maracaUnlocked = data.maracaUnlocked;
    });
    
    socket.on('stateChanged', (data) => {
        currentState = data.state;
        maracaUnlocked = data.maracaUnlocked;
        
        if (currentState === 3) {
            showMaracaInterface();
        }
    });
    
    socket.on('maracaUnlocked', () => {
        maracaUnlocked = true;
        showMaracaReady();
    });
    
    // Configurar sensores de movimiento
    setupMotionSensors();
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
    background(255);
    fill(0);
    textAlign(CENTER);
    textSize(24);
    text("ESPERANDO ACTIVACIÓN", width/2, height/2);
}

function showState1() {
    background(255);
    fill(0);
    textAlign(CENTER);
    textSize(24);
    text("ESTADO 1", width/2, height/2);
}

function showState2() {
    background(255);
    fill(0);
    textAlign(CENTER);
    textSize(24);
    text("ESTADO 2", width/2, height/2);
}

function showState3() {
    if (!maracaUnlocked) {
        showMaracaInterface();
    } else {
        showMaracaActive();
    }
}

function showMaracaInterface() {
    background(255);
    fill(0);
    textAlign(CENTER);
    textSize(32);
    text("MARACA", width/2, height/2 - 50);
    
    textSize(20);
    text("Esperando desbloqueo...", width/2, height/2 + 20);
    
    // Mostrar icono de maraca
    fill(139, 69, 19);
    ellipse(width/2, height/2 + 100, 80, 120);
}

function showMaracaReady() {
    background(0, 255, 0);
    fill(255);
    textAlign(CENTER);
    textSize(32);
    text("¡MARACA LISTA!", width/2, height/2);
    
    textSize(20);
    text("Agita tu teléfono", width/2, height/2 + 50);
}

function showMaracaActive() {
    background(255);
    
    // Mostrar interfaz de maraca activa
    fill(0);
    textAlign(CENTER);
    textSize(28);
    text("MARACA ACTIVA", width/2, 50);
    
    // Mostrar intensidad del movimiento
    let intensity = getShakeIntensity();
    fill(255, 0, 0);
    rect(50, 100, intensity * 2, 30);
    
    // Mostrar mensaje si está agitando
    if (isShaking) {
        fill(255, 0, 0);
        textSize(24);
        text("¡AGITANDO!", width/2, height/2);
    }
    
    // Mostrar datos de sensores
    fill(0);
    textSize(16);
    textAlign(LEFT);
    text(`Acelerómetro X: ${accelerometerData.x.toFixed(2)}`, 20, 200);
    text(`Acelerómetro Y: ${accelerometerData.y.toFixed(2)}`, 20, 220);
    text(`Acelerómetro Z: ${accelerometerData.z.toFixed(2)}`, 20, 240);
    text(`Giroscopio X: ${gyroscopeData.x.toFixed(2)}`, 20, 280);
    text(`Giroscopio Y: ${gyroscopeData.y.toFixed(2)}`, 20, 300);
    text(`Giroscopio Z: ${gyroscopeData.z.toFixed(2)}`, 20, 320);
}

function setupMotionSensors() {
    // Escuchar eventos de movimiento del dispositivo
    window.addEventListener('devicemotion', handleMotion);
    window.addEventListener('deviceorientation', handleOrientation);
}

function handleMotion(event) {
    if (currentState === 3 && maracaUnlocked) {
        accelerometerData = {
            x: event.acceleration.x || 0,
            y: event.acceleration.y || 0,
            z: event.acceleration.z || 0
        };
        
        // Detectar agitación
        let intensity = getShakeIntensity();
        if (intensity > 15) {
            triggerShake();
        }
        
        // Enviar datos al servidor
        socket.emit('maracaData', {
            accelerometer: accelerometerData,
            gyroscope: gyroscopeData,
            intensity: intensity,
            timestamp: Date.now()
        });
    }
}

function handleOrientation(event) {
    if (currentState === 3 && maracaUnlocked) {
        gyroscopeData = {
            x: event.alpha || 0,
            y: event.beta || 0,
            z: event.gamma || 0
        };
    }
}

function getShakeIntensity() {
    let totalAcceleration = Math.sqrt(
        accelerometerData.x * accelerometerData.x +
        accelerometerData.y * accelerometerData.y +
        accelerometerData.z * accelerometerData.z
    );
    return totalAcceleration;
}

function triggerShake() {
    if (!isShaking) {
        isShaking = true;
        lastShakeTime = millis();
        
        // Reproducir sonido de maraca
        if (maracaSound) {
            maracaSound.play();
        }
        
        // Enviar evento de agitación al servidor
        socket.emit('maracaData', {
            type: 'shake',
            intensity: getShakeIntensity(),
            timestamp: Date.now()
        });
        
        // Resetear estado de agitación después de un tiempo
        setTimeout(() => {
            isShaking = false;
        }, 500);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}