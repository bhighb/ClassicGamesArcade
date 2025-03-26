class Tetris {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.blockSize = 30;
        this.cols = 10;
        this.rows = 20;
        this.grid = [];
        this.currentPiece = null;
        this.gameLoop = null;
        this.isRunning = false;
        this.isPaused = false;
        this.score = 0;
        
        // Tetromino shapes and colors
        this.shapes = {
            I: [[1, 1, 1, 1]],
            O: [[1, 1], [1, 1]],
            T: [[0, 1, 0], [1, 1, 1]],
            S: [[0, 1, 1], [1, 1, 0]],
            Z: [[1, 1, 0], [0, 1, 1]],
            J: [[1, 0, 0], [1, 1, 1]],
            L: [[0, 0, 1], [1, 1, 1]]
        };
        
        this.colors = {
            I: '#00f0f0',
            O: '#f0f000',
            T: '#a000f0',
            S: '#00f000',
            Z: '#f00000',
            J: '#0000f0',
            L: '#f0a000'
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
        
        // Initialize grid
        this.grid = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        
        // Add event listeners
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        // Create first piece
        this.createNewPiece();
    }

    handleResize() {
        const gameArea = document.getElementById('gameArea');
        const maxBlockSize = Math.min(
            gameArea.clientWidth / this.cols,
            gameArea.clientHeight / this.rows
        );
        
        this.blockSize = Math.max(10, Math.floor(maxBlockSize));
        this.canvas.width = this.cols * this.blockSize;
        this.canvas.height = this.rows * this.blockSize;
        
        if (this.isRunning) {
            this.draw();
        }
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.gameLoop = setInterval(() => this.update(), 1000);
        }
    }

    pause(isPaused) {
        this.isPaused = isPaused;
        if (isPaused) {
            clearInterval(this.gameLoop);
        } else {
            this.gameLoop = setInterval(() => this.update(), 1000);
        }
    }

    destroy() {
        clearInterval(this.gameLoop);
        document.removeEventListener('keydown', this.handleKeyPress.bind(this));
    }

    handleKeyPress(event) {
        if (!this.currentPiece) return;

        switch (event.key) {
            case 'ArrowLeft':
                this.movePiece(-1, 0);
                break;
            case 'ArrowRight':
                this.movePiece(1, 0);
                break;
            case 'ArrowDown':
                this.movePiece(0, 1);
                break;
            case 'ArrowUp':
                this.rotatePiece();
                break;
            case ' ':
                this.hardDrop();
                break;
        }
    }

    createNewPiece() {
        const pieces = Object.keys(this.shapes);
        const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
        
        this.currentPiece = {
            shape: this.shapes[randomPiece],
            color: this.colors[randomPiece],
            x: Math.floor(this.cols / 2) - Math.floor(this.shapes[randomPiece][0].length / 2),
            y: 0
        };

        if (this.checkCollision()) {
            this.gameOver();
        }
    }

    movePiece(dx, dy) {
        this.currentPiece.x += dx;
        this.currentPiece.y += dy;

        if (this.checkCollision()) {
            this.currentPiece.x -= dx;
            this.currentPiece.y -= dy;
            if (dy > 0) {
                this.lockPiece();
            }
        }
    }

    rotatePiece() {
        const rotated = this.currentPiece.shape[0].map((_, i) =>
            this.currentPiece.shape.map(row => row[i]).reverse()
        );

        const originalShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;

        if (this.checkCollision()) {
            this.currentPiece.shape = originalShape;
        }
    }

    hardDrop() {
        while (!this.checkCollision(this.currentPiece.x, this.currentPiece.y + 1)) {
            this.currentPiece.y++;
        }
        this.lockPiece();
    }

    checkCollision(offsetX = 0, offsetY = 0) {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const newX = this.currentPiece.x + x + offsetX;
                    const newY = this.currentPiece.y + y + offsetY;

                    if (newX < 0 || newX >= this.cols || 
                        newY >= this.rows ||
                        (newY >= 0 && this.grid[newY][newX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    lockPiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const gridY = this.currentPiece.y + y;
                    if (gridY >= 0) {
                        this.grid[gridY][this.currentPiece.x + x] = this.currentPiece.color;
                    }
                }
            }
        }
        this.clearLines();
        this.createNewPiece();
    }

    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.rows - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell !== 0)) {
                this.grid.splice(y, 1);
                this.grid.unshift(Array(this.cols).fill(0));
                linesCleared++;
                y++;
            }
        }

        if (linesCleared > 0) {
            window.updateScore(linesCleared * 100);
        }
    }

    update() {
        if (this.isPaused) return;
        this.movePiece(0, 1);
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
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.grid[y][x]) {
                    this.ctx.fillStyle = this.grid[y][x];
                    this.ctx.fillRect(
                        x * this.blockSize,
                        y * this.blockSize,
                        this.blockSize - 1,
                        this.blockSize - 1
                    );
                }
            }
        }

        // Draw current piece
        if (this.currentPiece) {
            this.ctx.fillStyle = this.currentPiece.color;
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        this.ctx.fillRect(
                            (this.currentPiece.x + x) * this.blockSize,
                            (this.currentPiece.y + y) * this.blockSize,
                            this.blockSize - 1,
                            this.blockSize - 1
                        );
                    }
                }
            }
        }
    }
}
