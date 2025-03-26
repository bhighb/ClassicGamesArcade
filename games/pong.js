class Pong {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.width = 800;
        this.height = 400;
        this.paddleHeight = 100;
        this.paddleWidth = 20;
        this.ballSize = 10;
        this.paddleSpeed = 5;
        this.ballSpeed = 5;
        this.maxScore = 5;
        
        // Game objects
        this.leftPaddle = {
            y: this.height / 2 - this.paddleHeight / 2,
            score: 0
        };
        
        this.rightPaddle = {
            y: this.height / 2 - this.paddleHeight / 2,
            score: 0
        };
        
        this.ball = {
            x: this.width / 2,
            y: this.height / 2,
            dx: this.ballSpeed * (Math.random() > 0.5 ? 1 : -1),
            dy: this.ballSpeed * (Math.random() > 0.5 ? 1 : -1)
        };
        
        this.gameLoop = null;
        this.isRunning = false;
        this.isPaused = false;
        
        // Key states
        this.keys = {
            w: false,
            s: false,
            ArrowUp: false,
            ArrowDown: false
        };
    }

    init() {
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Clear game area and add canvas
        const gameArea = document.getElementById('gameArea');
        gameArea.innerHTML = '';
        gameArea.appendChild(this.canvas);
        
        // Set initial size
        this.handleResize();
        
        // Add event listeners
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Reset game state
        this.resetGame();
    }

    handleResize() {
        const gameArea = document.getElementById('gameArea');
        const aspectRatio = 2; // Width is 2x height
        
        // Calculate dimensions to fit game area
        this.height = Math.min(
            gameArea.clientHeight,
            gameArea.clientWidth / aspectRatio
        );
        this.width = this.height * aspectRatio;
        
        // Scale game elements proportionally
        this.paddleHeight = this.height / 4;
        this.paddleWidth = this.width / 40;
        this.ballSize = this.width / 80;
        this.paddleSpeed = this.height / 80;
        this.ballSpeed = this.width / 160;
        
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        if (this.isRunning) {
            this.draw();
        }
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

    resetGame() {
        this.ball.x = this.width / 2;
        this.ball.y = this.height / 2;
        this.ball.dx = this.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
        this.ball.dy = this.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
        this.leftPaddle.score = 0;
        this.rightPaddle.score = 0;
        document.getElementById('score').textContent = '0';
    }

    updatePaddles() {
        // Left paddle (W/S keys)
        if (this.keys.w && this.leftPaddle.y > 0) {
            this.leftPaddle.y -= this.paddleSpeed;
        }
        if (this.keys.s && this.leftPaddle.y < this.height - this.paddleHeight) {
            this.leftPaddle.y += this.paddleSpeed;
        }
        
        // Right paddle (Arrow Up/Down)
        if (this.keys.ArrowUp && this.rightPaddle.y > 0) {
            this.rightPaddle.y -= this.paddleSpeed;
        }
        if (this.keys.ArrowDown && this.rightPaddle.y < this.height - this.paddleHeight) {
            this.rightPaddle.y += this.paddleSpeed;
        }
    }

    updateBall() {
        // Move ball
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        // Ball collision with top and bottom
        if (this.ball.y <= 0 || this.ball.y >= this.height) {
            this.ball.dy *= -1;
        }
        
        // Ball collision with paddles
        if (this.ball.x <= this.paddleWidth && 
            this.ball.y >= this.leftPaddle.y && 
            this.ball.y <= this.leftPaddle.y + this.paddleHeight) {
            this.ball.dx *= -1;
            this.ball.x = this.paddleWidth;
        }
        
        if (this.ball.x >= this.width - this.paddleWidth - this.ballSize && 
            this.ball.y >= this.rightPaddle.y && 
            this.ball.y <= this.rightPaddle.y + this.paddleHeight) {
            this.ball.dx *= -1;
            this.ball.x = this.width - this.paddleWidth - this.ballSize;
        }
        
        // Score points
        if (this.ball.x <= 0) {
            this.rightPaddle.score++;
            this.resetBall();
        } else if (this.ball.x >= this.width - this.ballSize) {
            this.leftPaddle.score++;
            this.resetBall();
        }
        
        // Check for game over
        if (this.leftPaddle.score >= this.maxScore || this.rightPaddle.score >= this.maxScore) {
            this.gameOver();
        }
    }

    resetBall() {
        this.ball.x = this.width / 2;
        this.ball.y = this.height / 2;
        this.ball.dx = this.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
        this.ball.dy = this.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
    }

    update() {
        if (this.isPaused) return;
        
        this.updatePaddles();
        this.updateBall();
        this.draw();
    }

    gameOver() {
        clearInterval(this.gameLoop);
        this.isRunning = false;
        const winner = this.leftPaddle.score >= this.maxScore ? 'Player 1' : 'Player 2';
        alert(`Game Over! ${winner} wins!`);
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw paddles
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, this.leftPaddle.y, this.paddleWidth, this.paddleHeight);
        this.ctx.fillRect(this.width - this.paddleWidth, this.rightPaddle.y, this.paddleWidth, this.paddleHeight);
        
        // Draw ball
        this.ctx.fillRect(this.ball.x, this.ball.y, this.ballSize, this.ballSize);
        
        // Draw center line
        this.ctx.setLineDash([5, 15]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.width / 2, 0);
        this.ctx.lineTo(this.width / 2, this.height);
        this.ctx.strokeStyle = '#fff';
        this.ctx.stroke();
        
        // Draw scores
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.leftPaddle.score, this.width / 4, 50);
        this.ctx.fillText(this.rightPaddle.score, 3 * this.width / 4, 50);
    }
}
