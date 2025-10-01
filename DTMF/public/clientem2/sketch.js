const socket = io();

let currentState = 0;
let photoData = null;
let stickers = [];
let selectedSticker = null;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let stickerTypes = ['😀', '🎉', '❤️', '⭐'];
let stickerPositions = [];

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(255);
    
    // Escuchar eventos del servidor
    socket.on('currentState', (data) => {
        currentState = data.state;
        photoData = data.photoData;
    });
    
    socket.on('stateChanged', (data) => {
        currentState = data.state;
        
        if (currentState === 3) {
            showStickerInterface();
        }
    });
    
    socket.on('photoReceived', (data) => {
        photoData = data.photoData;
        showPhotoWithStickers();
    });
    
    socket.on('stickerAdded', (data) => {
        // Actualizar posición de sticker desde el servidor
        updateStickerPosition(data);
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
    if (!photoData) {
        showWaitingForPhoto();
    } else {
        showPhotoWithStickers();
    }
}

function showWaitingForPhoto() {
    background(255);
    fill(0);
    textAlign(CENTER);
    textSize(28);
    text("STICKERS", width/2, height/2 - 100);
    
    textSize(20);
    text("Esperando que se tome la foto...", width/2, height/2);
    
    // Mostrar stickers disponibles
    showAvailableStickers();
}

function showAvailableStickers() {
    textSize(18);
    text("Stickers disponibles:", width/2, height/2 + 50);
    
    for (let i = 0; i < stickerTypes.length; i++) {
        let x = width/2 - 100 + (i * 50);
        let y = height/2 + 100;
        
        fill(200);
        rect(x - 20, y - 20, 40, 40);
        
        fill(0);
        textAlign(CENTER);
        textSize(24);
        text(stickerTypes[i], x, y);
    }
}

function showPhotoWithStickers() {
    background(255);
    
    // Mostrar foto si está disponible
    if (photoData) {
        // Aquí se mostraría la foto real
        fill(200);
        rect(50, 100, width - 100, height - 200);
        
        fill(0);
        textAlign(CENTER);
        textSize(16);
        text("FOTO TOMADA", width/2, 150);
    } else {
        fill(100);
        rect(50, 100, width - 100, height - 200);
        
        fill(255);
        textAlign(CENTER);
        textSize(16);
        text("AÚN NO HA SIDO TOMADA", width/2, 150);
    }
    
    // Mostrar stickers disponibles
    showStickerPalette();
    
    // Mostrar stickers colocados
    showPlacedStickers();
}

function showStickerPalette() {
    fill(0);
    textAlign(LEFT);
    textSize(18);
    text("Stickers disponibles:", 20, 50);
    
    for (let i = 0; i < stickerTypes.length; i++) {
        let x = 20 + (i * 60);
        let y = 70;
        
        // Dibujar botón de sticker
        fill(selectedSticker === i ? color(0, 255, 0) : color(200));
        rect(x, y, 50, 50);
        
        fill(0);
        textAlign(CENTER);
        textSize(24);
        text(stickerTypes[i], x + 25, y + 30);
    }
}

function showPlacedStickers() {
    for (let sticker of stickers) {
        push();
        translate(sticker.x, sticker.y);
        fill(255, 255, 0, 150);
        ellipse(0, 0, 40, 40);
        fill(0);
        textAlign(CENTER);
        textSize(20);
        text(sticker.type, 0, 0);
        pop();
    }
}

function showStickerInterface() {
    background(255);
    fill(0);
    textAlign(CENTER);
    textSize(28);
    text("STICKERS", width/2, 50);
    
    textSize(18);
    text("Selecciona un sticker y arrástralo", width/2, 80);
}

function mousePressed() {
    if (currentState === 3) {
        // Verificar si se presionó un sticker de la paleta
        for (let i = 0; i < stickerTypes.length; i++) {
            let x = 20 + (i * 60);
            let y = 70;
            
            if (mouseX >= x && mouseX <= x + 50 && mouseY >= y && mouseY <= y + 50) {
                selectedSticker = i;
                return;
            }
        }
        
        // Verificar si se presionó un sticker colocado
        for (let i = stickers.length - 1; i >= 0; i--) {
            let sticker = stickers[i];
            let distance = dist(mouseX, mouseY, sticker.x, sticker.y);
            
            if (distance < 20) {
                selectedSticker = sticker.type;
                isDragging = true;
                dragOffset.x = mouseX - sticker.x;
                dragOffset.y = mouseY - sticker.y;
                return;
            }
        }
        
        // Si se presionó en el área de la foto y hay un sticker seleccionado
        if (selectedSticker !== null && mouseX >= 50 && mouseX <= width - 50 && 
            mouseY >= 100 && mouseY <= height - 100) {
            placeSticker(mouseX, mouseY);
        }
    }
}

function mouseDragged() {
    if (currentState === 3 && isDragging && selectedSticker !== null) {
        // Mover sticker seleccionado
        for (let sticker of stickers) {
            if (sticker.type === selectedSticker) {
                sticker.x = mouseX - dragOffset.x;
                sticker.y = mouseY - dragOffset.y;
                
                // Enviar nueva posición al servidor
                socket.emit('stickerPlaced', {
                    type: sticker.type,
                    x: sticker.x,
                    y: sticker.y,
                    timestamp: Date.now()
                });
                break;
            }
        }
    }
}

function mouseReleased() {
    if (currentState === 3) {
        isDragging = false;
        selectedSticker = null;
    }
}

function placeSticker(x, y) {
    if (selectedSticker !== null) {
        let newSticker = {
            type: stickerTypes[selectedSticker],
            x: x,
            y: y,
            timestamp: Date.now()
        };
        
        stickers.push(newSticker);
        
        // Enviar sticker al servidor
        socket.emit('stickerPlaced', newSticker);
        
        selectedSticker = null;
    }
}

function updateStickerPosition(data) {
    // Actualizar posición de sticker desde el servidor
    for (let sticker of stickers) {
        if (sticker.type === data.type && sticker.timestamp === data.timestamp) {
            sticker.x = data.x;
            sticker.y = data.y;
            break;
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}