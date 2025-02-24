document.getElementById("login-form").addEventListener("submit", async function(event) {
    event.preventDefault(); 

    const emailorusername = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!emailorusername || !password) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    try {
        const response = await fetch("http://20.90.161.106:3000/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ emailorusername, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Login exitoso");
            if (data.token) localStorage.setItem("token", data.token);
            window.location.href = "like-page.html"; 
        } else {
            alert("Credenciales incorrectas, inténtalo de nuevo");
        }

        
    } catch (error) {
        console.error("Error en login:", error);
        alert(error.message);
    }
});
