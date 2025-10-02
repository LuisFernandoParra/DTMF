const socket = io();

let currentState = 0;
let photoData = null;
let photoImg = null;
let stickers = [];
let stickerTypes = ['palmera1', 'palmera2', 'palmera3', 'palmera4'];
let stickerImages = [];
let selectedSticker = null;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let stickerPlaced = false;

// Variables para la interfaz
let stickerPaletteY = 0;
let photoAreaY = 0;
let photoAreaHeight = 0;

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(255);
    
    // Calcular áreas de la interfaz
    stickerPaletteY = height * 0.15;
    photoAreaY = height * 0.2;
    photoAreaHeight = height * 0.8;
    
    // Cargar imágenes de stickers (todas palmeras por ahora)
    stickerImages[0] = loadImage('../assets/palmera.png');
    stickerImages[1] = loadImage('../assets/palmera.png');
    stickerImages[2] = loadImage('../assets/palmera.png');
    stickerImages[3] = loadImage('../assets/palmera.png');
    
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
        if (photoData) {
            photoImg = loadImage(photoData);
        }
    });
    
    socket.on('stickerAdded', (data) => {
        // Recibir sticker desde el servidor
        stickers.push({
            type: data.stickerId,
            x: data.x,
            y: data.y,
            timestamp: data.timestamp
        });
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
    background(50);
    fill(255);
    textAlign(CENTER);
    textSize(24);
    text("ESPERANDO ACTIVACIÓN", width/2, height/2);
}

function showState1() {
    background(50);
    fill(255);
    textAlign(CENTER);
    textSize(24);
    text("ESTADO 1", width/2, height/2);
}

function showState2() {
    background(50);
    fill(255);
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
    
    // Título
    fill(0);
    textAlign(CENTER);
    textSize(28);
    text("STICKERS", width/2, 50);
    
    // Mensaje de espera
    textSize(18);
    text("Esperando que se tome la foto...", width/2, height/2);
    
    // Mostrar stickers disponibles
    showStickerPalette();
}

function showPhotoWithStickers() {
    background(255);
    
    // Mostrar foto si está disponible
    if (photoImg) {
        // Calcular dimensiones para mantener proporción
        let imgWidth = width * 0.8;
        let imgHeight = (photoImg.height * imgWidth) / photoImg.width;
        
        // Centrar la imagen
        let imgX = (width - imgWidth) / 2;
        let imgY = photoAreaY + (photoAreaHeight - imgHeight) / 2;
        
        image(photoImg, imgX, imgY, imgWidth, imgHeight);
        
        // Mostrar stickers sobre la foto
        for (let sticker of stickers) {
            showPlacedSticker(sticker, imgX, imgY, imgWidth, imgHeight);
        }
    } else {
        // Área de foto sin imagen
        fill(200);
        rect(50, photoAreaY, width - 100, photoAreaHeight - photoAreaY);
        
        fill(255);
        textAlign(CENTER);
        textSize(16);
        text("AÚN NO HA SIDO TOMADA", width/2, height/2);
    }
    
    // Mostrar paleta de stickers
    showStickerPalette();
}

function showStickerPalette() {
    // Fondo de la paleta
    fill(240);
    rect(0, 0, width, stickerPaletteY);
    
    // Título de stickers
    fill(0);
    textAlign(LEFT);
    textSize(18);
    text("Stickers disponibles:", 20, 30);
    
    // Dibujar botones de stickers
    for (let i = 0; i < stickerTypes.length; i++) {
        let x = 20 + (i * 80);
        let y = 50;
        let size = 60;
        
        // Botón de sticker
        if (selectedSticker === i) {
            fill(0, 255, 0);
        } else {
            fill(200);
        }
        rect(x, y, size, size, 10);
        
        // Mostrar imagen de sticker
        if (stickerImages[i]) {
            image(stickerImages[i], x + 5, y + 5, size - 10, size - 10);
        }
    }
}

function showPlacedSticker(sticker, imgX, imgY, imgWidth, imgHeight) {
    // Convertir coordenadas relativas a absolutas
    let x = imgX + (sticker.x * imgWidth);
    let y = imgY + (sticker.y * imgHeight);
    
    // Dibujar sticker
    push();
    translate(x, y);
    
    // Mostrar imagen de sticker según su tipo
    let stickerIndex = parseInt(sticker.type.replace('sticker', '')) - 1;
    if (stickerImages[stickerIndex]) {
        image(stickerImages[stickerIndex], -25, -25, 50, 50);
    }
    pop();
}

function mousePressed() {
    if (currentState === 3) {
        // Verificar si se presionó un sticker de la paleta
        for (let i = 0; i < stickerTypes.length; i++) {
            let x = 20 + (i * 80);
            let y = 50;
            let size = 60;
            
            if (mouseX >= x && mouseX <= x + size && mouseY >= y && mouseY <= y + size) {
                selectedSticker = i;
                return;
            }
        }
        
        // Si se presionó en el área de la foto y hay un sticker seleccionado
        if (selectedSticker !== null && mouseX >= 50 && mouseX <= width - 50 && 
            mouseY >= photoAreaY && mouseY <= height) {
            placeSticker(mouseX, mouseY);
        }
    }
}

function mouseDragged() {
    if (currentState === 3 && selectedSticker !== null) {
        // Mostrar sticker fantasma siguiendo el mouse
        showStickerGhost();
    }
}

function mouseReleased() {
    if (currentState === 3 && selectedSticker !== null) {
        // Verificar si se soltó en el área de la foto
        if (mouseX >= 50 && mouseX <= width - 50 && 
            mouseY >= photoAreaY && mouseY <= height) {
            placeSticker(mouseX, mouseY);
        }
        selectedSticker = null;
    }
}

function showStickerGhost() {
    // Mostrar sticker fantasma siguiendo el mouse
    push();
    translate(mouseX, mouseY);
    
    // Mostrar imagen de sticker fantasma
    if (stickerImages[selectedSticker]) {
        tint(255, 150); // Hacer semi-transparente
        image(stickerImages[selectedSticker], -25, -25, 50, 50);
        noTint();
    }
    pop();
}

function placeSticker(x, y) {
    if (selectedSticker !== null && photoImg) {
        // Calcular coordenadas relativas
        let imgWidth = width * 0.8;
        let imgHeight = (photoImg.height * imgWidth) / photoImg.width;
        let imgX = (width - imgWidth) / 2;
        let imgY = photoAreaY + (photoAreaHeight - imgHeight) / 2;
        
        // Verificar si está dentro del área de la imagen
        if (x >= imgX && x <= imgX + imgWidth && y >= imgY && y <= imgY + imgHeight) {
            let xRelative = (x - imgX) / imgWidth;
            let yRelative = (y - imgY) / imgHeight;
            
            let newSticker = {
                type: `sticker${selectedSticker + 1}`,
                x: xRelative,
                y: yRelative,
                timestamp: Date.now()
            };
            
            stickers.push(newSticker);
            
            // Enviar sticker al servidor
            socket.emit('stickerPlaced', newSticker);
            
            console.log(`Sticker ${newSticker.type} enviado a (${xRelative}, ${yRelative})`);
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    
    // Recalcular áreas
    stickerPaletteY = height * 0.15;
    photoAreaY = height * 0.2;
    photoAreaHeight = height * 0.8;
}