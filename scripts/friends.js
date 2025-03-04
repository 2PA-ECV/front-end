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

function renderPendingRequests(requests) {
  const pendingRequestsList = document.getElementById("pendingRequestsList");
  pendingRequestsList.innerHTML = ''; // Limpiar lista actual

  requests.forEach(request => {
    const requestItem = document.createElement("li");
    requestItem.classList.add("request");
    
    requestItem.innerHTML = `
      <div class="request-info">
        <div class="request-name">${request.name}</div>
        <div class="request-hashtag">${request.hashtag}</div>
      </div>
      <div class="request-actions">
        <button class="accept" onclick="acceptFriendRequest(${request.id})">Aceptar</button>
        <button class="reject" onclick="rejectFriendRequest(${request.id})">Rechazar</button>
      </div>
    `;
    
    pendingRequestsList.appendChild(requestItem);
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
          body: JSON.stringify({ requestId })
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

async function rejectFriendRequest(requestId) {
  try {
      const response = await fetch('http://20.90.161.106:3000/friends/reject-request', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ requestId })
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


// Llamar a la función cuando la página cargue
document.addEventListener('DOMContentLoaded', () => {
  fetchUserTag();
  loadPendingRequests();
});
