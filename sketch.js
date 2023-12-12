let player;
let obstacles = [];
let bullets = [];
let acceleration = 5;
let deceleration = 5;
let maxSpeed = 10;
let bulletSpeed = 20;
let score = 0;
let startTime;
let gameStarted = false;
let gameOver = false;
let gameOverTime;
let halofont;
let backgroundImage;
let playerImage;
let obstacleImage;
let gameMusic;

function preload() {
  // Halo font load
  halofont = loadFont("Halo.ttf");
  // Load background
  backgroundImage = loadImage("halo ring.JPG");
  // Load player
  playerImage = loadImage("pelican.png");
  // Load phantoms
  obstacleImage = loadImage("phantom.png");
  // Load game music
  gameMusic = loadSound("Kazoo.mp3");
}

function setup() {
  createCanvas(800, 600);
  player = new Car(width / 2, height - 50);
  startTime = millis(); // Record the start time
}

function draw() {
  image(backgroundImage, 0, 0, width, height);

  if (!gameStarted) {
    startScreen();
  } else if (!gameOver) {
    gameplay();
  } else {
    gameOverScreen();
  }
}

function keyPressed() {
  if (!gameStarted) {
    gameStarted = true;
    startTime = millis(); // Record the start time
    gameMusic.loop(); // Start playing and looping the game music
  } else if (gameOver) {
    resetGame();
    gameStarted = false;
    gameMusic.stop(); // Stop the game music
  } else {
    if (keyCode === LEFT_ARROW) {
      player.accelerateX(-acceleration);
    } else if (keyCode === RIGHT_ARROW) {
      player.accelerateX(acceleration);
    } else if (keyCode === UP_ARROW) {
      player.accelerateY(-acceleration);
    } else if (keyCode === DOWN_ARROW) {
      player.accelerateY(acceleration);
    } else if (key === " ") {
      // Spacebar to shoot bullets
      let bullet = new Bullet(player.x + player.width / 2, player.y);
      bullets.push(bullet);
    }
  }
}

function keyReleased() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    player.decelerateX(deceleration);
  } else if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
    player.decelerateY(deceleration);
  }
}

function resetGame() {
  player = new Car(width / 2, height - 50);
  obstacles = [];
  bullets = [];
  score = 0;
  gameOver = false;
}

function showScore() {
  textSize(35);
  fill(80,175,42);
  text("Time Alive: " + score, width - 150, 20);
}

function updateScore() {
  let elapsedTime = millis() - startTime;
  score = floor(elapsedTime / 1000); // Increase the score every second
}

function gameplay() {
  // Generate obstacles randomly
  if (random(1) < 0.05) {
    let obstacleX = random(width); // Any x-coordinate across the screen
    let obstacleY = -30; // Start above the canvas
    let newObstacle = new Obstacle(obstacleX, obstacleY);

    // Check if the new obstacle overlaps with existing obstacles
    while (obstacles.some(obstacle => newObstacle.hits(obstacle))) {
      obstacleX = random(width);
      newObstacle = new Obstacle(obstacleX, obstacleY);
    }

    obstacles.push(newObstacle);
  }

  // Update and display obstacles
  for (let obstacle of obstacles) {
    obstacle.update();
    obstacle.show();

    // Check for collisions with player
    if (player.hits(obstacle)) {
      console.log("Game over!");
      gameOver = true;
      gameOverTime = millis(); // Record the time when the game over occurred
    }
  }

  // Remove obstacles that have gone off the screen
  obstacles = obstacles.filter(obstacle => !obstacle.offscreen());

  // Update and display the player
  player.update();
  player.show();

  // Update and display bullets
  for (let bullet of bullets) {
    bullet.update();
    bullet.show();

    // Check for collisions with obstacles
    for (let obstacle of obstacles) {
      if (bullet.hits(obstacle)) {
        bullets.splice(bullets.indexOf(bullet), 1);
        obstacles.splice(obstacles.indexOf(obstacle), 1);
        score++;
      }
    }
  }

  // Remove bullets that have gone off the screen
  bullets = bullets.filter(bullet => !bullet.offscreen());

  // Update score based on time passed
  updateScore();

  // Display score
  showScore();
}

function startScreen() {
  textSize(50);
  fill(80,175,42);
  textAlign(CENTER, CENTER);
  textFont(halofont);
  text("Finish The Fight", width / 2, height / 2);
  text("Press Any Key to", width / 2, height / 2.5);
}

function gameOverScreen() {
  textSize(75);
  fill(80,175,42);
  textAlign(CENTER, CENTER);
  text("Game Over", width / 2, height / 2 - 30);
  text("Time Alive: " + score, width / 2, height / 2 + 30);

  // Check if enough time has passed since game over
  let elapsedGameOverTime = millis() - gameOverTime;
  if (elapsedGameOverTime > 100000) {
    resetGame();
  }
}

class Car {
  constructor(x, y) {
    this.width = 80;
    this.height = 110;
    this.x = x - this.width / 2;
    this.y = y - this.height / 2;
    this.velocityX = 0;
    this.velocityY = 0;
  }

  hits(obstacle) {
    return (
      this.x < obstacle.x + obstacle.width &&
      this.x + this.width > obstacle.x &&
      this.y < obstacle.y + obstacle.height &&
      this.y + this.height > obstacle.y
    );
  }

  update() {
    this.x += this.velocityX;
    this.y += this.velocityY;

    this.x = constrain(this.x, 0, width - this.width); // stay within the canvas
    this.y = constrain(this.y, 0, height - this.height);

    this.velocityX = constrain(this.velocityX, -maxSpeed, maxSpeed);
    this.velocityY = constrain(this.velocityY, -maxSpeed, maxSpeed);
  }

  show() {
    image(playerImage, this.x, this.y, this.width, this.height);
  }

  accelerateX(amount) {
    this.velocityX += amount;
  }

  accelerateY(amount) {
    this.velocityY += amount;
  }

  decelerateX(amount) {
    if (this.velocityX > 0) {
      this.velocityX -= amount;
    } else if (this.velocityX < 0) {
      this.velocityX += amount;
    }
  }

  decelerateY(amount) {
    if (this.velocityY > 0) {
      this.velocityY -= amount;
    } else if (this.velocityY < 0) {
      this.velocityY += amount;
    }
  }
}

class Obstacle {
  constructor(x, y) {
    this.width = 60;  // width
    this.height = 80; // height
    this.x = x - this.width / 2;
    this.y = y - this.height / 2;
    this.speed = 5;
  }

  offscreen() {
    return this.y > height;
  }

  update() {
    this.y += this.speed;
  }

  show() {
    // Draw obstacle image
    image(obstacleImage, this.x, this.y, this.width, this.height);
  }

  hits(other) {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }
}

class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 10;
    this.speed = bulletSpeed;
  }

  show() {
    fill(255);
    ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
  }

  update() {
    this.y -= this.speed;
  }

  offscreen() {
    return this.y < 0;
  }

  hits(other) {
    let d = dist(this.x, this.y, other.x + other.width / 2, other.y + other.height / 2);
    return d < this.radius + other.width / 2;
  }
}
