const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const avatarsDir = path.join(__dirname, '../src/assets/avatars');

// Create avatars directory if it doesn't exist
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

// Colors for different avatars
const avatarColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5'
];

// Create 6 different avatar images
for (let i = 0; i < 6; i++) {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');
  
  // Fill background
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, 200, 200);
  
  // Draw avatar circle
  ctx.fillStyle = avatarColors[i];
  ctx.beginPath();
  ctx.arc(100, 100, 80, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw initial
  ctx.fillStyle = 'white';
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText((i + 1).toString(), 100, 100);
  
  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(avatarsDir, `avatar${i + 1}.png`), buffer);
}

console.log('Created 6 avatar images in src/assets/avatars/');
