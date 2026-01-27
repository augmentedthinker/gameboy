// 1. Get the screen
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- CONFIGURATION ---
const SQ = 8;            // Square size (same as Tetris)
const COL = 20;          // 160 width / 8 = 20 columns
const ROW = 18;          // 144 height / 8 = 18 rows

const COLOR_BG = "#9bbc0f";    // Light green
const COLOR_SNAKE = "#0f380f"; // Dark green
const COLOR_FOOD = "#306230";  // Medium green

// --- GAME STATE ---
let snake = [];
let food = { x: 0, y: 0 };
let score = 0;
let d = "RIGHT"; // Direction
let isPaused = false;

// Initialize the game
function init() {
    // Create the initial snake (3 segments)
    snake = [];
    snake[0] = { x: 5, y: 9 };
    snake[1] = { x: 4, y: 9 };
    snake[2] = { x: 3, y: 9 };
    
    score = 0;
    d = "RIGHT";
    createFood();
}

// Create food in a random spot
function createFood() {
    food = {
        x: Math.floor(Math.random() * COL),
        y: Math.floor(Math.random() * ROW)
    };
    
    // Make sure food doesn't spawn on the snake body
    for (let i = 0; i < snake.length; i++) {
        if (food.x == snake[i].x && food.y == snake[i].y) {
            createFood(); // Try again
        }
    }
}

// --- DRAWING ---
function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * SQ, y * SQ, SQ, SQ);
    
    ctx.strokeStyle = "#8bac0f";
    ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
}

function draw() {
    // Clear screen
    ctx.fillStyle = COLOR_BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Snake
    for (let i = 0; i < snake.length; i++) {
        drawSquare(snake[i].x, snake[i].y, COLOR_SNAKE);
    }
    
    // Draw Food
    drawSquare(food.x, food.y, COLOR_FOOD);
    
    // Draw Score
    ctx.fillStyle = COLOR_SNAKE;
    ctx.font = "10px monospace";
    ctx.fillText("SCORE: " + score, 5, 10);
    
    if (isPaused) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff";
        ctx.font = "20px monospace";
        ctx.fillText("PAUSED", 45, 70);
    }
}

// --- UPDATE LOGIC ---
function update() {
    if (isPaused) return;

    // Head position
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;
    
    // Move head based on direction
    if (d == "LEFT") snakeX -= 1;
    if (d == "UP") snakeY -= 1;
    if (d == "RIGHT") snakeX += 1;
    if (d == "DOWN") snakeY += 1;
    
    // Collision with walls
    if (snakeX < 0 || snakeX >= COL || snakeY < 0 || snakeY >= ROW) {
        gameOver();
        return;
    }
    
    // Collision with self
    for (let i = 0; i < snake.length; i++) {
        if (snakeX == snake[i].x && snakeY == snake[i].y) {
            gameOver();
            return;
        }
    }
    
    // Eat Food
    if (snakeX == food.x && snakeY == food.y) {
        score++;
        if(window.playSound) window.playSound('score');
        createFood();
        // We don't remove the tail, so the snake grows
    } else {
        // Remove the tail
        snake.pop();
    }
    
    // Add new head
    let newHead = { x: snakeX, y: snakeY };
    snake.unshift(newHead);
}

function gameOver() {
    if(window.playSound) window.playSound('gameover');
    alert("Game Over! Score: " + score);
    init();
}

// --- GAME LOOP ---
let lastTime = Date.now();
function gameLoop() {
    let now = Date.now();
    let delta = now - lastTime;
    
    // Update every 160ms (Slower for beginners)
    if (delta > 160) {
        update();
        draw();
        lastTime = Date.now();
    }
    
    requestAnimationFrame(gameLoop);
}

// --- CONTROLS ---
document.addEventListener("keydown", direction);

function direction(event) {
    let key = event.keyCode;
    // Prevent reversing directly into yourself
    if (key == 37 && d != "RIGHT") d = "LEFT";
    else if (key == 38 && d != "DOWN") d = "UP";
    else if (key == 39 && d != "LEFT") d = "RIGHT";
    else if (key == 40 && d != "UP") d = "DOWN";
}

// On-screen buttons
document.getElementById("btn-left").addEventListener("click", () => { if(d!="RIGHT") d="LEFT" });
document.getElementById("btn-up").addEventListener("click", () => { if(d!="DOWN") d="UP" });
document.getElementById("btn-right").addEventListener("click", () => { if(d!="LEFT") d="RIGHT" });
document.getElementById("btn-down").addEventListener("click", () => { if(d!="UP") d="DOWN" });

// Pause (Start Button)
document.getElementById("btn-start").addEventListener("click", () => {
    isPaused = !isPaused;
    draw(); // Force redraw to show/hide "PAUSED" text
});

// Start!
init();
gameLoop();