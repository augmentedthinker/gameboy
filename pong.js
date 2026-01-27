// 1. Get the screen
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- CONFIGURATION ---
const SCREEN_W = 160;
const SCREEN_H = 144;
const PADDLE_W = 10;
const PADDLE_H = 30;
const BALL_SIZE = 6;

const COLOR_BG = "#9bbc0f";    // Light green
const COLOR_DARK = "#0f380f";

// --- GAME STATE ---
let user = {};
let com = {};
let ball = {};
let isPaused = false;

// Initialize the game
function init() {
    user = {
        x: 0,
        y: SCREEN_H/2 - PADDLE_H/2,
        w: PADDLE_W,
        h: PADDLE_H,
        score: 0
    };
    
    com = {
        x: SCREEN_W - PADDLE_W,
        y: SCREEN_H/2 - PADDLE_H/2,
        w: PADDLE_W,
        h: PADDLE_H,
        score: 0
    };
    
    ball = {
        x: SCREEN_W/2,
        y: SCREEN_H/2,
        size: BALL_SIZE,
        speed: 2,
        velocityX: 2,
        velocityY: 2
    };
    
    isPaused = false;
}

// --- DRAWING FUNCTIONS ---
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawNet() {
    for (let i = 0; i <= SCREEN_H; i += 10) {
        drawRect(SCREEN_W/2 - 1, i, 2, 5, COLOR_DARK);
    }
}

function drawText(text, x, y) {
    ctx.fillStyle = COLOR_DARK;
    ctx.font = "20px monospace";
    ctx.fillText(text, x, y);
}

function draw() {
    // Clear screen
    drawRect(0, 0, SCREEN_W, SCREEN_H, COLOR_BG);
    
    drawNet();
    drawText(user.score, SCREEN_W/4, SCREEN_H/5);
    drawText(com.score, 3*SCREEN_W/4, SCREEN_H/5);
    
    drawRect(user.x, user.y, user.w, user.h, COLOR_DARK);
    drawRect(com.x, com.y, com.w, com.h, COLOR_DARK);
    drawRect(ball.x, ball.y, ball.size, ball.size, COLOR_DARK);
    
    if (isPaused) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff";
        ctx.font = "20px monospace";
        ctx.fillText("PAUSED", 45, 70);
    }
}

// --- UPDATE LOGIC ---
function collision(b, p) {
    b.top = b.y;
    b.bottom = b.y + b.size;
    b.left = b.x;
    b.right = b.x + b.size;

    p.top = p.y;
    p.bottom = p.y + p.h;
    p.left = p.x;
    p.right = p.x + p.w;

    return b.right > p.left && b.bottom > p.top && b.left < p.right && b.top < p.bottom;
}

function resetBall() {
    ball.x = SCREEN_W/2;
    ball.y = SCREEN_H/2;
    ball.speed = 2;
    ball.velocityX = -ball.velocityX; // Send it to the other player
}

function update() {
    if (isPaused) return;

    // Move the ball
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Simple AI for Computer
    // The computer tries to match the ball's Y position
    let computerLevel = 0.1; // 0.1 is easy, 1.0 is impossible to beat
    com.y += (ball.y - (com.y + com.h/2)) * computerLevel;

    // Wall Collision (Top and Bottom)
    if (ball.y + ball.size > SCREEN_H || ball.y < 0) {
        ball.velocityY = -ball.velocityY;
    }

    // Paddle Collision
    let player = (ball.x < SCREEN_W/2) ? user : com;

    if (collision(ball, player)) {
        // Calculate where the ball hit the paddle
        // Top of paddle = -1, Middle = 0, Bottom = 1
        let collidePoint = (ball.y + ball.size/2) - (player.y + player.h/2);
        collidePoint = collidePoint / (player.h/2);

        // Calculate angle (max 45 degrees)
        let angleRad = (Math.PI/4) * collidePoint;

        // Direction of ball
        let direction = (ball.x < SCREEN_W/2) ? 1 : -1;

        // Change velocity based on angle
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);

        // Speed up the game every hit
        ball.speed += 0.2;
    }

    // Score Points
    if (ball.x < 0) {
        com.score++;
        resetBall();
    } else if (ball.x > SCREEN_W) {
        user.score++;
        resetBall();
    }
}

// --- GAME LOOP ---
let lastTime = Date.now();
function gameLoop() {
    let now = Date.now();
    let delta = now - lastTime;
    
    // Update approx 60 FPS (1000ms / 60 = 16.6ms)
    if (delta > 15) {
        update();
        draw();
        lastTime = Date.now();
    }
    
    requestAnimationFrame(gameLoop);
}

// --- CONTROLS ---

// Keyboard
document.addEventListener("keydown", (event) => {
    if (event.keyCode == 38) { // UP Arrow
        user.y -= 15;
    } else if (event.keyCode == 40) { // DOWN Arrow
        user.y += 15;
    }
    // Keep paddle inside screen
    if (user.y < 0) user.y = 0;
    if (user.y + user.h > SCREEN_H) user.y = SCREEN_H - user.h;
});

// On-screen Buttons
document.getElementById("btn-up").addEventListener("click", () => {
    user.y -= 15;
    if (user.y < 0) user.y = 0;
});
document.getElementById("btn-down").addEventListener("click", () => {
    user.y += 15;
    if (user.y + user.h > SCREEN_H) user.y = SCREEN_H - user.h;
});

// Pause Button (Start)
document.getElementById("btn-start").addEventListener("click", () => {
    isPaused = !isPaused;
    draw();
});

// Start the game
init();
gameLoop();