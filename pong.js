// 1. Get the screen (canvas) from the HTML
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 2. Clear the screen with the classic green color
ctx.fillStyle = '#9bbc0f'; 
ctx.fillRect(0, 0, canvas.width, canvas.height);

// 3. Draw the Title
ctx.fillStyle = '#0f380f'; // Dark green for text
ctx.font = '20px monospace';
ctx.fillText('PONG LOADED', 20, 70);