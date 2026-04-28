const canvas = document.getElementById("field");
const ctx = canvas.getContext("2d");

const DOT_RADIUS = 3;

class Dot {
    constructor(x, y, directionX, directionY) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
    }
    step() {
        this.x += this.directionX;
        this.y += this.directionY;
    }
    bounce(width, height) {
        if (this.x <= DOT_RADIUS || this.x >= width - DOT_RADIUS) {
            this.directionX *= -1;
        }
        if (this.y <= DOT_RADIUS || this.y >= height - DOT_RADIUS) {
            this.directionY *= -1;
        }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, DOT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
    }
}

const dots = [];

function generateRandomDots(count) {
    for (let i = 0; i < count; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const directionX = (Math.random() - 0.5) * 2;
        const directionY = (Math.random() - 0.5) * 2;
        const dot = new Dot(x, y, directionX, directionY);
        dots.push(dot);
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function animate() {
    clearCanvas();
    dots.forEach(dot => {
        dot.draw();
        dot.step();
        dot.bounce(canvas.width, canvas.height);
    });
    requestAnimationFrame(animate);
}

function init() {
    generateRandomDots(100);
    requestAnimationFrame(animate);
}

window.onload = init;