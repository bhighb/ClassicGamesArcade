class Pacman {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.width = 800;
        this.height = 600;
        this.gridSize = 20;
        this.pacmanSize = 20;
        this.ghostSize = 20;
        this.dotSize = 8;
        this.powerDotSize = 16;
        this.speed = 3;
        this.ghostSpeed = 2;
        this.powerModeDuration = 10000; // 10 seconds
        
        // Game objects
        this.pacman = {
            x: 0,
            y: 0,
            direction: 'right',
            nextDirection: 'right',
            mouthOpen: true,
            mouthAngle: 0.2
        };
        
        this.ghosts = [];
        this.dots = [];
        this.powerDots = [];
        this.score = 0;
        this.lives = 3;
        this.gameLoop = null;
        this.isRunning = false;
        this.isPaused = false;
        this.powerMode = false;
        this.powerModeTimer = null;
        
        // Maze layout (0: wall, 1: path, 2: dot, 3: power dot)
        this.maze = [
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,2,2,2,2,2,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0],
            [0,3,0,0,0,2,0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0],
            [0,2,0,0,0,2,0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0],
            [0,2,2,2,2,2,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0],
            [0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,2,2,2,2,2,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0],
            [0,2,0,0,0,0,0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0],
            [0,2,0,0,0,0,0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0],
            [0,3,2,2,2,2,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ];
        
        // Ghost colors
        this.ghostColors = ['#ff0000', '#00ffff', '#ffb8ff', '#ffb852'];
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
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        // Initialize game objects
        this.initializeGame();
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
        clearTimeout(this.powerModeTimer);
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

        if (opposites[newDirection] !== this.pacman.direction) {
            this.pacman.nextDirection = newDirection;
        }
    }

    initializeGame() {
        // Find Pac-Man's starting position
        for (let y = 0; y < this.maze.length; y++) {
            for (let x = 0; x < this.maze[y].length; x++) {
                if (this.maze[y][x] === 1) {
                    this.pacman.x = x * this.gridSize;
                    this.pacman.y = y * this.gridSize;
                    break;
                }
            }
        }
        
        // Create ghosts
        this.ghosts = this.ghostColors.map((color, index) => ({
            x: (10 + index * 5) * this.gridSize,
            y: 5 * this.gridSize,
            color: color,
            direction: 'right',
            speed: this.ghostSpeed
        }));
        
        // Create dots and power dots
        for (let y = 0; y < this.maze.length; y++) {
            for (let x = 0; x < this.maze[y].length; x++) {
                if (this.maze[y][x] === 2) {
                    this.dots.push({
                        x: x * this.gridSize + this.gridSize / 2 - this.dotSize / 2,
                        y: y * this.gridSize + this.gridSize / 2 - this.dotSize / 2
                    });
                } else if (this.maze[y][x] === 3) {
                    this.powerDots.push({
                        x: x * this.gridSize + this.gridSize / 2 - this.powerDotSize / 2,
                        y: y * this.gridSize + this.gridSize / 2 - this.powerDotSize / 2
                    });
                }
            }
        }
    }

    movePacman() {
        const nextX = this.pacman.x + (this.pacman.direction === 'right' ? this.speed : 
                                     this.pacman.direction === 'left' ? -this.speed : 0);
        const nextY = this.pacman.y + (this.pacman.direction === 'down' ? this.speed : 
                                     this.pacman.direction === 'up' ? -this.speed : 0);
        
        // Check if next position is valid
        const gridX = Math.floor(nextX / this.gridSize);
        const gridY = Math.floor(nextY / this.gridSize);
        
        if (this.maze[gridY] && this.maze[gridY][gridX] !== 0) {
            this.pacman.x = nextX;
            this.pacman.y = nextY;
            this.pacman.direction = this.pacman.nextDirection;
            
            // Check for dots
            this.checkDots();
        }
    }

    moveGhosts() {
        for (const ghost of this.ghosts) {
            // Simple ghost movement (can be improved with pathfinding)
            const directions = ['up', 'down', 'left', 'right'];
            const randomDirection = directions[Math.floor(Math.random() * directions.length)];
            
            const nextX = ghost.x + (randomDirection === 'right' ? ghost.speed : 
                                   randomDirection === 'left' ? -ghost.speed : 0);
            const nextY = ghost.y + (randomDirection === 'down' ? ghost.speed : 
                                   randomDirection === 'up' ? -ghost.speed : 0);
            
            const gridX = Math.floor(nextX / this.gridSize);
            const gridY = Math.floor(nextY / this.gridSize);
            
            if (this.maze[gridY] && this.maze[gridY][gridX] !== 0) {
                ghost.x = nextX;
                ghost.y = nextY;
                ghost.direction = randomDirection;
            }
        }
    }

    checkDots() {
        // Check regular dots
        for (let i = this.dots.length - 1; i >= 0; i--) {
            const dot = this.dots[i];
            if (this.isColliding(this.pacman, dot, this.dotSize)) {
                this.dots.splice(i, 1);
                window.updateScore(10);
            }
        }
        
        // Check power dots
        for (let i = this.powerDots.length - 1; i >= 0; i--) {
            const powerDot = this.powerDots[i];
            if (this.isColliding(this.pacman, powerDot, this.powerDotSize)) {
                this.powerDots.splice(i, 1);
                window.updateScore(50);
                this.activatePowerMode();
            }
        }
    }

    activatePowerMode() {
        this.powerMode = true;
        clearTimeout(this.powerModeTimer);
        this.powerModeTimer = setTimeout(() => {
            this.powerMode = false;
        }, this.powerModeDuration);
    }

    checkGhostCollisions() {
        for (const ghost of this.ghosts) {
            if (this.isColliding(this.pacman, ghost, this.ghostSize)) {
                if (this.powerMode) {
                    // Ghost is eaten
                    ghost.x = 10 * this.gridSize;
                    ghost.y = 5 * this.gridSize;
                    window.updateScore(200);
                } else {
                    // Pac-Man is eaten
                    this.lives--;
                    if (this.lives <= 0) {
                        this.gameOver();
                    } else {
                        this.initializeGame();
                    }
                }
            }
        }
    }

    isColliding(obj1, obj2, size) {
        return Math.abs(obj1.x - obj2.x) < size &&
               Math.abs(obj1.y - obj2.y) < size;
    }

    update() {
        if (this.isPaused) return;
        
        this.movePacman();
        this.moveGhosts();
        this.checkGhostCollisions();
        this.draw();
    }

    gameOver() {
        clearInterval(this.gameLoop);
        clearTimeout(this.powerModeTimer);
        this.isRunning = false;
        alert(`Game Over! Score: ${document.getElementById('score').textContent}`);
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw maze
        for (let y = 0; y < this.maze.length; y++) {
            for (let x = 0; x < this.maze[y].length; x++) {
                if (this.maze[y][x] === 0) {
                    this.ctx.fillStyle = '#0000ff';
                    this.ctx.fillRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);
                }
            }
        }
        
        // Draw dots
        this.ctx.fillStyle = '#fff';
        for (const dot of this.dots) {
            this.ctx.beginPath();
            this.ctx.arc(dot.x + this.dotSize / 2, dot.y + this.dotSize / 2, this.dotSize / 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw power dots
        this.ctx.fillStyle = '#fff';
        for (const powerDot of this.powerDots) {
            this.ctx.beginPath();
            this.ctx.arc(powerDot.x + this.powerDotSize / 2, powerDot.y + this.powerDotSize / 2, this.powerDotSize / 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw ghosts
        for (const ghost of this.ghosts) {
            this.ctx.fillStyle = this.powerMode ? '#0000ff' : ghost.color;
            this.ctx.fillRect(ghost.x, ghost.y, this.ghostSize, this.ghostSize);
        }
        
        // Draw Pac-Man
        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        const centerX = this.pacman.x + this.pacmanSize / 2;
        const centerY = this.pacman.y + this.pacmanSize / 2;
        const radius = this.pacmanSize / 2;
        let startAngle, endAngle;
        
        switch (this.pacman.direction) {
            case 'right':
                startAngle = this.pacman.mouthOpen ? 0.2 : 0;
                endAngle = this.pacman.mouthOpen ? 1.8 * Math.PI : 2 * Math.PI;
                break;
            case 'left':
                startAngle = this.pacman.mouthOpen ? Math.PI + 0.2 : Math.PI;
                endAngle = this.pacman.mouthOpen ? 3.8 * Math.PI : 3 * Math.PI;
                break;
            case 'up':
                startAngle = this.pacman.mouthOpen ? 1.5 * Math.PI + 0.2 : 1.5 * Math.PI;
                endAngle = this.pacman.mouthOpen ? 3.3 * Math.PI : 3.5 * Math.PI;
                break;
            case 'down':
                startAngle = this.pacman.mouthOpen ? 0.5 * Math.PI + 0.2 : 0.5 * Math.PI;
                endAngle = this.pacman.mouthOpen ? 1.3 * Math.PI : 1.5 * Math.PI;
                break;
        }
        
        this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        this.ctx.lineTo(centerX, centerY);
        this.ctx.fill();
        
        // Animate mouth
        this.pacman.mouthOpen = !this.pacman.mouthOpen;
        
        // Draw lives
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Lives: ${this.lives}`, 10, 30);
    }
} 