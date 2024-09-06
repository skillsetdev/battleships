export class Ship {
  timesHit = 0;
  isUnderWater = false;
  coordinates = [];
  constructor(length, isHorizontal = true) {
    this.length = length;
    this.isHorizontal = isHorizontal;
  }
  hit() {
    this.timesHit = this.timesHit + 1;
  }
  isSunk() {
    this.isUnderWater = this.timesHit >= this.length;
  }
}
export class Gameboard {
  ships = [];
  sunkShips = [];
  missedShots = [];
  constructor(size = 10) {
    this.size = size;
    this.board = this.initializeBoard(this.size);
  }
  initializeBoard(size) {
    let newBoard = this.createEmptyBoard(size);
    this.clearBoard(newBoard);
    return newBoard;
  }
  createEmptyBoard(size) {
    let board = [];
    for (let i = 0; i < size; i++) {
      let row = [];
      for (let j = 0; j < size; j++) {
        row.push(null);
      }
      board.push(row);
    }
    return board;
  }
  clearBoard(board) {
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        board[i][j] = null;
      }
    }
  }
  checkPlacementValidity(row, col, board) {
    if (row >= board.length) {
      return false;
    }
    board.forEach((row) => {
      if (col >= row.length) {
        return false;
      }
    });
    if (board[row][col] !== null) {
      return false;
    }
    return true;
  }
  placeShip(row, col, ship, board) {
    let coordinate = [row, col];
    for (let i = 0; i < ship.length; i++) {
      if (!this.checkPlacementValidity(coordinate[0], coordinate[1], board)) {
        throw new Error("The ship is out of bounds");
      }
      ship.isHorizontal
        ? (coordinate[1] = coordinate[1] + 1)
        : (coordinate[0] = coordinate[0] + 1);
    }
    coordinate = [row, col];
    for (let i = 0; i < ship.length; i++) {
      board[coordinate[0]][coordinate[1]] = `${ship.length}`;
      ship.coordinates.push([...coordinate]);
      ship.isHorizontal
        ? (coordinate[1] = coordinate[1] + 1)
        : (coordinate[0] = coordinate[0] + 1);
    }
    this.ships.push(ship);
    this.board = board;
    return board;
  }
  receiveAttack(row, col, hitCallBack, missCallBack, sunkCallBack) {
    this.ships.forEach((ship, index) => {
      if (
        ship.coordinates.some((coord) => coord[0] === row && coord[1] === col)
      ) {
        ship.hit();
        ship.isSunk();
        hitCallBack(row, col);
      } else {
        missCallBack(row, col);
      }
      if (ship.isUnderWater) {
        this.ships.splice(index, 1);
        this.sunkShips.push(ship);
        sunkCallBack(); //include check for if all ships are sunk in the sunkCallBack
        //might as well consider using display fn as this callback
      }
    });
  }
}
export class Player {
  constructor() {
    this.gameBoard = new Gameboard();
  }
  initializeGame(orientationCallback) {
    for (i = 2; i <= 6; i++) {
      const orientation = orientationCallback();
      let newShip = new Ship(i, orientation);
      const position = positionCallback();
      const row = position[0];
      const col = position[1];
      this.gameBoard = this.gameBoard.placeShip(row, col, newShip, gameBoard);
    }
  }
  // UI
  displayShips() {
    const table = document.querySelector("#board");
    this.gameBoard.board.forEach((value, i, gameBoard) => {
      gameBoard[i].forEach((value, j) => {
        let cell = document.createElement("div");
        cell.className = "cell";
        cell.id = `${i},${j}`;
        table.appendChild(cell);
      });
    });
    if (
      this.gameBoard.ships.length === 0 &&
      this.gameBoard.sunkShips.length === 0
    ) {
      return;
    }
    if (
      this.gameBoard.ships.length === 0 &&
      this.gameBoard.sunkShips.length !== 0
    ) {
      // all ships are sunk
    }
    if (this.gameBoard.ships.length !== 0) {
      // display ships and sunk ships
    }
  }
}
let player = new Player();
player.displayShips();
