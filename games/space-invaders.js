class SpaceInvaders {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.width = 800;
        this.height = 600;
        this.playerWidth = 50;
        this.playerHeight = 30;
        this.bulletSize = 5;
        this.enemySize = 40;
        this.playerSpeed = 5;
        this.bulletSpeed = 7;
        this.enemySpeed = 2;
        this.enemyDrop = 20;
        this.enemyShootChance = 0.01;
        
        // Game objects
        this.player = {
            x: this.width / 2 - this.playerWidth / 2,
            y: this.height - this.playerHeight - 10
        };
        
        this.bullets = [];
        this.enemyBullets = [];
        this.enemies = [];
        this.score = 0;
        this.lives = 3;
        this.gameLoop = null;
        this.isRunning = false;
        this.isPaused = false;
        this.enemyDirection = 1;
        
        // Key states
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false
        };
    }

    init() {
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');
        
        // Clear game area and add canvas
        const gameArea = document.getElementById('gameArea');
        gameArea.innerHTML = '';
        gameArea.appendChild(this.canvas);
        
        // Add event listeners
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Initialize enemies
        this.createEnemies();
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.gameLoop = setInterval(() => this.update(), 1000 / 60);
        }
    }

    pause(isPaused) {
        this.isPaused = isPaused;
        if (isPaused) {
            clearInterval(this.gameLoop);
        } else {
            this.gameLoop = setInterval(() => this.update(), 1000 / 60);
        }
    }

    destroy() {
        clearInterval(this.gameLoop);
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
        document.removeEventListener('keyup', this.handleKeyUp.bind(this));
    }

    handleKeyDown(event) {
        if (this.keys.hasOwnProperty(event.key)) {
            this.keys[event.key] = true;
        }
        if (event.key === ' ') {
            this.shoot();
        }
    }

    handleKeyUp(event) {
        if (this.keys.hasOwnProperty(event.key)) {
            this.keys[event.key] = false;
        }
    }

    createEnemies() {
        const rows = 5;
        const cols = 10;
        const spacing = 60;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.enemies.push({
                    x: col * spacing + 100,
                    y: row * spacing + 50,
                    width: this.enemySize,
                    height: this.enemySize
                });
            }
        }
    }

    shoot() {
        if (this.bullets.length < 3) {
            this.bullets.push({
                x: this.player.x + this.playerWidth / 2 - this.bulletSize / 2,
                y: this.player.y,
                width: this.bulletSize,
                height: this.bulletSize
            });
        }
    }

    updatePlayer() {
        if (this.keys.ArrowLeft && this.player.x > 0) {
            this.player.x -= this.playerSpeed;
        }
        if (this.keys.ArrowRight && this.player.x < this.width - this.playerWidth) {
            this.player.x += this.playerSpeed;
        }
    }

    updateBullets() {
        // Update player bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].y -= this.bulletSpeed;
            
            // Remove bullets that go off screen
            if (this.bullets[i].y < 0) {
                this.bullets.splice(i, 1);
            }
        }
        
        // Update enemy bullets
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            this.enemyBullets[i].y += this.bulletSpeed;
            
            // Remove bullets that go off screen
            if (this.enemyBullets[i].y > this.height) {
                this.enemyBullets.splice(i, 1);
            }
        }
    }

    updateEnemies() {
        // Move enemies
        let needsToDrop = false;
        for (const enemy of this.enemies) {
            enemy.x += this.enemySpeed * this.enemyDirection;
            
            // Check if enemies need to drop down
            if (enemy.x + this.enemySize > this.width || enemy.x < 0) {
                needsToDrop = true;
            }
        }
        
        if (needsToDrop) {
            this.enemyDirection *= -1;
            for (const enemy of this.enemies) {
                enemy.y += this.enemyDrop;
            }
        }
        
        // Enemy shooting
        for (const enemy of this.enemies) {
            if (Math.random() < this.enemyShootChance) {
                this.enemyBullets.push({
                    x: enemy.x + this.enemySize / 2 - this.bulletSize / 2,
                    y: enemy.y + this.enemySize,
                    width: this.bulletSize,
                    height: this.bulletSize
                });
            }
        }
    }

    checkCollisions() {
        // Check player bullets hitting enemies
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                if (this.isColliding(this.bullets[i], this.enemies[j])) {
                    this.bullets.splice(i, 1);
                    this.enemies.splice(j, 1);
                    window.updateScore(100);
                    break;
                }
            }
        }
        
        // Check enemy bullets hitting player
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            if (this.isColliding(this.enemyBullets[i], this.player)) {
                this.enemyBullets.splice(i, 1);
                this.lives--;
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        }
        
        // Check if enemies reached bottom
        for (const enemy of this.enemies) {
            if (enemy.y + enemy.height > this.player.y) {
                this.gameOver();
            }
        }
    }

    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    update() {
        if (this.isPaused) return;
        
        this.updatePlayer();
        this.updateBullets();
        this.updateEnemies();
        this.checkCollisions();
        this.draw();
    }

    gameOver() {
        clearInterval(this.gameLoop);
        this.isRunning = false;
        alert(`Game Over! Score: ${document.getElementById('score').textContent}`);
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw player
        this.ctx.fillStyle = '#0f0';
        this.ctx.fillRect(this.player.x, this.player.y, this.playerWidth, this.playerHeight);
        
        // Draw bullets
        this.ctx.fillStyle = '#fff';
        for (const bullet of this.bullets) {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
        
        // Draw enemy bullets
        this.ctx.fillStyle = '#f00';
        for (const bullet of this.enemyBullets) {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
        
        // Draw enemies
        this.ctx.fillStyle = '#f0f';
        for (const enemy of this.enemies) {
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
        
        // Draw lives
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Lives: ${this.lives}`, 10, 30);
    }
} 