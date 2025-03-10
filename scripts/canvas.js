// canvas.js

// Inicializar el canvas
const canvas = document.getElementById('matchAnimation');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Crear la función para dibujar un corazón
// Basado en la implementación de "dcode" en YouTube
function drawHeart(x, y, size, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = alpha;

    // Dibujar el borde del corazón
    ctx.beginPath();
    ctx.moveTo(0, -size / 4);
    ctx.bezierCurveTo(size / 2, -size / 2, size, 0, 0, size);
    ctx.bezierCurveTo(-size, 0, -size / 2, -size / 2, 0, -size / 4);
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dibujar el relleno del corazón
    ctx.beginPath();
    ctx.moveTo(0, -size / 4);
    ctx.bezierCurveTo(size / 2, -size / 2, size, 0, 0, size);
    ctx.bezierCurveTo(-size, 0, -size / 2, -size / 2, 0, -size / 4);
    ctx.fillStyle = color;
    ctx.fill();

    // Añadir brillo al corazón
    ctx.beginPath();
    ctx.moveTo(0, -size / 4);
    ctx.bezierCurveTo(size / 3, -size / 3, size / 2, 0, 0, size / 2);
    ctx.bezierCurveTo(-size / 2, 0, -size / 3, -size / 3, 0, -size / 4);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
    ctx.fill();

    ctx.restore();
}

// Función para animar el "match"
function animateMatch() {
    const hearts = [];
    const particles = [];
    const heartCount = 100;
    const textSize = 100;
    const textColor = "#FF4081";
    const text = "MATCH!";
    let frame = 0;
    let hue = 0; 

    // Crear corazones
    for (let i = 0; i < heartCount; i++) {
        hearts.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            size: Math.random() * 30 + 20,
            color: `hsla(${Math.random() * 360}, 100%, 50%, ${Math.random() * 0.5 + 0.5})`,
            speedX: (Math.random() - 0.5) * 10,
            speedY: (Math.random() - 0.5) * 10,
            alpha: 1,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1
        });
    }

    // Función para crear partículas
    function createParticles(x, y, color) {
        for (let i = 0; i < 5; i++) {
            particles.push({
                x: x,
                y: y,
                size: Math.random() * 3 + 1,
                color: color,
                speedX: (Math.random() - 0.5) * 4,
                speedY: (Math.random() - 0.5) * 4,
                alpha: 1,
                life: Math.random() * 30 + 20
            });
        }
    }

    // Función para dibujar el texto con efecto de rebote
    function drawText() {
        const scale = 1 + Math.sin(frame * 0.1) * 0.1; // Efecto de rebote
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(scale, scale);
        ctx.font = `bold ${textSize}px Arial`;
        ctx.fillStyle = textColor;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.globalAlpha = Math.min(1, frame / 30); // Fade in del texto
        ctx.fillText(text, 0, 0);
        ctx.restore();
    }

    function drawHearts() {
        hearts.forEach((heart, index) => {
            drawHeart(heart.x, heart.y, heart.size, heart.color, heart.alpha);
            heart.x += heart.speedX;
            heart.y += heart.speedY;
            heart.alpha -= 0.01;
            heart.rotation += heart.rotationSpeed;

            if (heart.alpha <= 0.5) {
                createParticles(heart.x, heart.y, heart.color);
            }

            if (heart.alpha <= 0) {
                hearts.splice(index, 1);
            }
        });
    }

    // Función para dibujar y mover partículas
    function drawParticles() {
        particles.forEach((particle, index) => {
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.alpha;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();

            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.alpha -= 0.02;
            particle.life--;

            if (particle.life <= 0) {
                particles.splice(index, 1);
            }
        });
    }

    // Función principal
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Cambiar el color del fondo gradualmente
        hue = (hue + 0.5) % 360;
        ctx.fillStyle = `hsla(${hue}, 50%, 20%, 0.1)`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Dibujar texto
        drawText();

        // Dibujar corazones
        drawHearts();

        // Dibujar partículas
        drawParticles();

        // Continuar la animación si aún hay corazones o partículas
        if (hearts.length > 0 || particles.length > 0) {
            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        frame++;
    }

    animate();
};