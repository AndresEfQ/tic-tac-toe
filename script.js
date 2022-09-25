const gameBoard = (() => {
  let board = new Array(9).fill(null);
  const winnerMessage = document.getElementById('winner-message');
  const winnerDiv = document.getElementById('winner');
  let displayBoxes;
  let gameFinished;

  const checkWinner = (board, player) => {
    const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    return lines.some(line => line.every(box => board[box] == player.mark))
  }

  const checkTie = (board) => {
    const emptyBoxes = board.filter(box => box == null);
    if (emptyBoxes.length == 0) return true;
  }

  const showResult = (board, player) => {
    let message;
    if (checkWinner(board, player)) {
      message = player.name == 'Player' ? `${player.mark} WINS!!` : `${player.name} WINS!!`; 
      console.log(message);
    } else if (checkTie(board)) {
      message = `It's a tie`;
    } else {
      return false;
    }
    winnerMessage.textContent = message;
    winnerDiv.style.display = 'flex';
    return true;
  } 

  const move = (player, index) => {
    if (gameFinished || board[index]) return;
    displayBoxes = Array.from(document.getElementsByClassName('box'));
    board[index] = player.mark;
    displayBoxes[index].innerHTML = `${player.mark}`;
    displayBoxes[index].classList = `box ${player.markColor}`;
    gameFinished = showResult(board, player);
    if (!gameFinished) {
      displayController.toogleActivePlayer();
    }
    return true;
  }

  const cleanBoard = () => {
    displayBoxes = Array.from(document.getElementsByClassName('box'));
    board.fill(null);
    displayBoxes.forEach(box => box.textContent = '');
    winnerDiv.style.display = 'none';
    gameFinished = false;
    let displayBoard = document.querySelector('.gameboard');
    let newDisplayBoard = displayBoard.cloneNode(true);
    displayBoard.parentNode.replaceChild(newDisplayBoard, displayBoard);
  }

  return {
    board,
    move,
    checkWinner,
    cleanBoard
  }
})();

const displayController = (() => {
  let player1;
  let player2;
  let activePlayer;
  let inactivePlayer;

  const assignStartingTurn = (player) => {
    activePlayer = player;
    inactivePlayer = player == player1 ? player2 : player1;
    showActivePlayer(activePlayer);
    player.play();
  }

  const toogleActivePlayer = () => {
    inactivePlayer = activePlayer;
    activePlayer = activePlayer == player1 ? player2 : player1;
    showActivePlayer(activePlayer);
    activePlayer.play();
  }

  const showActivePlayer = (player) => {
    const activePlayerName = document.getElementById(`${player.id}`);
    const inactivePlayerName = document.getElementById(`${inactivePlayer.id}`);
    activePlayerName.className = 'animate-character';
    inactivePlayerName.className = '';
  }

   const newGame = () => {
    gameBoard.cleanBoard();
    document.querySelector(".configuration").style.display = "flex";
  }

  const resetGame = () => {
    gameBoard.cleanBoard();
    assignStartingTurn(player1);
  }

  const startGame = (mode, difficulty) => {
    document.querySelector(".configuration").style.display = "none";
    player1 = player('player1', 'human', 'X');
    let player2Type = mode == 'single' ? 'ia' : 'human';
    player2 = player('player2', player2Type, 'O', difficulty);
    assignStartingTurn(player1); // Here I can change who starts
    document.getElementById('player1').textContent = player1.name;
    document.getElementById('player1').focus();
    document.getElementById('player2').textContent = player2.name;
    document.getElementById('reset').addEventListener('click', resetGame);
    document.getElementById('new').addEventListener('click', newGame);
  }

  const changePlayerName = (player, newName) => {
    player.name = newName;
  }

  // delete
  const getPlayer = (playerId) => {
    if (playerId == 'player1') {
      return player1; 
    } else if (playerId == 'player2') {
      return player2;
    } else {
      return;
    }
  } 

  return {
    startGame,
    toogleActivePlayer,
    assignStartingTurn,
    getPlayer,
    changePlayerName
  }
})();

const human = () => {
  let name = 'Player';
  let index;
  let displayBoard;
  let bindedHandler;
  let root = document.querySelector(':root');

  const play = function() {
    /*root.style.setProperty(`--mark`, `${this.mark}`);
    root.style.setProperty(`--mark-color`, `${this.markColor}`);*/
    console.log(this.markColor);
    displayBoard = document.querySelector('.gameboard');
    bindedHandler = handleHumanMove.bind(this);
    displayBoard.addEventListener('click', bindedHandler);
  }
  const handleHumanMove = function(e) {
    index = e.target.dataset['index'];
    let moved = gameBoard.move(this, index);
    if (moved) displayBoard.removeEventListener('click', bindedHandler);
  }
  return { name, play };
}

