const socket = io();
const mainContainer = document.getElementById('main-container');

let maracaSound;
let maracaActivated = false;
let lastSentTime = 0;
const throttleDelay = 100; // Limita el envío de datos a 10 veces por segundo

console.log('🚀 Cliente Móvil 1 (Maraca) iniciado');
console.log('📱 User Agent:', navigator.userAgent);
console.log('🔗 Socket conectado:', socket.connected);

// Verificar disponibilidad de sensores
console.log('🔍 Verificando sensores disponibles:');
console.log('   DeviceMotionEvent disponible:', typeof DeviceMotionEvent !== 'undefined');
console.log('   DeviceOrientationEvent disponible:', typeof DeviceOrientationEvent !== 'undefined');
console.log('   requestPermission disponible:', typeof DeviceMotionEvent.requestPermission === 'function');

// Función de prueba para verificar sensores
function testSensors() {
    console.log('🧪 Probando sensores...');
    
    if (typeof DeviceMotionEvent !== 'undefined') {
        console.log('✅ DeviceMotionEvent está disponible');
        
        // Intentar agregar listener de prueba
        const testHandler = (event) => {
            console.log('🎯 SENSOR DE PRUEBA FUNCIONANDO!', event);
            window.removeEventListener('devicemotion', testHandler);
        };
        
        window.addEventListener('devicemotion', testHandler);
        console.log('📡 Listener de prueba agregado');
        
        // Remover después de 5 segundos
        setTimeout(() => {
            window.removeEventListener('devicemotion', testHandler);
            console.log('⏰ Listener de prueba removido');
        }, 5000);
    } else {
        console.log('❌ DeviceMotionEvent NO está disponible');
    }
}

// Ejecutar prueba después de 2 segundos
setTimeout(testSensors, 2000);

// Función para enviar datos de prueba al servidor cada 3 segundos
function sendTestData() {
    if (maracaActivated) {
        console.log('📡 Enviando datos de prueba AUTOMÁTICOS al servidor...');
        console.log('🔍 Estado de maracaActivated:', maracaActivated);
        
        // Intentar reproducir sonido
        if (maracaSound) {
            maracaSound.play().catch(e => console.log('🔊 Error en sonido automático:', e));
        }
        
        socket.emit('maraca_agitada', {
            x: Math.random() * 20 - 10,
            y: Math.random() * 20 - 10, 
            z: Math.random() * 20 - 10,
            test: true,
            automatic: true,
            timestamp: Date.now()
        });
    } else {
        console.log('❌ maracaActivated es false - no enviando datos automáticos');
    }
}

// Enviar datos de prueba cada 3 segundos cuando la maraca esté activada
setInterval(sendTestData, 3000);

// Función de P5.js para precargar assets
function preload() {
    maracaSound = loadSound('../assets/sonido/maracas.mp3');
}

