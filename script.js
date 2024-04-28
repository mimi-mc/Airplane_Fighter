const canvas = document.getElementById("gameArea");
const ctx = canvas.getContext("2d");
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
let isGameOver = false;
let delay = 100;
let score = 0;
let noAsteroidsDestroyed = 0;
let noAsteroidsAvoided = 0;
let refreshScore;

//airplane
const planeWidth = 40;
const planeHeight = 50;
const planeSpeed = 20;
let planeX = canvasWidth / 2 - planeWidth / 2;
let planeY = canvasHeight - planeHeight - 5;

function drawAirplane() {
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.fillRect(planeX, planeY, planeWidth, planeHeight);
    ctx.closePath();
}

function clearScreen() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

clearScreen();

//start game
function startGame() {
    document.getElementById("startBtn").disabled = true;
    refreshScore = setInterval(countSeconds, 1000);
    updateGame();
}

//Game loop
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

//move the airplane and shoot
document.addEventListener('keydown', function(event) {
    if (!isGameOver) {
        if (event.key === 'ArrowLeft' && planeX > 0) {
            planeX -= planeSpeed;
        }
        if (event.key === 'ArrowRight' && planeX < canvasWidth - planeWidth) {
            planeX += planeSpeed;
        }
        if (event.key === " ") {
            spawnNewProjectiles();
        }
    }
});

//projectiles
let projectiles = [];
const projectileWidth = 5;
const projectileHeight = 20;
const projectileSpeed = 3;

function spawnNewProjectiles() {
    let projectileCoords = [planeX + (planeWidth / 2 - projectileWidth / 2), planeY];
    projectiles.push(projectileCoords);
}

function updateProjectiles() {
    for (let i = 0; i < projectiles.length; ++i) {
        projectiles[i][1] -= projectileSpeed;
        if (projectiles[i][1] < 0) {
            projectiles.splice(i, 1);
        }
        ctx.fillStyle = 'orange';
        if (projectiles.length >= 1) {
            ctx.fillRect(projectiles[i][0], projectiles[i][1], projectileWidth, projectileHeight);
        }
    }
}

//asteroids
let asteroids = [];
const asteroidWidth = 40;
const asteroidHeight = 40;

function spawnNewAsteroids() {
    for (let i = 0; i < 3; ++i) {
        let asteroidX = Math.floor(Math.random() * (canvasWidth - asteroidWidth));
        let asteroidY = -30;
        let asteroidSpeed = Math.floor(Math.random() * 2) + 1;
        let asteroidCoords = [asteroidX, asteroidY, asteroidSpeed];
        asteroids.push(asteroidCoords);
    }
}

function updateAsteroids() {
    for (let i = 0; i < asteroids.length; ++i) {
        asteroids[i][1] += asteroids[i][2];
        if (asteroids[i][1] >= canvasHeight) {
            ++noAsteroidsAvoided;
            asteroids.splice(i, 1);
        }
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.strokeRect(asteroids[i][0], asteroids[i][1], asteroidWidth, asteroidHeight);
        ctx.closePath();
    }
}

function delayAsteroidSpawning() {
    let randomNum = Math.floor(Math.random() * delay);
    if (randomNum % delay === 0) {
        spawnNewAsteroids();
        updateAsteroids();
    }
}

function checkForProjectileCollisions() {
    for (let i = 0; i < projectiles.length; ++i) {
        for (let j = 0; j < asteroids.length; ++j) {
            if (projectiles[i][0] < asteroids[j][0] + asteroidWidth &&
                projectiles[i][0] + projectileWidth > asteroids[j][0] &&
                projectiles[i][1] < asteroids[j][1] + asteroidHeight &&
                projectiles[i][1] + projectileHeight > asteroids[j][1]) {
                projectiles.splice(i, 1);
                asteroids.splice(j, 1);
                ++noAsteroidsDestroyed;
                break;
            }
        }
    }
}

function checkForGameOver() {
    for (let i = 0; i < asteroids.length; i++) {
        if (planeX < asteroids[i][0] + asteroidWidth &&
            planeX + planeWidth > asteroids[i][0] &&
            planeY < asteroids[i][1] + asteroidHeight &&
            planeY + planeHeight > asteroids[i][1]) {
            handleGameOver();
        }
    }
}

function handleGameOver() {
    isGameOver = true;
    clearInterval(refreshScore);
    cancelAnimationFrame(updateGame);
    ctx.fillStyle = "red";
    ctx.font = "bold italic 50px Courier New";
    ctx.fillText("GAME OVER", canvasWidth / 4, canvasHeight / 2);
    document.getElementById('resetGameButton').disabled = false;
}

function countSeconds() {
    ++score;
}

function resetGame() {
    isGameOver = false;
    score = 0;
    document.getElementById("startBtn").disabled = false;
    document.getElementById('resetGameButton').disabled = true;
    window.location.reload();
}
