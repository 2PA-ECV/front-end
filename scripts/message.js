async function obtenerMatches() {
    const token = localStorage.getItem("token"); // Asume que el token está guardado
    if (!token) {
        console.error("Token no encontrado.");
        return;
    }

    // Obtener los matches
    const response = await fetch("http://20.117.185.81:3000/matches", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        console.error("Error al obtener los matches");
        return;
    }

    const data = await response.json();
    console.log("Matches obtenidos:", data);

    // Obtener los matches 2PA
    const response_2 = await fetch("http://20.117.185.81:3000/matches2pa", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    matches = await response_2.json();
    console.log("Matches 2PA obtenidos:", matches);

    // Obtener el usuario actual
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
    
    mostrarMatchesEnHTML(data, currentUser);
    mostrarMatchesMessageEnHTML(data, currentUser);
    mostrarMatches2PAMessageEnHTML(matches, currentUser);


}

async function mostrarMatchesEnHTML(matches, currentUser) {
    const container = document.querySelector(".matches");
    container.innerHTML = ""; // Limpiar antes de añadir nuevos

    for (const match of matches) {
        const matchElement = document.createElement("div");
        matchElement.classList.add("match");

        if(match.user_id_1 == currentUser){
            // Obtener las fotos del usuario
            try {
                const response = await fetch(`http://20.117.185.81:3000/photos/${match.user_id_2}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("token")}`
                    }
                });
    
                if (!response.ok) throw new Error('Error al obtener las fotos');
    
                const photos = await response.json();
                console.log('Fotos obtenidas:', photos);
    
                const images = await Promise.all(photos.length > 0 ? photos.map(async (photo) => {
                    if (photo.photo_url.startsWith('http')) {
                        return photo.photo_url;
                    }
                    const fetchResponse = await fetch(`http://20.117.185.81:3000${photo.photo_url}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem("token")}`
                        }
                    });
                    if (!fetchResponse.ok) throw new Error('Error al descargar la imagen');
                    return URL.createObjectURL(await fetchResponse.blob());
                }) : ['images/default.png']);
    
                const profilePicture = images.length > 0 ? images[0] : 'https://placehold.co/80x120';

                const profileResponse = await fetch(`http://20.117.185.81:3000/profile/${match.user_id_2}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!profileResponse.ok) throw new Error("Error al obtener el perfil del usuario");
                const profileData = await profileResponse.json();
                
                matchElement.innerHTML = `
                    <img src="${profilePicture}" alt="Foto de ${profileData.username}">
                    <div>${profileData.username}</div>
                `;
                
            } catch (error) {
                console.error('Error al obtener las fotos:', error);
                matchElement.innerHTML = `
                    <img src="https://placehold.co/80x120" alt="Foto de ${match.name}">
                    <div>${profileData.username}</div>
                `;
            }
            console.log("Match id:", match.match_id);
            matchElement.addEventListener("click", () => abrirChat(match.match_id));
            container.appendChild(matchElement);
        } else{
            try {
                const response = await fetch(`http://20.117.185.81:3000/photos/${match.user_id_1}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("token")}`
                    }
                });
    
                if (!response.ok) throw new Error('Error al obtener las fotos');
    
                const photos = await response.json();
                console.log('Fotos obtenidas:', photos);
    
                const images = await Promise.all(photos.length > 0 ? photos.map(async (photo) => {
                    if (photo.photo_url.startsWith('http')) {
                        return photo.photo_url;
                    }
                    const fetchResponse = await fetch(`http://20.117.185.81:3000${photo.photo_url}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem("token")}`
                        }
                    });
                    if (!fetchResponse.ok) throw new Error('Error al descargar la imagen');
                    return URL.createObjectURL(await fetchResponse.blob());
                }) : ['images/default.png']);
    
                const profilePicture = images.length > 0 ? images[0] : 'https://placehold.co/80x120';

                const profileResponse = await fetch(`http://20.117.185.81:3000/profile/${match.user_id_1}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!profileResponse.ok) throw new Error("Error al obtener el perfil del usuario");
                const profileData = await profileResponse.json();
                
                matchElement.innerHTML = `
                    <img src="${profilePicture}" alt="Foto de ${profileData.username}">
                    <div>${profileData.username}</div>
                `;

            } catch (error) {
                console.error('Error al obtener las fotos:', error);
                matchElement.innerHTML = `
                    <img src="https://placehold.co/80x120" alt="Foto de ${match.name}">
                    <div>${profileData.username}</div>
                `;
            }
            console.log("Match id:", match.match_id);
            matchElement.addEventListener("click", () => abrirChat(match.match_id));
            container.appendChild(matchElement);
        }
    }
}


async function mostrarMatchesMessageEnHTML(matches, currentUser) {
    const messagesContainer = document.querySelector("#normal-matches"); // Seleccionar solo los mensajes de match normales
    messagesContainer.innerHTML = ""; // Limpiar los mensajes anteriores

    for (const match of matches) {
        // Crear el contenedor de match
        const messageElement = document.createElement("div");
        messageElement.classList.add("message");
        
        // Determinar cuál es el usuario al que corresponde la foto
        const userId = (match.user_id_1 === currentUser) ? match.user_id_2 : match.user_id_1;
        
        try {
            const profileResponse = await fetch(`http://20.117.185.81:3000/profile/${userId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                }
            });

            if (!profileResponse.ok) throw new Error("Error al obtener el perfil del usuario");
            const profileData = await profileResponse.json();
                
            let profilePicture = 'https://placehold.co/80x120';

            if (profileData.profile_picture) {
                if (profileData.profile_picture.startsWith('http')) {
                    profilePicture = profileData.profile_picture;
                } else {
                    const fetchResponse = await fetch(`http://20.117.185.81:3000${profileData.profile_picture}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem("token")}`
                        }
                    });
    
                    if (fetchResponse.ok) {
                        profilePicture = URL.createObjectURL(await fetchResponse.blob());
                    }
                }
            }

            // Mantener la estructura de tu mensaje
            messageElement.innerHTML = `
                <img src="${profilePicture}" alt="Foto de ${profileData.username}">
                <div class="info">
                    <div class="name">${profileData.username}</div>
                    <div class="status">Empieza la conversación!</div>
                </div>
                <div class="badge">LE GUSTAS</div>
            `;

            

        } catch (error) {
            console.error('Error al obtener las fotos:', error);
            messageElement.innerHTML = `
                <img src="https://placehold.co/80x120" alt="Foto de ${profileData.username}">
                <div class="info">
                    <div class="name">${profileData.username}</div>
                    <div class="status">Empieza la conversación!</div>
                </div>
                <div class="badge">LE GUSTAS</div>
            `;
        }

        // Agregar el evento de click para abrir el chat
        messageElement.addEventListener("click", () => abrirChat(match.match_id));
        messagesContainer.appendChild(messageElement);
    }
}