// Función de P5.js que se ejecuta una vez
function setup() {
    noCanvas();
    
    // Log de conexión del socket
    socket.on('connect', () => {
        console.log('🔗 Socket conectado al servidor');
    });
    
    socket.on('disconnect', () => {
        console.log('❌ Socket desconectado del servidor');
    });
    
    // 1. Manejar la señal para el Estado 3 (crear la interfaz y esperar la foto)
    socket.on('cambiar_a_escena_3', () => {
        console.log('🎬 Señal recibida para el Estado 3. Creando la interfaz de la maraca.');
        
        const maracaContainer = document.createElement('div');
        maracaContainer.id = 'main-container';
        maracaContainer.innerHTML = `
            <h1>Estado 3</h1>
            <p id="status-message">Esperando la foto...</p>
            <button id="test-button" style="padding: 10px 20px; margin: 10px; font-size: 16px; background: #007bff; color: white; border: none; border-radius: 5px;">Probar Conexión</button>
            <button id="audio-button" style="padding: 10px 20px; margin: 10px; font-size: 16px; background: #28a745; color: white; border: none; border-radius: 5px;">Desbloquear Audio</button>
            <button id="sensor-button" style="padding: 10px 20px; margin: 10px; font-size: 16px; background: #ffc107; color: black; border: none; border-radius: 5px;">Probar Sensores</button>
        `;
        
        mainContainer.appendChild(maracaContainer);
        console.log('✅ Interfaz de maraca creada - esperando activación');
        
        // Agregar evento al botón de prueba
        const testButton = document.getElementById('test-button');
        if (testButton) {
            testButton.addEventListener('click', () => {
                console.log('🧪 Botón de prueba presionado');
                socket.emit('maraca_agitada', {
                    x: 15, y: -8, z: 12, 
                    test: true, 
                    manual: true,
                    timestamp: Date.now()
                });
                console.log('📡 Datos de prueba enviados manualmente');
            });
        }
        
        // Agregar evento al botón de audio
        const audioButton = document.getElementById('audio-button');
        if (audioButton) {
            audioButton.addEventListener('click', () => {
                console.log('🔊 Botón de audio presionado - desbloqueando audio...');
                if (maracaSound) {
                    maracaSound.play().then(() => {
                        console.log('✅ Audio desbloqueado exitosamente');
                        audioButton.textContent = 'Audio OK';
                        audioButton.style.background = '#28a745';
                    }).catch(error => {
                        console.log('❌ Error desbloqueando audio:', error);
                        audioButton.textContent = 'Error Audio';
                        audioButton.style.background = '#dc3545';
                    });
                } else {
                    console.log('❌ maracaSound no está cargado');
                }
            });
        }
        
        const sensorButton = document.getElementById('sensor-button');
        if (sensorButton) {
            sensorButton.addEventListener('click', () => {
                console.log('🧪 Botón de sensores presionado - probando sensores...');
                
                // Verificar si DeviceMotionEvent está disponible
                if (typeof DeviceMotionEvent === 'undefined') {
                    console.log('❌ DeviceMotionEvent no está disponible');
                    sensorButton.textContent = 'Sensores NO';
                    sensorButton.style.background = '#dc3545';
                    return;
                }
                
                // Verificar si ya tenemos permisos
                if (typeof DeviceMotionEvent.requestPermission === 'function') {
                    console.log('📱 Solicitando permisos de sensores...');
                    DeviceMotionEvent.requestPermission()
                        .then(permissionState => {
                            console.log('🔐 Estado del permiso:', permissionState);
                            if (permissionState === 'granted') {
                                console.log('✅ Permisos concedidos - probando sensores');
                                sensorButton.textContent = 'Sensores OK';
                                sensorButton.style.background = '#28a745';
                                
                                // Agregar listener temporal para probar
                                const testHandler = (event) => {
                                    console.log('🎯 SENSOR FUNCIONANDO!', event.acceleration);
                                    window.removeEventListener('devicemotion', testHandler);
                                };
                                window.addEventListener('devicemotion', testHandler);
                                
                                // Remover después de 5 segundos
                                setTimeout(() => {
                                    window.removeEventListener('devicemotion', testHandler);
                                    console.log('⏰ Test de sensores completado');
                                }, 5000);
                            } else {
                                console.log('❌ Permisos denegados');
                                sensorButton.textContent = 'Permisos NO';
                                sensorButton.style.background = '#dc3545';
                            }
                        })
                        .catch(error => {
                            console.log('❌ Error solicitando permisos:', error);
                            sensorButton.textContent = 'Error';
                            sensorButton.style.background = '#dc3545';
                        });
                } else {
                    console.log('🌐 No es iOS - probando sensores directamente');
                    sensorButton.textContent = 'Probando...';
                    sensorButton.style.background = '#ffc107';
                    
                    // Agregar listener temporal para probar
                    const testHandler = (event) => {
                        console.log('🎯 SENSOR FUNCIONANDO!', event.acceleration);
                        window.removeEventListener('devicemotion', testHandler);
                    };
                    window.addEventListener('devicemotion', testHandler);
                    
                    // Remover después de 5 segundos
                    setTimeout(() => {
                        window.removeEventListener('devicemotion', testHandler);
                        console.log('⏰ Test de sensores completado');
                        sensorButton.textContent = 'Sensores OK';
                        sensorButton.style.background = '#28a745';
                    }, 5000);
                }
            });
        }
    });

    // 2. Manejador para el evento de activación de la maraca
    socket.on('activar_maraca', () => {
        console.log('🎯 Señal de activación de maraca recibida del servidor');
        const statusMessage = document.getElementById('status-message');
        const title = mainContainer.querySelector('h1');

        if (title) title.textContent = "¡Es hora de agitar!";
        if (statusMessage) {
            statusMessage.textContent = '¡Maraca activada! Sacude tu teléfono...';
        }
        
        // La activación real de la maraca ocurre aquí
        maracaActivated = true;
        console.log('✅ maracaActivated = true');
        
        // IMPORTANTE: Solicitud de permiso para iOS y activación del listener
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            console.log('📱 iOS detectado - solicitando permisos de sensores...');
            DeviceMotionEvent.requestPermission()
                .then(permissionState => {
                    console.log('🔐 Estado del permiso:', permissionState);
                    if (permissionState === 'granted') {
                        console.log('✅ Permiso de sensores concedido - agregando listener');
                        window.addEventListener('devicemotion', handleMotion);
                        console.log('🎵 Reproduciendo sonido de prueba...');
                        maracaSound.play().catch(e => console.log("Audio desbloqueado:", e));
                        
                        // Enviar señal de prueba al servidor
                        console.log('📡 Enviando señal de prueba al servidor...');
                        socket.emit('maraca_agitada', {
                            x: 0, y: 0, z: 0, test: true, permission: 'granted'
                        });
                        
                        // Verificar si el listener se agregó correctamente
                        console.log('🔍 Verificando listener agregado...');
                        setTimeout(() => {
                            console.log('🧪 Prueba de sensores - mueve el teléfono ahora');
                        }, 2000);
                    } else {
                        console.log('❌ Permiso denegado');
                        if (statusMessage) {
                            statusMessage.textContent = 'Permiso denegado. No se puede activar la maraca.';
                        }
                    }
                })
                .catch(error => {
                    console.error('❌ Error solicitando permisos:', error);
                });
        } else {
            console.log('🌐 No es iOS - agregando listener directamente');
            window.addEventListener('devicemotion', handleMotion);
            console.log('🎵 Reproduciendo sonido de prueba...');
            maracaSound.play().catch(e => console.log("Audio desbloqueado:", e));
            console.log('✅ Maraca activada sin permisos especiales');
            
            // Enviar señal de prueba al servidor
            console.log('📡 Enviando señal de prueba al servidor...');
            socket.emit('maraca_agitada', {
                x: 0, y: 0, z: 0, test: true, permission: 'not_required'
            });
            
            // Verificar si el listener se agregó correctamente
            console.log('🔍 Verificando listener agregado...');
            setTimeout(() => {
                console.log('🧪 Prueba de sensores - mueve el teléfono ahora');
            }, 2000);
        }
    });
}

