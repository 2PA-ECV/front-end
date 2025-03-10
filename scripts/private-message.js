const socket = io("ws://20.117.185.81:4000");


async function obtenerUsuarioLogeado() {
    const token = localStorage.getItem("token"); // Obtener el token desde localStorage
    if (!token) {
        console.error("No se encontró el token");
        return;
    }

    const userResponse = await fetch('http://20.117.185.81:3000/user/', {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    });

    if (!userResponse.ok) {
        console.error("Error al obtener los datos del usuario");
        return;
    }

    const userData = await userResponse.json();
    const currentUser = userData.user_id;  // Almacenar el user_id del usuario actual
    console.log("Usuario logueado:", currentUser);
    return currentUser;
}

async function connectChat() {
    const currentUser = await obtenerUsuarioLogeado();
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get("matchId");

    if (matchId) {
        socket.emit("joinRoom", matchId);
        console.log(`Conectado a la sala ${matchId}`);

        // Evitar múltiples listeners eliminando el anterior
        socket.off("receiveMessage"); 

        // Escuchar mensajes recibidos
        socket.on("receiveMessage", (messageData) => {
            console.log("Mensaje recibido:", messageData);
            if (messageData.senderId === currentUser) {
                addMessageToChat(messageData.message, "sent");
            } else {
                addMessageToChat(messageData.message, "received");
            }
        });
    }
}


function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const messageText = messageInput.value.trim();
    const matchId = new URLSearchParams(window.location.search).get("matchId");

    obtenerUsuarioLogeado().then((currentUser) => {
        if (messageText && matchId && currentUser) {
            const messageData = {
                matchId,
                senderId: currentUser,
                message: messageText
            };

            socket.emit("sendMessage", messageData);
            messageInput.value = "";
        }
    });
}

// Función para agregar mensajes al chat
function addMessageToChat(message, type) {
    const messagesContainer = document.getElementById("messagesContainer");
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", type);
    messageElement.innerHTML = `<div class="message-text">${message}</div>`;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Eventos de envío de mensaje
document.getElementById("sendMessage").addEventListener("click", sendMessage);
document.getElementById("messageInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
    }
});

// Cargar usuario del chat dinámicamente
async function loadChatUser() {
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get("matchId");

    if (!matchId) {
        console.error("No se encontró matchId en la URL");
        return;
    }

    const currentUser = await obtenerUsuarioLogeado();
    if (!currentUser) return;

    try {
        const response = await fetch(`http://20.117.185.81:3000/matches/${matchId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            }
        });

        if (!response.ok) throw new Error("Error al obtener la información del match");

        const matchData = await response.json();

        const otherUserId = (matchData.user_id_1 === currentUser) ? matchData.user_id_2 : matchData.user_id_1;

        const profileResponse = await fetch(`http://20.117.185.81:3000/profile/${otherUserId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            }
        });

        if (!profileResponse.ok) throw new Error("Error al obtener el perfil del usuario");

        const profileData = await profileResponse.json();
        
        // Actualizar la interfaz con el nombre y la foto del usuario
        document.getElementById("chatUserName").textContent = profileData.username; // Nombre del usuario
        if (profileData.profile_picture) {
            // Verifica si la imagen ya es una URL completa
            if (profileData.profile_picture.startsWith('http')) {
                document.getElementById("image-preview-img").src = profileData.profile_picture;
            } else {
                // Si no, obtén la imagen desde el servidor
                const fetchResponse = await fetch(`http://20.117.185.81:3000${profileData.profile_picture}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("token")}`
                    }
                });
                if (!fetchResponse.ok) throw new Error('Error al descargar la imagen');
                const imageBlob = await fetchResponse.blob();
                document.getElementById("profilePic").src = URL.createObjectURL(imageBlob);
            }
        } else {
            document.getElementById("profilePic").src = "https://placehold.co/80x120";
        }

        const messagesData = await loadMessages(matchId);
        console.log("Mensajes cargados:", messagesData);

        messagesData.messages.forEach(msg => {
            addMessageToChat(msg.message, msg.senderId === currentUser ? "sent" : "received");
        });


    } catch (error) {
        console.error("Error en loadChatUser:", error);
    }
}


