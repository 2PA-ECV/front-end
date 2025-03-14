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

function obtenerMatchId() {
    const urlParams = new URLSearchParams(window.location.search);

    // Primero revisamos si existe "matchId"
    if (urlParams.has("matchId")) {
        id = urlParams.get("matchId");
        return "match-" + id;
    }

    // Si no existe "matchId", verificamos "match2PAId"
    if (urlParams.has("match2PAId")) {
        id = urlParams.get("match2PAId");
        return "match2pa-" + id;
    }

    console.error("No se encontró matchId ni match2PAId en la URL");
    return null;
}

async function getUsername(userId) {
    try {
        const response = await fetch(`http://20.117.185.81:3000/user/${userId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (!response.ok) throw new Error("Error al obtener el nombre del usuario");

        const userData = await response.json();
        return userData.username;
    } catch (error) {
        console.error("Error obteniendo el username:", error);
        return null;
    }
}

async function connectChat() {
    const currentUser = await obtenerUsuarioLogeado();
    const matchId = obtenerMatchId();  // Se obtiene el ID correcto

    if (matchId) {
        socket.emit("joinRoom", matchId);
        console.log(`Conectado a la sala ${matchId}`);

        socket.off("receiveMessage");

        socket.on("receiveMessage", async (messageData) => {
            console.log("Mensaje recibido:", messageData);

        
            let senderName = "";
            if (matchId.startsWith("match2pa-")) {
                senderName = await getUsername(messageData.senderId);
                console.log("Nombre del remitente:", senderName);
            }

            if (messageData.senderId === currentUser) {
                addMessageToChat(messageData.message, "sent", senderName);
            } else {
                addMessageToChat(messageData.message, "received", senderName);
            }
        });
    }
}



function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const messageText = messageInput.value.trim();
    const matchId = obtenerMatchId(); ;

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
function addMessageToChat(message, type, senderName) {
    const messagesContainer = document.getElementById("messagesContainer");
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", type);
    messageElement.innerHTML = senderName ? 
        `<strong>${senderName}:</strong> <div class="message-text">${message}</div>` :
        `<div class="message-text">${message}</div>`;
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
    if (urlParams.has("matchId")) {
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

            document.getElementById("chatUserName").textContent = profileData.username;
    
            // Verifica que el elemento con id 'profilePic' existe
            const profilePicElement = document.getElementById("profilePic");
            if (profilePicElement) {
                if (profileData.profile_picture) {
                    // Verifica si la imagen ya es una URL completa
                    if (profileData.profile_picture.startsWith('http')) {
                        profilePicElement.src = profileData.profile_picture;
                    } else {
                        // Si no, obtén la imagen desde el servidor
                        const fetchResponse = await fetch(`http://20.117.185.81:3000${profileData.profile_picture}`, {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem("token")}`
                            }
                        });
                        if (!fetchResponse.ok) throw new Error('Error al descargar la imagen');
                        const imageBlob = await fetchResponse.blob();
                        profilePicElement.src = URL.createObjectURL(imageBlob);
                    }
                } else {
                    profilePicElement.src = "https://placehold.co/80x120"; // Imagen predeterminada si no hay imagen de perfil
                }
            } else {
                console.error('No se encontró el elemento con id "profilePic"');
            }
    
            const messagesData = await loadMessages(matchId);
            console.log("Mensajes cargados:", messagesData);
    
            messagesData.messages.forEach(msg => {
                addMessageToChat(msg.message, msg.senderId === currentUser ? "sent" : "received");
            });

        } catch (error) {
            console.error("Error en loadChatUser:", error);
        }
    } else if (urlParams.has("match2PAId")) {
        const matchId = urlParams.get("match2PAId");
        
        document.getElementById("profilePic").src = "images/avatar-chat.webp";
        document.getElementById("chatUserName").textContent = "Match #" + matchId;
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

