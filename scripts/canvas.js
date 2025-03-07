// canvas.js

// Inicializar el canvas
const canvas = document.getElementById('matchAnimation');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas(); 
window.addEventListener('resize', resizeCanvas); // Ajustar el tamaño al cambiar la ventana

function animateMatch() {
    const particles = [];
    const particleCount = 200; 
    const textSize = 100;
    const textColor = "#FF4081";
    const textDuration = 100; // Duración del texto en frames
    let frame = 0;

    // Crear partículas
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            radius: Math.random() * 5 + 2,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`,
            velocity: {
                x: (Math.random() - 0.5) * 10,
                y: (Math.random() - 0.5) * 10
            },
            alpha: 1,
            life: Math.random() * 100 + 50 
        });
    }

    // Función para dibujar el texto
    function drawText() {
        ctx.font = `bold ${textSize}px Arial`;
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.globalAlpha = Math.min(1, frame / 20); // Fade in del texto
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    }

    // Función para dibujar partículas
    function drawParticles() {
        particles.forEach((particle, index) => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.alpha;
            ctx.fill();
            ctx.closePath();

            // Mover partículas
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            particle.alpha -= 0.01;
            particle.life -= 1;

            if (particle.life <= 0 || particle.alpha <= 0) {
                particles.splice(index, 1);
            }
        });
    }

    // Función principal de animación
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dibujar texto solo durante los primeros frames
        if (frame < textDuration) {
            drawText();
        }

        // Dibujar partículas
        drawParticles();

        // Continuar la animación si aún hay partículas
        if (particles.length > 0 || frame < textDuration) {
            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        frame++;
    }

    animate();
}