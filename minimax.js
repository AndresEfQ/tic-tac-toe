let board = ['o' , 'x' , 'o', 
             'o' , 'x' , null, 
             'x' , null, 'o' ];

function winning(currentBoard) {
  let lines = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];
  for (let i = 0; i < lines.length; i++) {
    let [a, b, c] = lines[i];
    if (currentBoard[a] && currentBoard[a] == currentBoard[b] && currentBoard[a] == currentBoard[c]) return currentBoard[a];
  }
}

function minimax(board, player, isMax, depth) {
  let score;
  if (winning(board) == 'o') {
    score = 10 - depth;
    return score;
  } else if (winning(board)) {
    score = -10 + depth;
    return score;
  } else if (board.filter(box => box == null).length == 0) {
    score = 0;
    return score;
  }

  let moves = [];
  let partialScore;
  let nextPlayer = player == 'x' ? 'o' : 'x';
  for (let i = 0; i < board.length; i++) {
    if (board[i] == null) {
      board[i] = nextPlayer;
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

function bestMove(board, player) {
  let moves = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] == null) {
      let move = {};
      move.index = i;
      board[i] = player;
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

console.log(bestMove(board, 'o'));