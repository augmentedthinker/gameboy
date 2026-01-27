// 1. Get the screen (canvas) from the HTML
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- CONFIGURATION ---
const ROW = 18;          // 18 rows high
const COL = 10;          // 10 columns wide
const SQ = 8;            // Square size in pixels (8px x 18 rows = 144px height)
const VACANT = "#9bbc0f"; // The background color (empty square)

// We center the board horizontally. 
// Screen width (160) - Board width (80) = 80 remaining. 
// Divide by 2 = 40px margin on the left.
const X_OFFSET = 40; 

// --- DRAWING FUNCTIONS ---

// Draw a single square
function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    // Draw the rectangle
    ctx.fillRect(x * SQ + X_OFFSET, y * SQ, SQ, SQ);
    
    // Draw a thin border so we can see individual blocks
    ctx.strokeStyle = "#8bac0f"; // Slightly darker green for grid lines
    ctx.strokeRect(x * SQ + X_OFFSET, y * SQ, SQ, SQ);
}

// Create the board (the grid)
let board = [];
for (let r = 0; r < ROW; r++) {
    board[r] = [];
    for (let c = 0; c < COL; c++) {
        board[r][c] = VACANT;
    }
}

// Draw the board to the screen
function drawBoard() {
    for (let r = 0; r < ROW; r++) {
        for (let c = 0; c < COL; c++) {
            drawSquare(c, r, board[r][c]);
        }
    }
}

// --- THE PIECES ---

// The shapes are defined as 0 (empty) and 1 (filled)
const Z = [
    [[1,1,0],[0,1,1],[0,0,0]],
    [[0,0,1],[0,1,1],[0,1,0]],
    [[0,0,0],[1,1,0],[0,1,1]],
    [[0,1,0],[1,1,0],[1,0,0]]
];

const S = [
    [[0,1,1],[1,1,0],[0,0,0]],
    [[0,1,0],[0,1,1],[0,0,1]],
    [[0,0,0],[0,1,1],[1,1,0]],
    [[1,0,0],[1,1,0],[0,1,0]]
];

const J = [
    [[0,1,0],[0,1,0],[1,1,0]],
    [[1,0,0],[1,1,1],[0,0,0]],
    [[0,1,1],[0,1,0],[0,1,0]],
    [[0,0,0],[1,1,1],[0,0,1]]
];

const T = [
    [[0,1,0],[1,1,1],[0,0,0]],
    [[0,1,0],[0,1,1],[0,1,0]],
    [[0,0,0],[1,1,1],[0,1,0]],
    [[0,1,0],[1,1,0],[0,1,0]]
];

const L = [
    [[0,1,0],[0,1,0],[0,1,1]],
    [[0,0,0],[1,1,1],[1,0,0]],
    [[1,1,0],[0,1,0],[0,1,0]],
    [[0,0,1],[1,1,1],[0,0,0]]
];