async function mostrarMatches2PAMessageEnHTML(matches2pa, currentUser) {
    const messagesContainer = document.querySelector("#pa-matches"); // Seleccionar solo los mensajes de match normales
    messagesContainer.innerHTML = ""; // Limpiar los mensajes anteriores
    console.log("Matches 2PA:", matches2pa);
    for (const match of matches2pa) {
        // Filtrar los tres amigos (excluyendo al usuario actual)
        const friends = [match.user_id_1, match.user_id_2, match.friend_1_id, match.friend_2_id].filter(f => f !== currentUser);
        console.log("Amigos del match 2PA:", friends);
        // Obtener las fotos de los amigos
        const profilePictures = await Promise.all(friends.map(f => obtenerFotoPerfil(f)));
        console.log("Fotos de perfil del match 2PA:", profilePictures);
        // Crear la imagen de grupo combinada
        // const groupProfilePicture = await generarImagenGrupo(profilePictures);

        // Crear el contenedor de match
        const messageElement = document.createElement("div");
        messageElement.classList.add("message");

        // Estructura HTML del match 2PA
        messageElement.innerHTML = `
                <img src="images/avatar-chat.webp" alt="Foto del grupo">
                <div class="info">
                    <div class="name">Match 2-pa #${match.match_id}</div>
                    <div class="status">¡Empieza la conversación en grupo!</div>
                </div>
                <div class="badge">MATCH 2PA</div>
        `;

        // Agregar evento para abrir el chat del match 2PA
        messageElement.addEventListener("click", () => abrirChat2Pa(match.match_id));
        messagesContainer.appendChild(messageElement);
    }
}

