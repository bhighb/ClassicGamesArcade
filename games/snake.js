class Snake {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gridSize = 20;
        this.snake = [];
        this.food = null;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.gameLoop = null;
        this.isRunning = false;
        this.isPaused = false;
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
        
        // Initialize snake
        this.snake = [
            { x: 3, y: 1 },
            { x: 2, y: 1 },
            { x: 1, y: 1 }
        ];
        
        // Generate first food
        this.generateFood();
        
        // Add event listeners
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
    }

    handleResize() {
        const gameArea = document.getElementById('gameArea');
        const size = Math.min(
            gameArea.clientWidth,
            gameArea.clientHeight
        );
        
        this.canvas.width = size;
        this.canvas.height = size;
        this.gridSize = Math.max(10, Math.floor(size / 20));
        
        if (this.isRunning) {
            this.draw();
        }
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.gameLoop = setInterval(() => this.update(), 150);
        }
    }

    pause(isPaused) {
        this.isPaused = isPaused;
        if (isPaused) {
            clearInterval(this.gameLoop);
        } else {
            this.gameLoop = setInterval(() => this.update(), 150);
        }
    }

    destroy() {
        clearInterval(this.gameLoop);
        document.removeEventListener('keydown', this.handleKeyPress.bind(this));
    }

    handleKeyPress(event) {
        const keyMap = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right'
        };

        const newDirection = keyMap[event.key];
        if (!newDirection) return;

        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        if (opposites[newDirection] !== this.direction) {
            this.nextDirection = newDirection;
        }
    }

    generateFood() {
        const maxX = this.canvas.width / this.gridSize - 1;
        const maxY = this.canvas.height / this.gridSize - 1;
        
        do {
            this.food = {
                x: Math.floor(Math.random() * maxX),
                y: Math.floor(Math.random() * maxY)
            };
        } while (this.snake.some(segment => 
            segment.x === this.food.x && segment.y === this.food.y
        ));
    }

    update() {
        if (this.isPaused) return;

        // Update direction
        this.direction = this.nextDirection;

        // Calculate new head position
        const head = { ...this.snake[0] };
        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Check for collisions
        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }

        // Add new head
        this.snake.unshift(head);

        // Check if food is eaten
        if (head.x === this.food.x && head.y === this.food.y) {
            this.generateFood();
            window.updateScore(10);
        } else {
            this.snake.pop();
        }

        this.draw();
    }

    checkCollision(head) {
        // Wall collision
        if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || head.y >= this.canvas.height / this.gridSize) {
            return true;
        }

        // Self collision
        return this.snake.some(segment => 
            segment.x === head.x && segment.y === head.y
        );
    }

    gameOver() {
        clearInterval(this.gameLoop);
        this.isRunning = false;
        alert(`Game Over! Score: ${document.getElementById('score').textContent}`);
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.ctx.fillStyle = '#00ff00';
        this.snake.forEach((segment, index) => {
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 1,
                this.gridSize - 1
            );
        });

        // Draw food
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 1,
            this.gridSize - 1
        );
    }
}
