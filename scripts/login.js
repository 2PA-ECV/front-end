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

        if (response.ok) {
            alert("Login exitoso");
            if (data.token) localStorage.setItem("token", data.token);
        } else {
            alert("Error: " + data.message);
        }

        const data = await response.json();
        alert("Login exitoso");

        if (data.token) {
            localStorage.setItem("token", data.token);
            window.location.href = "like-page.html"; 
        }

    } catch (error) {
        console.error("Error en login:", error);
        alert(error.message);
    }
});