document.addEventListener("DOMContentLoaded", () => {
    connectChat();
    loadChatUser();
    const smileyIcon = document.querySelector('.fa-smile');
    // Función para mostrar/ocultar el selector de emojis
    smileyIcon.addEventListener('click', function() {
        const emojiPicker = document.getElementById('emojiPicker');
        if (emojiPicker) {
            emojiPicker.remove();
        } else {
            const emojiPickerDiv = document.createElement('div');
            emojiPickerDiv.id = 'emojiPicker';
            emojiPickerDiv.classList.add('emoji-picker');
            emojiPickerDiv.innerHTML = `
                <span>😀</span>
                <span>😁</span>
                <span>😂</span>
                <span>🤣</span>
                <span>😃</span>
                <span>😄</span>
                <span>😅</span>
                <span>😆</span>
                <span>😉</span>
                <span>😊</span>
                <span>😋</span>
                <span>😎</span>
                <span>😍</span>
                <span>😘</span>
                <span>😗</span>
                <span>😙</span>
                <span>😚</span>
                <span>🙂</span>
                <span>🤗</span>
                <span>🤩</span>
                <span>🤔</span>
                <span>🤨</span>
                <span>😐</span>
                <span>😑</span>
                <span>😶</span>
                <span>🙄</span>
                <span>😏</span>
                <span>😣</span>
                <span>😥</span>
                <span>😮</span>
                <span>🤐</span>
                <span>😯</span>
                <span>😪</span>
                <span>😫</span>
                <span>😴</span>
                <span>😌</span>
                <span>😛</span>
                <span>😜</span>
                <span>😝</span>
                <span>🤤</span>
                <span>😒</span>
                <span>😓</span>
                <span>😔</span>
                <span>😕</span>
                <span>🙃</span>
                <span>🤑</span>
                <span>😲</span>
                <span>☹️</span>
                <span>🙁</span>
                <span>😖</span>
                <span>😞</span>
                <span>😟</span>
                <span>😤</span>
                <span>😢</span>
                <span>😭</span>
                <span>😦</span>
                <span>😧</span>
                <span>😨</span>
                <span>😩</span>
                <span>🤯</span>
                <span>😬</span>
                <span>😰</span>
                <span>😱</span>
                <span>😳</span>
                <span>🤪</span>
                <span>😵</span>
                <span>😡</span>
                <span>😠</span>
                <span>🤬</span>
                <span>😷</span>
                <span>🤒</span>
                <span>🤕</span>
                <span>🤢</span>
                <span>🤮</span>
                <span>🤧</span>
                <span>😇</span>
                <span>🤠</span>
                <span>🤡</span>
                <span>🤥</span>
                <span>🤫</span>
                <span>🤭</span>
                <span>🧐</span>
                <span>🤓</span>
                <span>😈</span>
                <span>👿</span>
                <span>👹</span>
                <span>👺</span>
                <span>💀</span>
                <span>👻</span>
                <span>👽</span>
                <span>🤖</span>
                <span>💩</span>
                <span>😺</span>
                <span>😸</span>
                <span>😹</span>
                <span>😻</span>
                <span>😼</span>
                <span>😽</span>
                <span>🙀</span>
                <span>😿</span>
                <span>😾</span>
            `;
            document.body.appendChild(emojiPickerDiv);

            // Añadir evento a cada emoji
            emojiPickerDiv.querySelectorAll('span').forEach(emoji => {
                emoji.addEventListener('click', function() {
                    messageInput.value += emoji.textContent;
                    messageInput.focus();
                });
            });
        }
    });
});


async function loadMessages(matchId) {
    try {
        const response = await fetch(`http://20.117.185.81:3000/chat/${matchId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error al cargar los mensajes: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al cargar mensajes:", error);
        return [];
    }
}