const I = [
    [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]],
    [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    [[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],
    [[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0]]
];

const O = [
    [[0,0,0,0],[0,1,1,0],[0,1,1,0],[0,0,0,0]],
    [[0,0,0,0],[0,1,1,0],[0,1,1,0],[0,0,0,0]],
    [[0,0,0,0],[0,1,1,0],[0,1,1,0],[0,0,0,0]],
    [[0,0,0,0],[0,1,1,0],[0,1,1,0],[0,0,0,0]]
];

// Colors for the pieces (Darkest Game Boy colors)
const PIECES = [
    [Z, "#0f380f"],
    [S, "#306230"],
    [T, "#0f380f"],
    [O, "#306230"],
    [L, "#0f380f"],
    [I, "#306230"],
    [J, "#0f380f"]
];

// Generate a random piece
function randomPiece() {
    let r = Math.floor(Math.random() * PIECES.length);
    return new Piece(PIECES[r][0], PIECES[r][1]);
}

// The Piece Object
function Piece(tetromino, color) {
    this.tetromino = tetromino; // The shape patterns
    this.color = color;
    
    this.tetrominoN = 0; // Start with the first rotation pattern
    this.activeTetromino = this.tetromino[this.tetrominoN];
    
    // Start position
    this.x = 3;
    this.y = -2; // Start slightly above the board
}

// Draw the piece
Piece.prototype.draw = function() {
    for (let r = 0; r < this.activeTetromino.length; r++) {
        for (let c = 0; c < this.activeTetromino.length; c++) {
            // We only draw the '1's (occupied squares)
            if (this.activeTetromino[r][c]) {
                drawSquare(this.x + c, this.y + r, this.color);
            }
        }
    }
}

// Undraw the piece (used before moving)
Piece.prototype.unDraw = function() {
    for (let r = 0; r < this.activeTetromino.length; r++) {
        for (let c = 0; c < this.activeTetromino.length; c++) {
            if (this.activeTetromino[r][c]) {
                drawSquare(this.x + c, this.y + r, VACANT);
            }
        }
    }
}

// Move Down
Piece.prototype.moveDown = function() {
    if (!this.collision(0, 1, this.activeTetromino)) {
        this.unDraw();
        this.y++;
        this.draw();
    } else {
        // We hit something! Lock the piece and generate a new one
        this.lock();
        p = randomPiece();
    }
}

// Move Right
Piece.prototype.moveRight = function() {
    if (!this.collision(1, 0, this.activeTetromino)) {
        this.unDraw();
        this.x++;
        this.draw();
    }
}

// Move Left
Piece.prototype.moveLeft = function() {
    if (!this.collision(-1, 0, this.activeTetromino)) {
        this.unDraw();
        this.x--;
        this.draw();
    }
}

// Rotate
Piece.prototype.rotate = function() {
    let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
    let kick = 0;
    
    if (this.collision(0, 0, nextPattern)) {
        // Wall kick: if rotation hits a wall, try moving left/right to fit
        if (this.x > COL/2) kick = -1; // Right wall
        else kick = 1; // Left wall
    }
    
    if (!this.collision(kick, 0, nextPattern)) {
        this.unDraw();
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length;
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();
    }
}

// Collision Detection
Piece.prototype.collision = function(x, y, piece) {
    for (let r = 0; r < piece.length; r++) {
        for (let c = 0; c < piece.length; c++) {
            // If the square is empty, skip it
            if (!piece[r][c]) continue;
            
            // Coordinates of the piece after movement
            let newX = this.x + c + x;
            let newY = this.y + r + y;
            
            // Conditions
            if (newX < 0 || newX >= COL || newY >= ROW) return true; // Walls/Floor
            if (newY < 0) continue; // Allow piece to be above board
            if (board[newY][newX] != VACANT) return true; // Hit another piece
        }
    }
    return false;
}

// Lock the piece into the board
Piece.prototype.lock = function() {
    for (let r = 0; r < this.activeTetromino.length; r++) {
        for (let c = 0; c < this.activeTetromino.length; c++) {
            if (!this.activeTetromino[r][c]) continue;
            if (this.y + r < 0) {
                // Game Over
                alert("Game Over");
                document.location.reload();
                break;
            }
            board[this.y + r][this.x + c] = this.color;
        }
    }
    // Remove full rows
    for (let r = 0; r < ROW; r++) {
        let isRowFull = true;
        for (let c = 0; c < COL; c++) {
            if (board[r][c] == VACANT) isRowFull = false;
        }
        if (isRowFull) {
            // Move all rows above this one down
            for (let y = r; y > 1; y--) {
                for (let c = 0; c < COL; c++) {
                    board[y][c] = board[y-1][c];
                }
            }
            for (let c = 0; c < COL; c++) board[0][c] = VACANT;
        }
    }
    drawBoard();
}

// --- GAME LOOP & CONTROLS ---

let p = randomPiece();
drawBoard();

// Drop the piece every 1 second
let dropStart = Date.now();
let isPaused = false;

function drop() {
    let now = Date.now();
    let delta = now - dropStart;
    if (delta > 1000 && !isPaused) {
        p.moveDown();
        dropStart = Date.now();
    }
    requestAnimationFrame(drop);
}
drop();

// Control the piece
document.addEventListener("keydown", CONTROL);
function CONTROL(event) {
    if (isPaused) return; // Disable controls when paused
    if (event.keyCode == 37) p.moveLeft();
    else if (event.keyCode == 38) p.rotate();
    else if (event.keyCode == 39) p.moveRight();
    else if (event.keyCode == 40) p.moveDown();
}

// Touch controls for the on-screen buttons
document.getElementById("btn-left").addEventListener("click", () => p.moveLeft());
document.getElementById("btn-right").addEventListener("click", () => p.moveRight());
document.getElementById("btn-up").addEventListener("click", () => p.rotate());
document.getElementById("btn-down").addEventListener("click", () => p.moveDown());
document.getElementById("btn-a").addEventListener("click", () => p.rotate());
document.getElementById("btn-b").addEventListener("click", () => p.moveDown());

// Pause Button (Start)
document.getElementById("btn-start").addEventListener("click", () => {
    isPaused = !isPaused;
    if (isPaused) {
        // Draw PAUSED text
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff";
        ctx.font = "20px monospace";
        ctx.fillText("PAUSED", 45, 70);
    } else {
        drawBoard(); // Redraw board to clear the text
        p.draw();
    }
});