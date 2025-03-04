document.addEventListener("DOMContentLoaded", loadProfile);

async function loadProfile() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("No has iniciado sesión.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch("http://20.90.161.106:3000/profile", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.status === 404) {
            // Si el perfil no existe, inicializa los campos con valores por defecto
            return;
        }

        if (!response.ok) {
            throw new Error("No se pudo obtener el perfil / Perfil no creado");
        }


        const data = await response.json();

        // Rellenar los campos con los datos obtenidos
        document.getElementById("bio").value = data.bio || "";
        document.getElementById("height").value = data.altura || "";
        document.getElementById("city").value = data.preferred_city || "";
        data.interests?.forEach(tag => addTag('interests-tags', tag));        
        document.getElementById("preferences").value = data.preferences || "";
        data.lifestyle?.forEach(tag => addTag('lifestyle-tags', tag));        
        document.getElementById("min-age").value = data.min_age_preference || "18";
        document.getElementById("max-age").value = data.max_age_preference || "99";
        document.getElementById("age-display").textContent = `${data.min_age_preference} - ${data.max_age_preference}`;

        // Si hay imagen de perfil guardada, mostrarla
        if (data.profile_picture) {
            // Verifica si la imagen ya es una URL completa
            if (data.profile_picture.startsWith('http')) {
                document.getElementById("image-preview-img").src = data.profile_picture;
            } else {
                // Si no, obtén la imagen desde el servidor
                const fetchResponse = await fetch(`http://20.90.161.106:3000${data.profile_picture}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!fetchResponse.ok) throw new Error('Error al descargar la imagen');
                const imageBlob = await fetchResponse.blob();
                document.getElementById("image-preview-img").src = URL.createObjectURL(imageBlob);
            }
        }

    } catch (error) {
        console.error("Error cargando el perfil:", error);
        alert("Error al cargar el perfil.");
    }
}

async function saveProfile() {
    const getTags = (containerId) => {
        return Array.from(document.querySelectorAll(`#${containerId} .tag span`))
                   .map(span => span.textContent);
    }
    const token = localStorage.getItem("token");
    console.log("Token obtenido:", token);

    if (!token) {
        alert("No has iniciado sesión.");
        window.location.href = "login.html";
        return;
    }

    // Obtener valores de los campos del formulario
    const bio = document.getElementById("bio").value.trim();
    const min_age_preference = parseInt(document.getElementById("min-age").value);
    const max_age_preference = parseInt(document.getElementById("max-age").value);
    const preferred_city = document.getElementById("city").value.trim();
    const altura = parseInt(document.getElementById("height").value);
    const preferences = document.getElementById("preferences").value;


    // Manejar imagen de perfil (puede ser un archivo o una URL)
    const profile_image = document.getElementById("profile-image").files[0];
    console.log("Imagen seleccionada:", profile_image);

    // Validar campos obligatorios
    if (!bio || isNaN(min_age_preference) || isNaN(max_age_preference) || !preferred_city || isNaN(altura)) {
        alert("Por favor, completa todos los campos obligatorios.");
        console.warn("Campos inválidos:", { bio, interests, min_age_preference, max_age_preference, preferred_city, altura });
        return;
    }
    

    // Crear objeto de usuario
    const userProfile = {
        bio,
        interests: getTags('interests-tags'),        
        min_age_preference,
        max_age_preference,
        preferred_city,
        altura,
        lifestyle: getTags('lifestyle-tags'),
        preferences,
        profile_picture: null
    };

    console.log("Datos a enviar:", userProfile);

    try {
        const response = await fetch("http://20.90.161.106:3000/profile", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userProfile),
        });

        console.log("Respuesta del servidor:", response);

        const data = await response.json();
        console.log("Datos recibidos:", data);

        if (response.ok) {
            alert("Perfil actualizado correctamente.");
        } else {
            alert("Error: " + (data.message || "No se pudo guardar el perfil."));
        }
    } catch (error) {
        console.error("Error guardando el perfil:", error);
        alert("Hubo un error al guardar el perfil.");
    }

    // Subir imagen si existe
    if (profile_image) {
        const formData = new FormData();
        formData.append('photo', profile_image);
        try {
            const response = await fetch('http://20.90.161.106:3000/photos/profilephoto', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`
                },
                body: formData
            });
        } catch (error) {
            console.error('Error al subir la imagen:', error);
        }
    }
    
}


// Función para inicializar valores por defecto si el perfil no existe
function initializeDefaultProfile() {
    document.getElementById("bio").value = "";
    document.getElementById("height").value = "";
    document.getElementById("city").value = "";
    document.getElementById("interests").value = "";
    document.getElementById("preferences").value = "";
    document.getElementById("lifestyle").value = "";
    document.getElementById("min-age").value = "18";
    document.getElementById("max-age").value = "99";
    document.getElementById("age-display").textContent = "18 - 99";
    document.getElementById("image-preview-img").src = "images/avatar-default.svg";
}
