'use strict'
// const GAME_FREQ = 1000;
const MINE = '💣';
const FLAG = '🚩';
const EMPTY = '😍';
const LIFES = '😍';
// The Model
var gBoard;
var gGameStatus; //lose or win status
var gFlagCounter; //to tell when a player wins
var gElNumOfFlags;
var gFirstClick;
var gIntervalId = false;
var gSize; //depends on game level that the player wants
var gChanceForMines //depends on game level that the player wants
var gIsGameOn = false;
// var gElNumLifes;
// var gNumOfLifes;
//&#128523
function init(diff) {
    if (diff === 4) gChanceForMines = 0.7; //70% for mines in the field
    if (diff === 4) gChanceForMines = 0.5; //50% for mines in the field
    if (diff === 4) gChanceForMines = 0.4; //40% for mines in the field
    clearInterval(gIntervalId);
    gSize = diff;
    gFlagCounter = 20;
    gElNumOfFlags = document.querySelector('.numOfFlags');
    gElNumOfFlags.innerText = 'Num of 🚩 left: ' + gFlagCounter;
    var elGameStatus = document.querySelector('.gameStatus');
    elGameStatus.innerText = 'Lets go!';
    // var gElNumLifes = document.querySelector('.numOfLifes');
    // elGameStatus.innerText = '❤️ ❤️ ❤️';
    // gNumOfLifes=3;
    gGameStatus = false;
    gFirstClick = true;
    var elTBtn = document.querySelector('.playAgain')
    elTBtn.innerText = '😊';
    gBoard = BuildBoard();
    renderBoard(gBoard)
}

function startTime() {
    var AudioElement = document.getElementById("myAudio");
    AudioElement.play();
    var gTimeStart = new Date()
    gIntervalId = setInterval(function() {
        var gTimePassed = (new Date() - gTimeStart) / 1000
        var elTimer = document.querySelector('.timer');
        elTimer.innerText = `Game Time:${gTimePassed}`;
    }, 1);
}

function BuildBoard() {
    var boardLength = gSize;
    var board = [];
    for (var i = 0; i < boardLength; i++) {
        board.push([])
        for (var j = 0; j < boardLength; j++) {
            var cell = { minesAroundCount: 0, isShown: false, isMine: false, isFlag: false };
            board[i][j] = cell;
            if (Math.random() < gChanceForMines) cell.isMine = true;

        }
    }
    for (var i = 0; i < boardLength; i++) {
        for (var j = 0; j < boardLength; j++) {
            var mines = setMinesNegsCount(i, j, board)
            board[i][j].minesAroundCount = mines
                // console.table(` ${board[i][j].minesAroundCount} around ${i} ${j}`);
        }
    }

    return board;
}

function renderBoard(board) {
    //console.table(board);
    var strHTML = '';
    var counter = 0;
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            var viewer;
            if (board[i][j].isMine === true) {
                viewer = MINE;
                counter++;
            } else {
                viewer = board[i][j].minesAroundCount;
            }
            var className = 'cell'
            var tdId = `cell-${i}-${j}`;
            //Disable the menu when right clicking, FROM THE WEB
            if (document.addEventListener) {
                document.addEventListener('contextmenu', function(e) {
                    e.preventDefault();
                }, false);
            } else {
                document.attachEvent('oncontextmenu', function() {
                    window.event.returnValue = false;
                });
            }
            /////////////////////////////////////////////////
            strHTML += `<td id="${tdId}" class="${className}" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(this, ${i}, ${j})"</td>`

        }

        strHTML += '</tr>'
    }
    // console.log('mines: ' + counter);
    var elTbody = document.querySelector('.board');
    elTbody.innerHTML = strHTML;

}

function setMinesNegsCount(cellI, cellJ, mat) {
    var minesAroundCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= mat.length) continue;
            if (i === cellI && j === cellJ) continue;
            if (!mat[i][j].isMine) continue;
            minesAroundCount++
        }
    }
    return minesAroundCount;
}

function cellClicked(elTd, cellI, cellJ, event) {
    if (gFirstClick === true) {
        if (!gIsGameOn) startTime();
        gBoard[cellI][cellJ].isMine = false;
        gBoard[cellI][cellJ].isShown = true;
        if (gBoard[cellI][cellJ].minesAroundCount === 0) elTd.innerText = EMPTY;
        else elTd.innerText = gBoard[cellI][cellJ].minesAroundCount;
        expandShown(gBoard, elTd, cellI, cellJ);
        gFirstClick = false;
        checkVictory();
    }
    if (gBoard[cellI][cellJ].isShown === false) {
        if (gBoard[cellI][cellJ].isMine === true) {
            elTd.innerText = MINE;
            gBoard[cellI][cellJ].isShown = true;
            gameOver(gGameStatus);
        } else {
            elTd.innerText = gBoard[cellI][cellJ].minesAroundCount;
            gBoard[cellI][cellJ].isShown = true;
            checkVictory();
            expandShown(gBoard, elTd, cellI, cellJ);
        }
    }

}

