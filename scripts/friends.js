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

// Llamar a la función cuando la página cargue
document.addEventListener('DOMContentLoaded', fetchUserTag);