// 3. Función para procesar los datos de movimiento (devicemotion)
function handleMotion(event) {
    console.log('🔍 handleMotion llamado - maracaActivated:', maracaActivated);
    console.log('📱 Evento devicemotion recibido:', event);
    
    if (!maracaActivated) {
        console.log('❌ Maraca no activada, ignorando datos de sensores');
        return;
    }

    // Obtener datos de aceleración y rotación
    const acceleration = event.accelerationIncludingGravity;
    const rotation = event.rotationRate;
    
    console.log('📱 Datos de sensores recibidos:');
    console.log('   Aceleración:', {
        x: acceleration.x,
        y: acceleration.y, 
        z: acceleration.z
    });
    console.log('   Rotación:', {
        alpha: rotation.alpha,
        beta: rotation.beta,
        gamma: rotation.gamma
    });
    
    // Calcular la magnitud del movimiento (para detectar un "agitón")
    const magnitude = Math.sqrt(
        acceleration.x * acceleration.x +
        acceleration.y * acceleration.y +
        acceleration.z * acceleration.z
    );

    console.log('📊 Magnitud del movimiento:', magnitude);

    const threshold = 20; // Umbral de movimiento para activar la maraca
    console.log('🎯 Umbral:', threshold, '- Superado:', magnitude > threshold);

    // Si la magnitud supera el umbral y ha pasado suficiente tiempo
    if (magnitude > threshold && (Date.now() - lastSentTime > throttleDelay)) {
        console.log('🎉 ¡AGITANDO! Enviando datos de sensores...');
        
        const statusMessage = document.getElementById('status-message');
        if (statusMessage) {
            statusMessage.textContent = '¡Agitando! 🎸';
            setTimeout(() => {
                if (statusMessage) {
                    statusMessage.textContent = '¡Maraca activada! Sacude tu teléfono...';
                }
            }, 500);
        }

        // Reproducir el sonido
        console.log('🔊 Reproduciendo sonido de maraca...');
        try {
            maracaSound.currentTime = 0;
            const playPromise = maracaSound.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('✅ Sonido de maraca reproducido exitosamente');
                }).catch(error => {
                    console.log('❌ Error reproduciendo sonido:', error);
                    // Intentar reproducir sin user interaction
                    maracaSound.play().catch(e => console.log('❌ Segundo intento falló:', e));
                });
            }
        } catch (error) {
            console.log('❌ Error en try/catch:', error);
        }

        // Enviar los datos detallados al servidor
        console.log('📡 Enviando datos al servidor:', {
            x: acceleration.x, 
            y: acceleration.y, 
            z: acceleration.z
        });
        socket.emit('maraca_agitada', {
            x: acceleration.x, 
            y: acceleration.y, 
            z: acceleration.z,
            magnitude: magnitude,
            timestamp: Date.now(),
            real: true
        });

        lastSentTime = Date.now();
    } else if (magnitude <= threshold) {
        console.log('📉 Movimiento insuficiente:', magnitude, '<=', threshold);
    } else {
        console.log('⏱️ Throttle activo, esperando:', Date.now() - lastSentTime, 'ms');
    }
}