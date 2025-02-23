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

        if (!response.ok) {
            throw new Error("No se pudo obtener el perfil");
        }

        const data = await response.json();

        // Rellenar los campos con los datos obtenidos
        document.getElementById("bio").value = data.bio || "";
        document.getElementById("height").value = data.height || "";
        document.getElementById("city").value = data.preferred_city || "";
        document.getElementById("interests").value = data.interests || "";
        document.getElementById("preferences").value = data.preferences || "";
        document.getElementById("lifestyle").value = data.lifestyle || "";
        document.getElementById("min-age").value = data.min_age_preference || "18";
        document.getElementById("max-age").value = data.max_age_preference || "99";
        document.getElementById("age-display").textContent = `${data.min_age_preference} - ${data.max_age_preference}`;

        // Si hay imagen de perfil guardada, mostrarla
        if (data.profile_image) {
            document.getElementById("image-preview-img").src = data.profile_image;
        }

    } catch (error) {
        console.error("Error cargando el perfil:", error);
        alert("Error al cargar el perfil.");
    }
}

async function saveProfile() {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("No has iniciado sesión.");
        window.location.href = "login.html";
        return;
    }

    const bio = document.getElementById("bio").value.trim();
    const interests = document.getElementById("interests").value.trim();
    const min_age_preference = document.getElementById("min-age").value;
    const max_age_preference = document.getElementById("max-age").value;
    const preferred_city = document.getElementById("city").value.trim();

    if (!bio || !interests || !min_age_preference || !max_age_preference || !preferred_city) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    try {
        const response = await fetch("http://20.90.161.106:3000/profile", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ bio, interests, min_age_preference, max_age_preference, preferred_city }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("Perfil actualizado correctamente.");
            window.location.href = "profile-page.html"; // 🔹 Redirige solo si la actualización fue exitosa
        } else {
            alert("Error: " + data.message);
        }
    } catch (error) {
        console.error("Error guardando el perfil:", error);
        alert("Hubo un error al guardar el perfil.");
    }
}
