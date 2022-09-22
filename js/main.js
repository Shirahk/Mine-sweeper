'use strict'

const MINE = '💣';
const FLAG = '⛳';
const EMPTY = ' ';

var cell = {
    minesAroundCount: 0,
    isShown: false,
    isMine: false,
    isMarked: false
}

// The Model
var gBoard;

var gLevel = {
    SIZE: 4,
    MINES: 2,
}

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function initGame() {
    startGame();
    setInterval(() => {
        if (gGame.isOn) {
            gGame.secsPassed++;
        }
    }, 1000);
}


function startGame() {
    gBoard = buildBoard();
    setMinesNegsCount(gBoard);
    renderBoard(gBoard);

    gGame.isOn = true;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.secsPassed = 0;
}

function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([]);
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = { ...cell };
        }
    }
    //board[1][1] = board[2][3] = MAIN;
    var mines = [];
    for (var i = 0; i < gLevel.MINES; i++) {
        var currRandom = getRandomIntInclusive(0, gLevel.SIZE * gLevel.SIZE - 1);
        while (mines.includes(currRandom)) {
            currRandom = getRandomIntInclusive(0, gLevel.SIZE * gLevel.SIZE - 1);
        }
        mines.push(currRandom);
    }
    for (var i = 0; i < gLevel.MINES; i++) {
        var cellI = Math.floor(mines[i] / gLevel.SIZE);
        var cellJ = mines[i] % gLevel.SIZE;
        board[cellI][cellJ].isMine = true;
    }
    return board;
}

function countNegs(cellI, cellJ, board) {
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
            board[i][j].minesAroundCount = countNegs(i, j, board);
        }
    }
}

function gameOver() {
    gGame.isOn = false;
}

function showCell(cell) {
    var currCell = EMPTY;
    if (cell.isShown) {
        var currCell = cell.minesAroundCount;
        if (cell.isMine) currCell = MINE;
         else if (cell.isMarked) currCell = FLAG;
    }
    return currCell;
}

function cellClicked(elCell, i, j) {
    if (!gBoard[i][j].isShown) {
        gGame.shownCount++;
        gBoard[i][j].isShown = true;
        // renderBoard(gBoard);
        elCell.innerText = showCell(gBoard[i][j]);
        if (gBoard[i][j].isMine) {
            gameOver();
        }
    }
}

//function cellMarked(elCell)

function checkGameOver() {
    if (gGame.shownCount + gGame.markedCount === gLevel.SIZE * gLevel.SIZE) {
        gameOver();
    }
}

// functionexpandShown(board, elCell, i, j)

function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>\n`;
        for (var j = 0; j < board[i].length; j++) {
            var currCell = showCell(gBoard[i][j]);
            strHTML += `<td data-i="${i}" data-j="${j}"
            onclick="cellClicked(this,${i},${j})">
            ${currCell}
            </td>`;
        }
        strHTML += `</tr>\n`;
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}