async function obtenerFotoPerfil(userId) {
    try {
        const profileResponse = await fetch(`http://20.117.185.81:3000/profile/${userId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            }
        });

        if (!profileResponse.ok) throw new Error("Error al obtener el perfil del usuario");
        const profileData = await profileResponse.json();

        let profilePicture = 'https://placehold.co/80x120';

        if (profileData.profile_picture) {
            if (profileData.profile_picture.startsWith('http')) {
                profilePicture = profileData.profile_picture;
            } else {
                const fetchResponse = await fetch(`http://20.117.185.81:3000${profileData.profile_picture}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("token")}`
                    }
                });

                if (fetchResponse.ok) {
                    profilePicture = URL.createObjectURL(await fetchResponse.blob());
                }
            }
        }
        return profilePicture;
    } catch (error) {
        console.error("Error obteniendo la foto de perfil:", error);
        return 'https://placehold.co/80x120';
    }
}


async function generarImagenGrupo(imageUrls) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const size = 100; // Tamaño total de la imagen
        canvas.width = size;
        canvas.height = size;

        const positions = [
            { x: 0, y: 0, w: size / 2, h: size / 2 }, // Arriba izquierda
            { x: size / 2, y: 0, w: size / 2, h: size / 2 }, // Arriba derecha
            { x: size / 4, y: size / 2, w: size / 2, h: size / 2 } // Abajo centro
        ];

        let loadedImages = 0;
        const images = [];

        imageUrls.forEach((url, index) => {
            const img = new Image();
            img.crossOrigin = "anonymous"; // Intentar evitar problemas CORS
            img.src = url;

            img.onload = () => {
                images[index] = img;
                loadedImages++;
                if (loadedImages === imageUrls.length) {
                    // Dibujar imágenes en el canvas
                    images.forEach((img, i) => {
                        const { x, y, w, h } = positions[i];
                        ctx.drawImage(img, x, y, w, h);
                    });

                    resolve(canvas.toDataURL("image/png"));
                }
            };

            img.onerror = () => {
                console.warn(`Error cargando imagen: ${url}`);
                images[index] = new Image();
                images[index].src = "https://placehold.co/80x120"; // Reemplazo por imagen por defecto
                loadedImages++;

                if (loadedImages === imageUrls.length) {
                    images.forEach((img, i) => {
                        const { x, y, w, h } = positions[i];
                        ctx.drawImage(img, x, y, w, h);
                    });

                    resolve(canvas.toDataURL("image/png"));
                }
            };
        });
    });
}




function abrirChat(matchId) {
    window.location.href = `private-message-page.html?matchId=${matchId}`;
}

function abrirChat2Pa(matchId) {
    window.location.href = `private-message-page.html?match2PAId=${matchId}`;
}

document.addEventListener("DOMContentLoaded", () => {
    setupTabs(); // Configurar los tabs
    obtenerMatches(); // Cargar los matches al iniciar la página
});

function setupTabs() {
    const tabButtons = document.querySelectorAll(".tab-button"); // Selecciona todos los botones de pestaña
    const tabContents = document.querySelectorAll(".tab-content"); // Selecciona todos los contenidos de pestaña

    tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
            // Remover la clase "active" de todos los botones y contenidos
            tabButtons.forEach((btn) => btn.classList.remove("active"));
            tabContents.forEach((content) => content.classList.remove("active"));

            // Agregar la clase "active" al botón y contenido seleccionado
            const tabId = button.getAttribute("data-tab"); // Obtener el ID de la pestaña desde el atributo data-tab
            button.classList.add("active"); // Activar el botón clicado
            document.getElementById(tabId).classList.add("active"); // Activar el contenido correspondiente
        });
    });
}