function expandShown(gBoard, elPressedCell, cellI, cellJ) {

    var minesAroundCount = 0

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue;
            if (i === cellI && j === cellJ) continue;
            if (gBoard[i][j].isShown) continue;
            if (gBoard[i][j].isFlag) continue;
            if (gBoard[i][j].isMine) continue;

            var elCurrCell = getElementById({ i: i, j: j });
            // debugger;
            if (gBoard[i][j].minesAroundCount > 0) {
                elCurrCell.innerText = gBoard[i][j].minesAroundCount;
                gBoard[i][j].isShown = true;
                continue;
            }
            if (gBoard[i][j].minesAroundCount === 0) {
                // console.log('good')
                //update the dom
                elPressedCell.innerText = EMPTY;
                elCurrCell.innerText = EMPTY;
                //update the model
                gBoard[i][j].isShown = true;
                expandShown(gBoard, elCurrCell, i, j);

            }
        }
    }
}

function getElementById(location) {
    var id = `#cell-${location.i}-${location.j}`;
    return document.querySelector(`${id}`);
}

function cellMarked(elTd, cellI, cellJ, event) {
    //console.log('right click!!!!')
    if (gFirstClick === true) {
        if (!gIsGameOn) startTime();
        gIsGameOn = true;
    }
    if (!gBoard[cellI][cellJ].isFlag) {
        if ((!gBoard[cellI][cellJ].isShown) && (gFlagCounter > 0)) {
            gBoard[cellI][cellJ].isFlag = true;
            gBoard[cellI][cellJ].isShown = true;
            elTd.innerText = FLAG;
            gFlagCounter--;
            gElNumOfFlags.innerText = 'Num of 🚩 left: ' + gFlagCounter;
            checkVictory();
        }
    } else {
        gBoard[cellI][cellJ].isFlag = false;
        gBoard[cellI][cellJ].isShown = false;
        elTd.innerText = '';
        gFlagCounter++;
        gElNumOfFlags.innerText = 'Num of 🚩 left: ' + gFlagCounter;
    }

}

function checkVictory() {
    var shownCellsForVictory = 0;
    for (var i = 0; i < gSize; i++) {
        for (var j = 0; j < gSize; j++) {
            if (gBoard[i][j].isShown === false) return;
            shownCellsForVictory++;
            // debugger;
            // console.log('shown: ' + shownCellsForVictory)
            if (shownCellsForVictory === gSize ** 2) victory();
        }
    }
}

function victory() {
    var strHTML = '';
    gGameStatus = true; //player won
    var elTbody = document.querySelector('.board');
    elTbody.innerHTML = strHTML;
    var elTBtn = document.querySelector('.playAgain')
    var audioElement = new Audio('sound/victory.wav');
    audioElement.play();
    elTBtn.innerText = '🤗'
    var elGameStatus = document.querySelector('.gameStatus');
    elGameStatus.innerText = 'You win!!';
    gameOver(gGameStatus);

}

function gameOver(gGameStatus) {
    clearInterval(gIntervalId);
    var strHTML = '';
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isShown === true) {
                var cell = gBoard[i][j].minesAroundCount;
                if (gBoard[i][j].minesAroundCount === 0) cell = EMPTY;
                else if (gBoard[i][j].isFlag === 0) cell = FLAG;
            } else var cell = '';
            if (gBoard[i][j].isMine === true) var cell = MINE;
            var className = 'cell';
            strHTML += `<td data-i="${i}" data-j="${j}"class="${className}">${cell}</td>`
        }
        strHTML += '</tr>'
    }

    if (!gGameStatus) {
        var elTBtn = document.querySelector('.playAgain')
        var audioElement = new Audio('sound/0477.wav');
        audioElement.play();
        elTBtn.innerText = '🥺';
        var elGameStatus = document.querySelector('.gameStatus');
        elGameStatus.innerText = 'Sorry, you stepped on mine';
    }
    var elTbody = document.querySelector('.board');
    elTbody.innerHTML = strHTML;

}