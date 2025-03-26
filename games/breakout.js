class Breakout {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.width = 800;
        this.height = 600;
        this.paddleHeight = 20;
        this.paddleWidth = 100;
        this.ballSize = 10;
        this.brickHeight = 20;
        this.brickPadding = 10;
        this.ballSpeed = 5;
        this.paddleSpeed = 7;
        
        // Game objects
        this.paddle = {
            x: this.width / 2 - this.paddleWidth / 2,
            y: this.height - this.paddleHeight - 10
        };
        
        this.ball = {
            x: this.width / 2,
            y: this.height - this.paddleHeight - this.ballSize - 10,
            dx: this.ballSpeed * (Math.random() > 0.5 ? 1 : -1),
            dy: -this.ballSpeed
        };
        
        this.bricks = [];
        this.score = 0;
        this.lives = 3;
        this.gameLoop = null;
        this.isRunning = false;
        this.isPaused = false;
        
        // Brick colors
        this.brickColors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#8f00ff'];
        
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
        
        // Create bricks
        this.createBricks();
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
    }

    handleKeyUp(event) {
        if (this.keys.hasOwnProperty(event.key)) {
            this.keys[event.key] = false;
        }
    }

    createBricks() {
        const brickWidth = (this.width - (this.brickPadding * 8)) / 8;
        
        for (let row = 0; row < 7; row++) {
            for (let col = 0; col < 8; col++) {
                this.bricks.push({
                    x: col * (brickWidth + this.brickPadding) + this.brickPadding,
                    y: row * (this.brickHeight + this.brickPadding) + this.brickPadding + 50,
                    width: brickWidth,
                    height: this.brickHeight,
                    color: this.brickColors[row],
                    active: true
                });
            }
        }
    }

    updatePaddle() {
        if (this.keys.ArrowLeft && this.paddle.x > 0) {
            this.paddle.x -= this.paddleSpeed;
        }
        if (this.keys.ArrowRight && this.paddle.x < this.width - this.paddleWidth) {
            this.paddle.x += this.paddleSpeed;
        }
    }

    updateBall() {
        // Move ball
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        // Ball collision with walls
        if (this.ball.x <= 0 || this.ball.x >= this.width - this.ballSize) {
            this.ball.dx *= -1;
        }
        
        // Ball collision with ceiling
        if (this.ball.y <= 0) {
            this.ball.dy *= -1;
        }
        
        // Ball collision with paddle
        if (this.ball.y >= this.paddle.y - this.ballSize &&
            this.ball.x >= this.paddle.x &&
            this.ball.x <= this.paddle.x + this.paddleWidth) {
            this.ball.dy *= -1;
            this.ball.y = this.paddle.y - this.ballSize;
            
            // Add some randomness to the ball direction
            const hitPosition = (this.ball.x - this.paddle.x) / this.paddleWidth;
            this.ball.dx = this.ballSpeed * (hitPosition - 0.5) * 2;
        }
        
        // Ball collision with bricks
        for (let i = this.bricks.length - 1; i >= 0; i--) {
            const brick = this.bricks[i];
            if (brick.active && this.isColliding(this.ball, brick)) {
                brick.active = false;
                this.ball.dy *= -1;
                window.updateScore(10);
                
                // Check if all bricks are destroyed
                if (this.bricks.every(b => !b.active)) {
                    this.gameOver(true);
                }
            }
        }
        
        // Ball out of bounds
        if (this.ball.y >= this.height) {
            this.lives--;
            if (this.lives <= 0) {
                this.gameOver(false);
            } else {
                this.resetBall();
            }
        }
    }

    resetBall() {
        this.ball.x = this.width / 2;
        this.ball.y = this.height - this.paddleHeight - this.ballSize - 10;
        this.ball.dx = this.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
        this.ball.dy = -this.ballSpeed;
    }

    isColliding(ball, brick) {
        return ball.x < brick.x + brick.width &&
               ball.x + this.ballSize > brick.x &&
               ball.y < brick.y + brick.height &&
               ball.y + this.ballSize > brick.y;
    }

    update() {
        if (this.isPaused) return;
        
        this.updatePaddle();
        this.updateBall();
        this.draw();
    }

    gameOver(won) {
        clearInterval(this.gameLoop);
        this.isRunning = false;
        alert(won ? 
            `Congratulations! You won! Score: ${document.getElementById('score').textContent}` :
            `Game Over! Score: ${document.getElementById('score').textContent}`
        );
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw bricks
        for (const brick of this.bricks) {
            if (brick.active) {
                this.ctx.fillStyle = brick.color;
                this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            }
        }
        
        // Draw paddle
        this.ctx.fillStyle = '#0f0';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddleWidth, this.paddleHeight);
        
        // Draw ball
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(
            this.ball.x + this.ballSize / 2,
            this.ball.y + this.ballSize / 2,
            this.ballSize / 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // Draw lives
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Lives: ${this.lives}`, 10, 30);
    }
} 