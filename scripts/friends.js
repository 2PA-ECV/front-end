async function obtenerUsuarioLogeado() {
  const token = localStorage.getItem("token"); // Obtener el token desde localStorage
  if (!token) {
      console.error("No se encontró el token");
      return;
  }

  const userResponse = await fetch('http://20.90.161.106:3000/user/', {
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

function copyHashtag() {
  const hashtag = document.getElementById("userHashtag").textContent;
  
  navigator.clipboard.writeText(hashtag).then(() => {
    showCopyFeedback();
  }).catch(err => {
    console.error('Error al copiar:', err);
    fallbackCopy(hashtag);
  });
}

function fallbackCopy(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  
  try {
    document.execCommand('copy');
    showCopyFeedback();
  } catch (err) {
    alert('Error al copiar, por favor copia manualmente');
  }
  
  document.body.removeChild(textArea);
}

function showCopyFeedback() {
  const copyMessage = document.getElementById("copyMessage");
  copyMessage.style.display = "block";
  setTimeout(() => {
    copyMessage.style.display = "none";
  }, 2000);
}

function shareViaWhatsApp() {
  const hashtag = document.getElementById("userHashtag").textContent;
  const encodedText = encodeURIComponent(`¡Agrégame en 2PA! Mi hashtag es: ${hashtag}`);
  const whatsappUrl = `https://wa.me/?text=${encodedText}`;
  
  window.open(whatsappUrl, '_blank');
}

const apiUrl = "http://20.90.161.106:3000/user/";
const token = localStorage.getItem("token");

async function fetchUserTag() {
  if (!token) {
    console.error("No hay token de autenticación");
    return;
  }

  try {
    const response = await fetch(apiUrl, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log("Respuesta del servidor:", data); // Para depuración
    
    if (data.user_tag) {
      document.getElementById("userHashtag").textContent = data.user_tag;
    } else {
      console.error("El servidor no devolvió user_tag");
    }
  } catch (error) {
    console.error("Error al obtener el hashtag:", error);
    document.getElementById("userHashtag").textContent = "#ErrorCarga";
  }
}

async function loadPendingRequests() {
  try {
      const response = await fetch('http://20.90.161.106:3000/friends/pending-requests', {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${localStorage.getItem("token")}`
          }
      });

      if (!response.ok) {
          throw new Error(`Error al obtener solicitudes pendientes: ${response.status} ${response.statusText}`);
      }

      const pendingRequests = await response.json();
      console.log("Solicitudes pendientes:", pendingRequests);

      renderPendingRequests(pendingRequests);
  } catch (error) {
      console.error("Error en loadPendingRequests:", error);
  }
}

async function renderPendingRequests(requests) {
  const pendingRequestsList = document.getElementById("pendingRequestsList");
  pendingRequestsList.innerHTML = ''; // Limpiar lista actual

  currentUserId = await obtenerUsuarioLogeado();

  requests.forEach(request => {
    if (request.user_id_2 == currentUserId) {
      const requestItem = document.createElement("li");
      requestItem.classList.add("request");
      // Solicitud recibida por el usuario actual
      requestItem.innerHTML = `
        <div class="request-info">
          <div class="request-name">${request.name}</div>
          <div class="request-hashtag">${request.hashtag}</div>
        </div>
        <div class="request-actions">
          <button class="accept" onclick="acceptFriendRequest(${request.user_id_1})">Aceptar</button>
          <button class="reject" onclick="rejectFriendRequest(${request.user_id_1})">Rechazar</button>
        </div>
      `;

      pendingRequestsList.appendChild(requestItem);
    }
  });
}

async function acceptFriendRequest(requestId) {
  try {
      const response = await fetch('http://20.90.161.106:3000/friends/accept-request', {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${localStorage.getItem("token")}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ targetUserId: requestId })
      });

      if (!response.ok) {
          throw new Error(`Error al aceptar la solicitud: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Solicitud aceptada:", result);
      alert(result.message);
      loadPendingRequests();  
  } catch (error) {
      console.error("Error en acceptFriendRequest:", error);
  }
}

async function sendFriendRequest(friendId) {
  try {
      const response = await fetch("http://20.90.161.106:3000/friends/send-request", {
          method: "POST",
          headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json"
          },
          body: JSON.stringify({ targetUserId: friendId }) 
      });

      if (!response.ok) {
          throw new Error(`Error al enviar solicitud: ${response.status} ${response.statusText}`);
      }
      console.log("Solicitud enviada");
      alert("Solicitud enviada");
  } catch (error) {
      console.error("Error en sendFriendRequest:", error);
  }
} 

async function rejectFriendRequest(requestId) {
  try {
      const response = await fetch('http://20.90.161.106:3000/friends/reject-request', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ targetUserId: requestId })
      });

      if (!response.ok) {
          throw new Error('Error al rechazar la solicitud');
      }

      alert('Solicitud rechazada');
      loadPendingRequests(); 
  } catch (error) {
      console.error(error);
  }
}

async function searchFriend() {
  try {
      const userTag = document.getElementById("searchHashtag").value.trim();
      if (!userTag) {
          alert("Por favor, introduce un hashtag para buscar.");
          return;
      }

      const encodedTag = encodeURIComponent(userTag); // Codifica el hashtag para la URL
      const response = await fetch(`http://20.90.161.106:3000/friends/search/${encodedTag}`, {
          method: "GET",
          headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
      });

      if (!response.ok) {
          throw new Error(`Error al buscar amigo: ${response.status} ${response.statusText}`);
      }

      const friendData = await response.json();
      console.log("Amigo encontrado:", friendData);
      sendFriendRequest(friendData.user_id);

  } catch (error) {
      console.error("Error en searchFriend:", error);
      alert("No se encontró ningún usuario con ese hashtag.");
  }
}

async function getFriends() {
  try {
      const response = await fetch('http://20.90.161.106:3000/friends/', {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${localStorage.getItem("token")}`
          }
      });

      if (!response.ok) {
          throw new Error(`Error al obtener la lista de amigos: ${response.status} ${response.statusText}`);
      }

      const friendsList = await response.json();
      console.log("Lista de amigos:", friendsList);

      renderFriendsList(friendsList);
  } catch (error) {
      console.error("Error en getFriends:", error);
  }
}

function renderFriendsList(friends) {
  const friendsListContainer = document.getElementById("friendsList");
  friendsListContainer.innerHTML = ''; // Limpiar la lista antes de renderizar

  friends.forEach(friend => {
      const friendItem = document.createElement("li");
      friendItem.classList.add("friend");

      friendItem.innerHTML = `
          <div class="friend-info">
              <div class="friend-name">${friend.name}</div>
              <div class="friend-hashtag">${friend.hashtag}</div>
          </div>
          <div class="friend-actions">
              <button class="remove" onclick="removeFriend(${friend.id})">Eliminar amigo</button>
          </div>
      `;

      friendsListContainer.appendChild(friendItem);
  });
}

async function removeFriend(friendId) {
  try {
      const response = await fetch('http://20.90.161.106:3000/friends/delete-friend', {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${localStorage.getItem("token")}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ targetUserId: friendId })
      });

      if (!response.ok) {
          throw new Error(`Error al eliminar amigo: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Amigo eliminado:", result);
      alert(result.message);

      getFriends(); // Volver a cargar la lista de amigos
  } catch (error) {
      console.error("Error en removeFriend:", error);
  }
}

// Llamar a la función cuando la página cargue
document.addEventListener('DOMContentLoaded', () => {
  fetchUserTag();
  loadPendingRequests();
  getFriends();

  setInterval(loadPendingRequests, 10000);
  setInterval(getFriends, 10000);              
});

