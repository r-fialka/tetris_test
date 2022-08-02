class Tetris {
    constructor(imageX, imageY, template) {
        this.imageX = imageX;
        this.imageY = imageY;
        this.template = template;
        this.x = squareCountX / 4;
        this.y = 0;
    }

    checkBottom() {
        for(let i = 0; i < this.template.length; i++) {
            for(let j = 0; j < this.template.length; j++) {
                if(this.template[i][j] == 0) 
                    continue;
                let realX = i + this.getTruncedPosition().x;
                let realY = j + this.getTruncedPosition().y;
                if(realY + 1 >= squareCountY) {
                    return false;
                }
                if(gameMap[realY + 1][realX].imageX != -1) {
                    return false;
                }
            }
        }
        return true;
    }

    getTruncedPosition() {
        return {x: Math.trunc(this.x), y: Math.trunc(this.y)};
    }

    checkLeft() {
        for(let i = 0; i < this.template.length; i++) {
            for(let j = 0; j < this.template.length; j++) {
                if(this.template[i][j] == 0)
                    continue;
                let realX = i + this.getTruncedPosition().x;
                let realY = j + this.getTruncedPosition().y;
                if(realX - 1 < 0)
                    return false;
                if(gameMap[realY][realX - 1].imageX != -1)
                    return false;
            }
        }
        return true;
    }

    checkRight() {
        for(let i = 0; i < this.template.length; i++) {
            for(let j = 0; j < this.template.length; j++) {
                if(this.template[i][j] == 0)
                    continue;
                let realX = i + this.getTruncedPosition().x;
                let realY = j + this.getTruncedPosition().y;
                if(realX + 1 >= squareCountX)
                    return false;
                if(gameMap[realY][realX - 1].imageX != -1)
                    return false;
            }
        }
        return true;
    }

    moveLeft() {
        if(this.checkLeft())
            this.x--;
    }

    moveRight() {
        if(this.checkRight())
            this.x++;
    }

    moveBottom() {
        if(this.checkBottom()) {
            this.y++;
            score++;
        }
    }

    changeRotation() {
        let tempTemplate = [];
        for(let i = 0; i < this.template.length; i++) {
            tempTemplate[i] = this.template[i].slice();
        }
        let n = this.template.length;
        for(let i = 0; i < n / 2; i++) {
            let first = i;
            let last = n - 1 - i;
            for(let j = first; j < last; j++) {
                let offset = j - first;
                let top = this.template[first][j];
                this.template[first][j] = this.template[j][last];
                this.template[j][last] = this.template[last][last - offset];
                this.template[last][last - offset] = this.template[last - offset][first];
                this.template[last - offset][first] = top;
            }
        }
        for(let i = 0; i < this.template.length; i++) {
            for(let j = 0; j < this.template.length; j++) {
                if(this.template[i][j] == 0)
                    continue;
                let realX = i + this.getTruncedPosition().x;
                let realY = j + this.getTruncedPosition().y;
                if(realX < 0 || realX >= squareCountX || realY < 0 || realY >= squareCountY) {
                    this.template = tempTemplate;
                    return false;
                } 
            }
        }
    }
}

const imageSquareSize = 24;
const size = 40;
const framePerSecond = 24;
const gameSpeed = 5;
const canvas = document.getElementById("canvas");
const image = document.getElementById("image");
const nextShapeCanvas = document.getElementById("nextShapeCanvas");
const scoreCanvas = document.getElementById("scoreCanvas");
const context = canvas.getContext("2d");
const nexteContext = nextShapeCanvas.getContext("2d");
const scoreContext = scoreCanvas.getContext("2d");
const squareCountX = canvas.width / size;
const squareCountY = canvas.height / size;

const shapes = [
    new Tetris(0, 144, [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0]
    ]),
    new Tetris(0, 120, [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0]
    ]),
    new Tetris(0, 96, [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1]
    ]),
    new Tetris(0, 72, [
        [0, 0, 0],
        [0, 1, 1],
        [1, 1, 0]
    ]),
    new Tetris(0, 48, [
        [0, 0, 0],
        [1, 1, 0],
        [0, 1, 1]
    ]),
    new Tetris(0, 24, [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0]
    ]),
    new Tetris(0, 0, [
        [1, 1],
        [1, 1]
    ]),
]

let gameMap;
let gameOver;
let currentShape;
let nextShape;
let score;
let initialTwoArray;
let whiteLineThickness = 3;

gameLoop = () => {
    setInterval(update, 1000 / gameSpeed);
    setInterval(draw, 1000 / framePerSecond);
}

