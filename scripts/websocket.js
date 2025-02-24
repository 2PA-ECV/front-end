const socket = io("ws://20.90.161.106:4000");

function conectarChat() {
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get("matchId");

    if (matchId) {
        socket.emit("joinRoom", matchId);
        console.log(`Usuario conectado a la sala ${matchId}`);

        // Escuchar mensajes entrantes
        socket.on("receiveMessage", (mensaje) => {
            mostrarMensaje(mensaje);
        });
    }
}

function enviarMensaje() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();
    const matchId = new URLSearchParams(window.location.search).get("matchId");
    const senderId = localStorage.getItem("userId");

    if (message && matchId && senderId) {
        socket.emit("sendMessage", { matchId, senderId, message });
        messageInput.value = "";
    }
}

function mostrarMensaje(mensaje) {
    const chatBox = document.querySelector(".chat-box");
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    messageElement.innerHTML = `<strong>${mensaje.senderId}:</strong> ${mensaje.message}`;
    chatBox.appendChild(messageElement);
}

// Escuchar carga de la página para conectar el chat
document.addEventListener("DOMContentLoaded", conectarChat);
