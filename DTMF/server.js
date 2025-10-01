const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;

// Estado global del sistema
let currentState = 0; // 0 = inactivo, 1 = estado 1, 2 = estado 2, 3 = estado 3
let photoData = null;
let musicPlaying = false;
let photoUnlocked = false;
let maracaUnlocked = false;

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.id}`);
    
    // Enviar estado actual al cliente que se conecta
    socket.emit('currentState', {
        state: currentState,
        musicPlaying: musicPlaying,
        photoUnlocked: photoUnlocked,
        maracaUnlocked: maracaUnlocked,
        photoData: photoData
    });

    // Manejo de cambio de estado (desde remoto)
    socket.on('changeState', (data) => {
        console.log(`Cambio de estado a: ${data.state}`);
        currentState = data.state;
        
        // Resetear flags cuando se cambia de estado
        if (currentState !== 3) {
            photoUnlocked = false;
            maracaUnlocked = false;
            photoData = null;
        }
        
        // Notificar a todos los clientes
        io.emit('stateChanged', {
            state: currentState,
            musicPlaying: musicPlaying,
            photoUnlocked: photoUnlocked,
            maracaUnlocked: maracaUnlocked
        });
    });

    // Control de música (desde remoto)
    socket.on('toggleMusic', (data) => {
        musicPlaying = data.playing;
        io.emit('musicControl', { playing: musicPlaying });
    });

    // Desbloquear foto (desde remoto)
    socket.on('unlockPhoto', () => {
        if (currentState === 3) {
            photoUnlocked = true;
            io.emit('photoUnlocked');
        }
    });

    // Desbloquear maraca (desde remoto)
    socket.on('unlockMaraca', () => {
        if (currentState === 3) {
            maracaUnlocked = true;
            io.emit('maracaUnlocked');
        }
    });

    // Recibir foto desde desktop
    socket.on('photoTaken', (data) => {
        if (currentState === 3) {
            photoData = data.photoData;
            io.emit('photoReceived', { photoData: photoData });
        }
    });

    // Datos de maraca desde mobile 1
    socket.on('maracaData', (data) => {
        if (currentState === 3 && maracaUnlocked) {
            io.emit('maracaMovement', data);
        }
    });

    // Sticker desde mobile 2
    socket.on('stickerPlaced', (data) => {
        if (currentState === 3 && photoData) {
            io.emit('stickerAdded', data);
        }
    });

    socket.on('disconnect', () => {
        console.log(`Usuario desconectado: ${socket.id}`);
    });
});

server.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});