const ia = (difficulty) => {
  let play;
  let index;
  let name;

  const minimax = function(board, player, isMax, depth) {
    let score;
    if (gameBoard.checkWinner(board, {mark: 'O'})) {
      score = 10 - depth;
      return score;
    } else if (gameBoard.checkWinner(board, {mark: 'X'})) {
      score = -10 + depth;
      return score;
    } else if (board.filter(box => box == null).length == 0) {
      score = 0;
      return score;
    }
  
    let moves = [];
    let partialScore;
    let nextPlayer = {};
    nextPlayer.mark = player.mark == 'X' ? 'O' : 'X';
    for (let i = 0; i < board.length; i++) {
      if (board[i] == null) {
        board[i] = nextPlayer.mark;
        partialScore = minimax(board, nextPlayer, !isMax, depth + 1);
        board[i] = null;
        moves.push(partialScore);
      }
    }
  
    if (isMax) {
      let max = -1000;
      for (let i = 0; i < moves.length; i++) {
        max = Math.max(max, moves[i]);
      }
      score = max;
    } else {
      let min = 1000;
      for (let i = 0; i < moves.length; i++) {
        min = Math.min(min, moves[i]);
      }
      score = min;
    }
    return score;
  }

  const bestMove = function(board, player) {
    let moves = [];
    for (let i = 0; i < board.length; i++) {
      if (board[i] == null) {
        let move = {};
        move.index = i;
        board[i] = player.mark;
        move.score = minimax(board, player, false, 0);
        board[i] = null;
        moves.push(move);
      }
    }
    let max = -1000;
    let index;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > max) {
        max = moves[i].score;
        index = moves[i].index;
      }
    }
    return index;
  }

  const extremePlay = function() {
    const board = gameBoard.board;
    const index = bestMove(board, this);
    gameBoard.move(this, index);
  }
  
    const easyPlay = function() {
      const emptyBoxes = gameBoard.board.reduce((prev, curr, currIndex) => {
        if (curr == null) {
          prev.push(currIndex);
        }
        return prev;
      }, []);
      const random = Math.floor(Math.random()*emptyBoxes.length)
      index = emptyBoxes[random];
      gameBoard.move(this, index);
    }
  
  const midPlay = function() {
    let randomPlay = Math.floor(Math.random()*3);
    if (randomPlay < 2) {
      const emptyBoxes = gameBoard.board.reduce((prev, curr, currIndex) => {
        if (curr == null) {
          prev.push(currIndex);
        }
        return prev;
      }, []);
      const random = Math.floor(Math.random()*emptyBoxes.length)
      index = emptyBoxes[random];
      gameBoard.move(this, index);
    } else {
      const board = gameBoard.board;
      const index = bestMove(board, this);
      gameBoard.move(this, index);
    }
  }

  const hardPlay = function() {
    let randomPlay = Math.floor(Math.random()*3);
    if (randomPlay < 1) {
      const emptyBoxes = gameBoard.board.reduce((prev, curr, currIndex) => {
        if (curr == null) {
          prev.push(currIndex);
        }
        return prev;
      }, []);
      const random = Math.floor(Math.random()*emptyBoxes.length)
      index = emptyBoxes[random];
      gameBoard.move(this, index);
    } else {
      const board = gameBoard.board;
      const index = bestMove(board, this);
      gameBoard.move(this, index);
    }
  }

  switch (difficulty) {
    case 'extreme':
      name = `Mor'du`
      play = extremePlay;
      break;
    case 'hard':
      name = 'Cobra'
      play = hardPlay;
      break;
    case 'medium':
      name = 'Shadow'
      play = midPlay;
      break;
    case 'easy':
      name = 'Pengu'
      play = easyPlay;
      break;
  }

  return { name, play };
}

const player = function(id, type, mark, difficulty) {
  const {name, play} = type == 'ia' ? ia(difficulty) : human();
  const markColor = mark == 'X' ? 'black' : 'red';

  playerName = document.getElementById(`${id}`);
  playerName.addEventListener('change', (e) => displayController.changePlayerName(displayController.getPlayer(`${id}`), e.target.value));

  return {
    play,
    mark,
    markColor,
    id,
    name
  }
};

const options = Array.from(document.getElementsByClassName('game-option'));
options.forEach(option => {
  option.addEventListener('click', () => {
    displayController.startGame(option.dataset['mode'], option.dataset['difficulty'])
  })
});
