/* States */
let gameState = 'menu';
let score = 0;
let level = 1;

/* Game elements */
let player, character;
let fallingDots = [];
let dotInterval = 60;
let playerSpeed = 12;
let characterSpeed = 5;
let dotSpeed = 15;
let playerWidth = 100;

/* SVG images */
let logoSVG, drop;
let playerSVGs = null;
let playerSVGIndex = 0;

/* DOM elements */
let exitButton, scoreElement, logoElement;

/* Sound initialization */
let catchSound;
let soundInitialized = false;

/* Animation */
let dance;
let aniWalk, oilDrop;


function preload() {
  logoSVG = loadImage('assets/logo-08.svg');
  playerSVGs = [
    {
      name: 'pizza',
      img: loadImage('assets/pizza.svg'),
      width: 150,
    },
    {
      name: 'fish',
      img: loadImage('assets/fish.svg'),
      width: 100,
    },
    {
      name: 'fish',
      img: loadImage('assets/salad.svg'),
      width: 80,
    },
    {
      name: 'fish',
      img: loadImage('assets/cupcake.svg'),
      width: 40,
    },
  ]
  drop = loadImage('assets/drop-05.svg');
  catchSound = loadSound('coin.wav');  // Load the sound for catching dots

  aniWalk = loadAnimation(
    'sprite/dance-09.png',
    'sprite/dance-10.png',
    'sprite/dance-11.png',
    'sprite/dance-12.png',
    'sprite/dance-13.png',
    'sprite/dance-14.png',
    'sprite/dance-15.png',
    'sprite/dance-16.png',
    'sprite/dance-17.png',
    'sprite/dance-18.png',
    'sprite/dance-19.png',
    'sprite/dance-20.png',
  );
  aniWalk.frameDelay = 5;
  oilDrop = loadAnimation(
      'sprite/oilDrop-21.png',
      'sprite/oilDrop-21.png',
      'sprite/oilDrop-22.png',
      'sprite/oilDrop-22.png',
      'sprite/oilDrop-23.png',
      'sprite/oilDrop-23.png',
  );
  aniWalk.frameDelay = 5;
}

function setup() {
  createCanvas(windowWidth, windowHeight-60);
  pixelDensity(1);
  frameRate(30);
  player = new Player(playerSVGs[playerSVGIndex]);
  exitButton = document.getElementById('exit-button');
  scoreElement = document.getElementById('score');
  logoElement = document.getElementById('logo');
  exitButton.addEventListener('click', returnToMenu);
  document.body.addEventListener('touchstart', () => {});

  dance = createSprite(width / 2 + 50, 100);
  dance.scale = 0.15;
  dance.addAnimation('dance', aniWalk);
  dance.addAnimation('dropOil', oilDrop);

  character = new Character();
}

function returnToMenu() {
  gameState = 'menu';
  resetGame();
}

function draw() {
  if (gameState === 'menu') {
    exitButton.style.display = 'none';
    scoreElement.style.display = 'none';
    logoElement.style.display = 'none';
    displayMenu();
  } else if (gameState === 'play') {
    exitButton.style.display = 'block';
    scoreElement.style.display = 'block';
    logoElement.style.display = 'block';
    playGame();
  }
}
function displayMenu() {
  background('#81AA7D');
  imageMode(CENTER);
  
  // Calculate floating effect with sin() for smooth oscillation
  let floatOffset = sin(millis() / 150) * 10;

  image(logoSVG, width / 2, height / 2 - 50 + floatOffset);
  textSize(20);
  fill(255);
  textAlign(CENTER, CENTER);
  text('Press Enter to Start', width / 2, height / 2 + 100);
}

function keyPressed() {
  if (gameState === 'menu' && keyCode === ENTER) {
    gameState = 'play';
  }
}

function resetGame() {
  score = 0;
  level = 1;
  fallingDots = [];
  playerSpeed = 12;
  characterSpeed = 5;
  dotSpeed = 15;
  scoreElement.children[1].innerHTML = score;
  player.x = width / 2 - player.width / 2;
  playerSVGIndex = 0;
  player.updateImg(playerSVGs[playerSVGIndex]);
}

