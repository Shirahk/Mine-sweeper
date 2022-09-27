'use strict';

const MINE = '💣';
const FLAG = '⛳';
const EMPTY = ' ';
const HAPPY_SMILEY = '😊';
const WIN_SMILEY = '😎';
const LOSE_SMILEY = '😢';
const LIFE = '🖤';

var cell = {
    minesAroundCount: 0,
    isShown: false,
    isMine: false,
    isMarked: false
};

// The Model
var gBoard;

var gLevel = {
    SIZE: 4,
    MINES: 2,
};

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    life: 3,
};
var isClick = false;

function initGame() {
    document.addEventListener('contextmenu', event => event.preventDefault());
    startGame();
    setInterval(() => {
        if (gGame.isOn && isClick) {
            gGame.secsPassed++;
            var elTime = document.querySelector('.time');
            elTime.innerText = gGame.secsPassed;
        }
    }, 1000);
}
function setBoard(size, mines, life) {
    gLevel.SIZE = size;
    gLevel.MINES = mines;
    gGame.life = life;
    startGame();
}

function startGame() {
    gBoard = buildEmptyBoard();
    renderBoard(gBoard);
    renderLife(gGame);
    /*var ellife = document.querySelector('.life')
    ellife.innerText = LIFE;*/
    var elSymbol = document.querySelector('.smiley')
    elSymbol.innerText = HAPPY_SMILEY;

    gGame.isOn = true;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.secsPassed = 0;
    isClick = false;
    var elTime = document.querySelector('.time')
    elTime.innerText = gGame.secsPassed;
}

function buildEmptyBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([]);
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = { ...cell };
        }
    }
    return board;
}

function buildFinalBoard(board, cellI, cellJ) {
    if (isClick) {
        var mines = [];
        for (var i = 0; i < gLevel.MINES; i++) {
            var currRandom = getRandomIntInclusive(0, gLevel.SIZE * gLevel.SIZE - 1);
            while (mines.includes(currRandom) || currRandom === (cellI * gLevel.SIZE + cellJ)) {
                currRandom = getRandomIntInclusive(0, gLevel.SIZE * gLevel.SIZE - 1);
            }
            mines.push(currRandom);
        }
        for (var i = 0; i < gLevel.MINES; i++) {
            var currI = Math.floor(mines[i] / gLevel.SIZE);
            var currJ = mines[i] % gLevel.SIZE;
            board[currI][currJ].isMine = true;
        }
        setMinesNegsCount(board);
    }
}

function countNegs(board, cellI, cellJ) {
    var negsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (board[i][j].isMine) negsCount++;
        }
    }
    return negsCount;
}

function setMinesNegsCount(board) {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j].minesAroundCount = countNegs(board, i, j);
        }
    }
}

function gameOver() {
    gGame.isOn = false;
}

function showCell(cell) {
    var currCell = EMPTY;
    if (cell.isShown) {
        if (cell.minesAroundCount !== 0) currCell = cell.minesAroundCount;
        if (cell.isMine) currCell = MINE;
    } else if (cell.isMarked) {
        currCell = FLAG;
    }
    return currCell;
}

function cellMarked(elCell) {
    if (gGame.isOn) {
        var i = elCell.dataset.i;
        var j = elCell.dataset.j;
        if (!gBoard[i][j].isShown) {
            gBoard[i][j].isMarked = !gBoard[i][j].isMarked;
            if (gBoard[i][j].isMarked) {
                gGame.markedCount++;
            } else {
                gGame.markedCount--;
            }
            elCell.innerText = showCell(gBoard[i][j]);
        }

        checkGameOver();
    }
}

function cellClicked(elCell, i, j) {
    if (gGame.isOn) {
        if (!isClick) {
            isClick = true;
            buildFinalBoard(gBoard, i, j);
        }
        if (!gBoard[i][j].isShown && !gBoard[i][j].isMarked) {
            gBoard[i][j].isShown = true;
            elCell.innerText = showCell(gBoard[i][j]);
            elCell.style.backgroundColor = 'lightslategrey';
            gGame.shownCount++;
            if (gBoard[i][j].isMine) {
                gGame.life--;
                if (gGame.life === 0) {
                    for (var i = 0; i < gLevel.SIZE; i++) {
                        for (var j = 0; j < gLevel.SIZE; j++) {
                            if (!gBoard[i][j].isShown && gBoard[i][j].isMine) {
                                gBoard[i][j].isShown = true;
                                // elCell.innerText = showCell(gBoard[i][j]);
                            }
                        }
                    }
                    renderBoard(gBoard);
                    gameOver();
                    var elSymbol = document.querySelector('.smiley')
                    elSymbol.innerText = LOSE_SMILEY;
                }
            } else {
                expandShown(gBoard, elCell, i, j);
                checkGameOver();
            }
        }
    }
}

function expandShown(board, elCell, i, j) {
    if (!board[i][j].isMine && !board[i][j].isMarked && board[i][j].minesAroundCount === 0) {
        for (var cellI = i - 1; cellI <= i + 1; cellI++) {
            if (cellI < 0 || cellI >= board.length) continue;
            for (var cellJ = j - 1; cellJ <= j + 1; cellJ++) {
                if (cellJ < 0 || cellJ >= board[cellI].length) continue;
                if (i === cellI && j === cellJ) continue;
                if (!board[cellI][cellJ].isShown && !board[cellI][cellJ].isMine) {
                    board[cellI][cellJ].isShown = true;
                    // elCell.innerText = showCell(board[cellI][cellJ]);
                    // elCell.style.background = 'lightslategrey';
                    renderBoard(board);
                    gGame.shownCount++;

                    expandShown(board, elCell, cellI, cellJ);
                }
            }
        }
    }
}

function checkGameOver() {
    if (gLevel.MINES === gGame.markedCount && gGame.shownCount + gGame.markedCount === gLevel.SIZE * gLevel.SIZE) {
        gameOver();
        var elSymbol = document.querySelector('.smiley');
        elSymbol.innerText = WIN_SMILEY;
    }
}

function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>\n`;
        for (var j = 0; j < board[i].length; j++) {
            var currCell = showCell(board[i][j]);
            strHTML += `<td` + (board[i][j].isShown && !board[i][j].isMine ? ` class="taken"` : ``) +
                ` data-i="${i}" data-j="${j}"
            onclick="cellClicked(this,${i},${j})"
            oncontextmenu="cellMarked(this)">
                ${currCell}
            </td>`;
        }
        strHTML += `</tr>\n`;
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function renderLife(game) {
    var strHTML = '';
    for (var i = 0; i < game.life; i++) {
        //strHTML += `<tr>\n`;
        strHTML += LIFE;
    }
    var ellife = document.querySelector('.life');
    ellife.innerHTML = strHTML;
}