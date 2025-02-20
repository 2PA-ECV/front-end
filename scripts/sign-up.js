document.getElementById("signup-form").addEventListener("submit", async function(event) {
    event.preventDefault(); 
    
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const dob = document.getElementById("dob").value.trim();
    const gender = document.getElementById("gender").value;
    const city = document.getElementById("city").value.trim();

    if (!name || !email || !username || !password || !dob || !gender || !city) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert("Por favor, introduce un correo electrónico válido.");
        return;
    }

    if (password.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres.");
        return;
    }

    console.log({ name, username, email, password, dob, gender, city });

    userData = { name, username, email, password, dob, gender, city };

    try {
        fetch("http://localhost:3000/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        })
        .then(response => response.json())  // Parseamos la respuesta a JSON
        .then(data => {
            console.log("Usuario registrado:", data);  // Aquí manejamos la respuesta exitosa
        })
        .catch(error => {
            console.error("Error al registrar usuario:", error);  // Manejamos errores si ocurren
        });

        //localStorage.setItem("token", data.token);
        window.location.href = "like-page.html"; 

    } catch (error) {
        console.error("Error en el registro:", error);
        alert(error.message);
    }
});