function playGame() {
  background('#81AA7D');

  character.move();
  character.display();

  // Make the character drop dots at intervals
  const rand = Math.round(Math.random()*500);
  if (rand < 20 + level) {
    character.dropDot();
  }

  
  // Update and display all falling dots
  for (let i = fallingDots.length - 1; i >= 0; i--) {
    fallingDots[i].update();
    fallingDots[i].display();
    
    // Check if dot is caught by the player
    if (fallingDots[i].hits(player)) {
      score++;
      catchSound.play();
      scoreElement.children[1].innerHTML = score;
      fallingDots.splice(i, 1); // Remove dot if caught

      if (score > 0 && score % 10 === 0) {
        nextLevel();
      }
    }
    
    // game over
    if (fallingDots[i] && fallingDots[i].y > height) {
      gameState = 'menu';
      resetGame();
    }
  }
  
  // Update and display player
  player.update();
  player.display();

  drawSprites();
}

function nextLevel() {
  level++;
  playerSVGIndex = playerSVGIndex < 3 ? playerSVGIndex + 1 : 3;
  dotInterval = max(10, dotInterval - 5); // Minimum interval of 10 frames
  player.updateImg(playerSVGs[playerSVGIndex]);
  dotSpeed += 0.5; // Dots fall faster
  playerSpeed += 0.5; // Player moves faster
  characterSpeed += 0.5;
}

function touchStarted() {
  if (gameState === 'menu') {
    gameState = 'play'; // Start the game
    if (!soundInitialized) {
      // Initialize all sounds on the first touch
      catchSound.play();
    }
  }
}

function touchMoved() {
  if (gameState === 'play') {
    // Move the player to follow the touch position
    player.x = mouseX - player.width / 2;

    // Keep the player within canvas bounds
    player.x = constrain(player.x, 0, width - player.width);
  }

  // Prevent default browser behavior
  return false;
}


class Player {
  constructor(svg) {
    console.log(svg);
    this.x = width / 2;
    this.y = height - 80;
    this.width = svg.width;
    this.height = 50;
    this.speed = playerSpeed;
    this.svg = svg.img;
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
  }
  
  display() {
    // rect(this.x, this.y, this.width, this.height);
    image(this.svg, this.x, this.y, this.width, this.height);
  }


  updateImg(newImg) {
    this.svg = newImg.img;
    this.width = newImg.width;
  }
}

class Character {
  constructor() {
    this.y = 100;
    this.width = 100;
    this.height = 100;
    this.moveDirection = 1; // 1 means right, -1 means left
    this.changeDirectionInterval = 40;
    this.frameCount = 0;
  }

  move() {
    // this.x += characterSpeed * this.moveDirection;
    dance.position.x += characterSpeed * this.moveDirection;

    // Change direction randomly every 'changeDirectionInterval' frames
    this.frameCount++;
    if (this.frameCount % this.changeDirectionInterval === 0) {
      this.moveDirection *= random() > 0.5 ? 1 : -1;
    }

    // Keep character within screen bounds
    if (dance.position.x - this.width/2 < 0 || dance.position.x > width - this.width) {
      this.moveDirection *= -1;  // Reverse direction when hitting edge
    }
  }

  dropDot() {
    dance.changeAnimation('dropOil');
    fallingDots.push(new Dot(drop, dance.position.x - 10, this.y + this.height / 2));
    setTimeout(() => {
      dance.changeAnimation('dance');
    }, 200);
  }

  display() {}
}


class Dot {
  constructor(svg, x,y) {
    this.x = x; // Start at the character’s x position
    this.y = y; // Start at the bottom of the character
    this.r = 6;
    this.speed = dotSpeed;
    this.svg = svg;
  }
  
  update() {
    this.y += this.speed;
  }
  
  display() {
    image(this.svg, this.x, this.y, this.r*2, 20);
  }
  
  hits(player) {
    return (this.y + this.r > player.y &&
      this.y - this.r < player.y + player.height &&
      this.x > player.x &&
      this.x < player.x + player.width);
  }
}

(() => {
  console.log('yoyo');
})();
