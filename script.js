const canvas = document.getElementById("gameArea");
const ctx = canvas.getContext("2d");
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const asteroidStartYLocation = -30;
const THOUSAND = 1000;
let isGameOver = false;
let delay = 100;
let score = 0;
let noAsteroidsDestroyed = 0;
let noAsteroidsAvoided = 0;
let refreshScore;

// Load images
const airplaneImage = new Image();
airplaneImage.src = 'images/plane.png';

const asteroidImage = new Image();
asteroidImage.src = 'images/asteroid.png';

const explosionImage = new Image();
explosionImage.src = 'images/blast.png';

// Airplane
const planeWidth = 60;
const planeHeight = 42;
const planeSpeed = 20;
let planeX = canvasWidth / 2 - planeWidth / 2;
let planeY = canvasHeight - planeHeight - 5;

function drawAirplane() {
    ctx.drawImage(airplaneImage, planeX, planeY, planeWidth, planeHeight);
}

function clearScreen() {
    ctx.fillStyle = "MidnightBlue";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

clearScreen();

// Start game
function startGame() {
    document.getElementById("startBtn").disabled = true;
    refreshScore = setInterval(countSeconds, THOUSAND);
    updateGame();
}

// Projectile class
class Projectile {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }

    update() {
        this.y -= this.speed;
    }

    draw(ctx) {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    isOffScreen() {
        return this.y < 0;
    }
}

// Asteroid class
class Asteroid {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.radius = width / 2;
    }

    update() {
        this.y += this.speed;
    }

    draw(ctx) {
        ctx.drawImage(asteroidImage, this.x, this.y, this.width, this.height);
    }

    isOffScreen() {
        return this.y >= canvasHeight;
    }
}

// Game loop
function updateGame() {
    if (!isGameOver) {
        requestAnimationFrame(updateGame);
        clearScreen();
        drawAirplane();
        updateProjectiles();
        delayAsteroidSpawning();
        updateAsteroids();
        checkForGameOver();
        checkForProjectileCollisions();
        updateScores();
    }
}

function updateScores() {
    document.getElementById("score").innerText = score;
    document.getElementById("noAsteroidsDestroyed").innerText = noAsteroidsDestroyed;
    document.getElementById("noAvoidedAsteroids").innerText = noAsteroidsAvoided;
}

// Move the airplane and shoot
document.addEventListener("keydown", function(event) {
    if (!isGameOver) {
        if (event.key === "ArrowLeft" && planeX > 0) {
            planeX -= planeSpeed;
        }
        if (event.key === "ArrowRight" && planeX < canvasWidth - planeWidth) {
            planeX += planeSpeed;
        }
        if (event.key === " ") {
            spawnNewProjectiles();
        }
    }
});

// Projectiles
const projectiles = [];
const projectileWidth = 4;
const projectileHeight = 15;
const projectileSpeed = 3;

function spawnNewProjectiles() {
    let projectile = new Projectile(
        planeX + (planeWidth / 2 - projectileWidth / 2),
        planeY,
        projectileWidth,
        projectileHeight,
        projectileSpeed
    );
    projectiles.push(projectile);
}

function updateProjectiles() {
    for (let i = 0; i < projectiles.length; ++i) {
        projectiles[i].update();
        if (projectiles[i].isOffScreen()) {
            projectiles.splice(i, 1);
            --i;
        } else {
            projectiles[i].draw(ctx);
        }
    }
}

// Asteroids
const asteroids = [];
const asteroidWidth = 40;
const asteroidHeight = 40;
const asteroidRadius = asteroidWidth / 2;

function spawnNewAsteroids() {
    for (let i = 0; i < 3; ++i) {
        let asteroid = new Asteroid(
            Math.floor(Math.random() * (canvasWidth - asteroidWidth)),
            asteroidStartYLocation,
            asteroidWidth,
            asteroidHeight,
            Math.floor(Math.random() * 2) + 1
        );
        asteroids.push(asteroid);
    }
}

function updateAsteroids() {
    for (let i = 0; i < asteroids.length; ++i) {
        asteroids[i].update();
        if (asteroids[i].isOffScreen()) {
            ++noAsteroidsAvoided;
            asteroids.splice(i, 1);
            --i;
        } else {
            asteroids[i].draw(ctx);
        }
    }
}

function delayAsteroidSpawning() {
    let randomNum = Math.floor(Math.random() * delay);
    if (randomNum % delay === 0) {
        spawnNewAsteroids();
        updateAsteroids();
    }
}

function isColliding(circleX, circleY, circleRadius, rectX, rectY, rectWidth, 
    rectHeight) {
    let closestX = Math.max(rectX, Math.min(circleX, rectX + rectWidth));
    let closestY = Math.max(rectY, Math.min(circleY, rectY + rectHeight));

    let distanceX = circleX - closestX;
    let distanceY = circleY - closestY;

    let distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
    return distanceSquared < (circleRadius * circleRadius);
}

function checkForProjectileCollisions() {
    for (let i = 0; i < projectiles.length; ++i) {
        for (let j = 0; j < asteroids.length; ++j) {
            let cx = asteroids[j].x + asteroids[j].radius;
            let cy = asteroids[j].y + asteroids[j].radius;

            if (isColliding(cx, cy, asteroids[j].radius, projectiles[i].x, 
                projectiles[i].y, projectiles[i].width, projectiles[i].height)) {
                projectiles.splice(i, 1);
                asteroids.splice(j, 1);
                ++noAsteroidsDestroyed;
                --i;
                break;
            }
        }
    }
}

function checkForGameOver() {
    for (let i = 0; i < asteroids.length; ++i) {
        let cx = asteroids[i].x + asteroids[i].radius;
        let cy = asteroids[i].y + asteroids[i].radius;

        if (isColliding(cx, cy, asteroids[i].radius, planeX, planeY, 
            planeWidth, planeHeight)) {
            handleGameOver();
        }
    }
}

function handleGameOver() {
    isGameOver = true;
    clearInterval(refreshScore);
    cancelAnimationFrame(updateGame);
    const explosionWidth = 80;
    const explosionHeight = 80;
    const explosionX = planeX + planeWidth / 2 - explosionWidth / 2;
    const explosionY = planeY - explosionHeight / 2;
    ctx.drawImage(
        explosionImage, explosionX, explosionY, explosionWidth, explosionHeight
    );
    ctx.fillStyle = "red";
    ctx.font = "bold italic 50px Courier New";
    ctx.fillText("GAME OVER", canvasWidth / 4, canvasHeight / 2);
    document.getElementById("resetGameButton").disabled = false;
}

function countSeconds() {
    ++score;
}

function resetGame() {
    isGameOver = false;
    score = 0;
    document.getElementById("startBtn").disabled = false;
    document.getElementById("resetGameButton").disabled = true;
    window.location.reload();
}