let deleteCopleteRows = () => {
    for(let i = 0; i < gameMap.length; i++) {
        let t = gameMap[i];
        let isComplete = true;
        for(let j = 0; j < t.length; j++) {
            if(t[j].imageX == -1)
                isComplete = false;
        }
        if(isComplete) {
            score += 1000;
            for(let k = i; k > 0; k--) {
                gameMap[k] = gameMap[k - 1];
            }
            let temp = [];
            for(let j = 0; j < squareCountX; j++) {
                temp.push({imageX: -1, imageY: -1});
            }
            gameMap[0] = temp;
        }
    }
}

let update = () => {
    if(gameOver)
        return;
    if(currentShape.checkBottom()) {
        currentShape.y += 1;
    } 
    else {
        for(let i = 0; i < currentShape.template.length; i++) {
            for(let j = 0; j < currentShape.template.length; j++) {
                if(currentShape.template[i][j] == 0)
                    continue;
                gameMap[currentShape.getTruncedPosition().y + j][currentShape.getTruncedPosition().x + i] = {
                    imageX: currentShape.imageX, imageY: currentShape.imageY
                }
            }
        }

        deleteCopleteRows();
        currentShape = nextShape;
        nextShape = getRandomShape();
        if(!currentShape.checkBottom()) {
            gameOver = true;
        }
        score += 100;
    }
}

let drawRect = (x, y, width, height, color) => {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
}

let drawBackground = () => {
    drawRect(0, 0, canvas.width, canvas.height, "#E3E3E3");
    for(let i = 0; i < squareCountX + 1; i++) {
        drawRect(size * i - whiteLineThickness, 0, whiteLineThickness, canvas.height, "white");
    }
    for(let i = 0; i < squareCountY + 1; i++) {
        drawRect(0, size * i - whiteLineThickness, canvas.width, whiteLineThickness, "white");
    }
}

let drawCurrentTetris = () => {
    for(let i = 0; i < currentShape.template.length; i++) {
        for(let j = 0; j < currentShape.template.length; j++) {
            if(currentShape.template[i][j] == 0)
                continue;
            context.drawImage(
                image, 
                currentShape.imageX, 
                currentShape.imageY, 
                imageSquareSize, 
                imageSquareSize,
                Math.trunc(currentShape.x) * size + size * i,
                Math.trunc(currentShape.y) * size + size * j,
                size,
                size
                );
        }
    }
}

let drawSquares = () => {
    for(let i = 0; i < gameMap.length; i++) {
        let t = gameMap[i];
        for(let j = 0; j < t.length; j++) {
            if(t[j].imageX == -1)
                continue;
            context.drawImage(
                image, 
                t[j].imageX, 
                t[j].imageY, 
                imageSquareSize, 
                imageSquareSize, 
                j * size,
                i * size,
                size,
                size
            );
        }
    }
}

let drawNextShape = () => {
    nexteContext.fillStyle = "#E3E3E3";
    nexteContext.fillRect(0, 0, nextShapeCanvas.width, nextShapeCanvas.height);
    for(let i = 0; i < nextShape.template.length; i++) {
        for(let j = 0; j < nextShape.template.length; j++) {
            if(nextShape.template[i][j] == 0)
                continue;
            nexteContext.drawImage(
                image, 
                nextShape.imageX, 
                nextShape.imageY, 
                imageSquareSize, 
                imageSquareSize, 
                size * i,
                size * j + size,
                size,
                size
                )
        }
    }
}

let drawScore = () => {
    scoreContext.clearRect(0, 0, scoreCanvas.width, scoreCanvas.height);
    scoreContext.font = "64px Arial";
    scoreContext.fillStyle = "black";
    scoreContext.fillText(score, 10, 50);
}

let drawGameOver = () => {
    context.font = "64px Arial";
    context.fillStyle = "black";
    context.fillText("Game Over!", 10, canvas.height / 2);
}

let draw = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawSquares();
    drawCurrentTetris();
    drawScore();
    drawNextShape();
    
    if(gameOver) {
        drawGameOver();
    }
}

let getRandomShape = () => {
    return Object.create(shapes[Math.floor(Math.random() * shapes.length)]);
}

let resetVars = () => {
    initialTwoArray = [];
    for(let i = 0; i < squareCountY; i++) {
        let temp = [];
        for(let j = 0; j < squareCountX; j++) {
            temp.push({imageX: -1, imageY: - 1});
        }
        initialTwoArray.push(temp);
    }
    score = 0;
    gameOver = false;
    currentShape = getRandomShape();
    nextShape = getRandomShape();
    gameMap = initialTwoArray;
}

window.addEventListener("keydown", (event) => {
    if(event.keyCode == 37)
        currentShape.moveLeft();
    else if(event.keyCode == 38)
        currentShape.changeRotation();
    else if(event.keyCode == 39)
        currentShape.moveRight();
    else if(event.keyCode == 40)
        currentShape.moveBottom();
})

resetVars();
gameLoop();