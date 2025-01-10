let player;
let fallingDots = [];
let dotInterval = 60; // Time between dots (frames)
let score = 0;
let level = 1;
let playerWidth = 100;
let playerSpeed = 12;
let dotSpeed = 2;
let mySVG;
let gameState = "menu"; // New variable to track the game state
let menuSVG; // Add this line at the top with other global variables
let floatOffset = 0; // Variable to control the float effect
let catchSound, bgMusic;
let lives = 3; // Start with 3 lives
let exitButton;
let soundInitialized = false;


function preload() {
  mySVG = loadImage('character.svg');  // Load the SVG file
  menuSVG = loadImage('logo-08.svg'); // Load the menu SVG image
  catchSound = loadSound('coin.wav');  // Load the sound for catching dots
  // bgMusic = loadSound('game.mp3');        // Load background music
  // testSound = loadSound('test-sound.mp3', 
  //   () => logMessage('Sound loaded successfully!'),
  //   (err) => logMessage('Error loading sound:', err)
  // );
  testSound = new Howl({
    src: ['test-sound.mp3'], // Provide the path to your audio file
    loop: false,            // Enable looping
    volume: 0.5            // Adjust volume (0 to 1)
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  console.log('setup!');
  player = new Player();
  character = new Character(mySVG);  // Create the character with the SVG image
    // Get the Exit button element
  exitButton = document.getElementById('exit-button');
  
  // Attach a click event listener to return to the menu
  exitButton.addEventListener('click', returnToMenu);

    soundButton = document.getElementById('sound');
  
  // Attach a click event listener to return to the menu
  soundButton.addEventListener('click', playSound);

  document.body.addEventListener('touchstart', () => {
  if (Howler.ctx.state === 'suspended') {
    Howler.ctx.resume().then(() => {
      console.log('Audio context resumed');
      logMessage('Audio context resumed');
    });
  }
});
}
function playSound() {
  logMessage('test !!!!');
  // Example usage
  try {
    testSound.play();
    logMessage('after play !!!!');
  } catch (e) {
    logMessage(e);
  }

}

function returnToMenu() {
  gameState = "menu"; // Change back to menu state
  resetGame();        // Reset game variables
}

function draw() {
  if (gameState === "menu") {
    exitButton.style.display = "none"; // Hide button on menu screen
    displayMenu(); // Show the menu if the game is in "menu" state
  } else if (gameState === "play") {
    exitButton.style.display = "block"; // Show button during gameplay
    playGame(); // Run the game loop if the game state is "play"
  }
}
function displayMenu() {
  background('#81AA7D');
  imageMode(CENTER);
  
  // Calculate floating effect with sin() for smooth oscillation
  floatOffset = sin(millis() / 150) * 10; // Adjust 500 for speed and 10 for amplitude

  // Display the menu SVG image with the floating effect
  image(menuSVG, width / 2, height / 2 - 50 + floatOffset);
  
  // Display text under the image
  textSize(20);
  fill(255);
  textAlign(CENTER, CENTER);
  text("Press Enter to Start", width / 2, height / 2 + 100);
}

function keyPressed() {
  if (gameState === "menu" && keyCode === ENTER) {
    gameState = "play"; // Start the game when Enter is pressed
    // bgMusic.loop();  // Start background music in a loop
  }
}

function resetGame() {
  score = 0;
  level = 1;
  lives = 3;
  fallingDots = [];
  playerWidth = 100;
  playerSpeed = 12;
  dotSpeed = 2;
  // bgMusic.stop();
}

function playGame() {
  background('#81AA7D');
  
  // Draw scoreboard
  textSize(16);
  fill(0);
  text('Score: ' + score, 50, 20);
  text('Level: ' + level, 50, 40);
  text('Lives: ' + lives, 10, 60); // Display lives on the screen
  
  // Move and display the character
  character.move();
  character.display();

  // Make the character drop dots at intervals
  if (frameCount % (Math,min(10, 30-level)+Math.round(Math.random()*100)) === 0) {  // Drop a dot every 30 frames
    character.dropDot();
  }

  
  // Update and display all falling dots
  for (let i = fallingDots.length - 1; i >= 0; i--) {
    fallingDots[i].update();
    fallingDots[i].display();
    
    // Check if dot is caught by the player
    if (fallingDots[i].hits(player)) {
      score++;
      catchSound.play();  // Play sound when a dot is caught
      document.getElementById('top').innerHTML = score;
      fallingDots.splice(i, 1); // Remove dot if caught
      // Check for level progression
      if (score > 0 && score % 10 === 0) {
        nextLevel();
      }
    }
    
    // Remove dot if it falls below the screen
    if (fallingDots[i] && fallingDots[i].y > height) {
      fallingDots.splice(i, 1);
      lives--;                 // Decrease lives

      if (lives <= 0) {
        gameState = "menu";     // Return to menu if lives reach 0
        resetGame();            // Reset the game state
      }
    }
  }
  
  // Update and display player
  player.update();
  player.display();
}

function nextLevel() {
  level++;
  dotInterval = max(10, dotInterval - 5); // Minimum interval of 10 frames
  playerWidth = max(40, playerWidth - 10);
  dotSpeed += 0.5; // Dots fall faster
  playerSpeed += 0.5; // Player moves faster
}

function touchStarted() {
  if (gameState === "menu") {
    gameState = "play"; // Start the game
    if (!soundInitialized) {
      // Initialize all sounds on the first touch
    catchSound.play();
    }
  }
}

function touchMoved() {
  if (gameState === "play") {
    // Move the player to follow the touch position
    player.x = mouseX - player.width / 2;

    // Keep the player within canvas bounds
    player.x = constrain(player.x, 0, width - player.width);
  }

  // Prevent default browser behavior
  return false;
}


class Player {
  constructor() {
    this.x = width / 2 - playerWidth / 2;
    this.y = height - 200;
    this.width = playerWidth;
    this.height = 20;
    this.speed = playerSpeed;
  }
  
  update() {
    // Move left and right with arrow keys
    if (keyIsDown(LEFT_ARROW)) {
      this.x -= this.speed;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      this.x += this.speed;
    }
    
    // Keep player within canvas bounds
    this.x = constrain(this.x, 0, width - this.width);
    
        // Update player width dynamically based on global playerWidth
    this.width = playerWidth; // Update width dynamically in every frame
  }
  
  display() {
    fill(0);
    rect(this.x, this.y, this.width, this.height);
  }
}

class Character {
  constructor(svgImage) {
    this.x = windowWidth / 2; // Start at a random x position
    this.y = 50;            // Fixed y position near the top
    this.width = 100;
    this.height = 100;
    this.svg = svgImage;     // SVG image
    this.speed = 2;
    this.moveDirection = 1;  // 1 means right, -1 means left
    this.changeDirectionInterval = 60; // Change direction every 60 frames
    this.frameCount = 0;
  }

  move() {
    this.x += this.speed * this.moveDirection;

    // Change direction randomly every 'changeDirectionInterval' frames
    this.frameCount++;
    if (this.frameCount % this.changeDirectionInterval === 0) {
      this.moveDirection *= random() > 0.5 ? 1 : -1;
    }

    // Keep character within screen bounds
    if (this.x < 0 || this.x > width - this.width) {
      this.moveDirection *= -1;  // Reverse direction when hitting edge
    }
  }

  dropDot() {
    // Drop a dot from the character’s current position
    fallingDots.push(new Dot(this.x + this.width / 2, this.y + this.height / 2));
  }

  display() {
    // Display the character (the SVG image)
    image(this.svg, this.x, this.y, this.width, this.height);
  }
}


class Dot {
  constructor(x,y) {
    this.x = x; // Start at the character’s x position
    this.y = y; // Start at the bottom of the character
    this.r = 8;
    this.speed = dotSpeed;
  }
  
  update() {
    this.y += this.speed;
  }
  
  display() {
    fill(0, 0, 0);
    ellipse(this.x, this.y, this.r * 2);
  }
  
  hits(player) {
    return (this.y + this.r > player.y && 
            this.x > player.x && 
            this.x < player.x + player.width);
  }
}

function logMessage(message) {
  const logDiv = document.getElementById('debugLog') || createLogDiv();
  logDiv.innerHTML += `<p>${message}</p>`;
}

function createLogDiv() {
  const div = document.createElement('div');
  div.id = 'debugLog';
  div.style.position = 'absolute';
  div.style.top = '200px';
  div.style.width = '100%';
  div.style.color = 'black';
  div.style.fontSize = '12px';
  div.style.overflowY = 'scroll';
  div.style.zIndex = '1000';
  document.body.appendChild(div);
  return div;
}


(() => {
  console.log('yoyo');
})();
