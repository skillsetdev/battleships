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
  getFullShipCoordinates(row, col, gameBoard, shipToCheck) {
    let coordinate = [row, col];
    let shipCoordinates = [];
    for (let i = 0; i < shipToCheck.length; i++) {
      if (
        !this.checkPlacementValidity(
          coordinate[0],
          coordinate[1],
          gameBoard.board
        )
      ) {
        return [];
      }
      shipCoordinates.push([...coordinate]);
      shipToCheck.isHorizontal
        ? (coordinate[1] = coordinate[1] + 1)
        : (coordinate[0] = coordinate[0] + 1);
    }
    return shipCoordinates;
  }
  checkFullShipPlacementValidity(row, col, gameBoard, shipToCheck) {
    let coordinate = [row, col];
    for (let i = 0; i < shipToCheck.length; i++) {
      if (
        !this.checkPlacementValidity(
          coordinate[0],
          coordinate[1],
          gameBoard.board
        )
      ) {
        console.log(`invalid on location: ${JSON.stringify(coordinate)}`);
        return false;
      }
      shipToCheck.isHorizontal
        ? (coordinate[1] = coordinate[1] + 1)
        : (coordinate[0] = coordinate[0] + 1);
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
  shipsToPlace = null;
  selectedShip = null;
  constructor() {
    this.gameBoard = new Gameboard();
  }
  startGame() {} //activated when all the ships are placed
  initializeGame() {
    for (let i = 2; i <= 6; i++) {
      const orientation = true; //add orientation callback

      let newShip = new Ship(i, orientation);

      console.log(newShip.length);
      const position = this.requireShipLocation(newShip);
      const row = position[0];
      const col = position[1];
      this.gameBoard = this.gameBoard.placeShip(row, col, newShip, gameBoard);
    }
  }
  generateArsenal() {
    const arsenalBox = document.querySelector("#arsenal");
    let arsenalImages = [
      "assets/Subject 1.png",
      "assets/Subject.png",
      "assets/Subject 4.png",
      "assets/Subject 5.png",
      "assets/Subject 3.png",
    ];
    if (this.shipsToPlace === null) {
      this.shipsToPlace = [];
      arsenalImages.forEach((link, i) => {
        let imageBox = document.createElement("img");
        imageBox.id = `${i + 2}-h`;
        imageBox.src = `${arsenalImages[i]}`;
        imageBox.style.backgroundRepeat = "no-repeat";
        imageBox.style.backgroundSize = "100% 100%";
        imageBox.style.height = "70px";
        imageBox.style.maxWidth = "280px";
        imageBox.style.width = "auto";
        imageBox.addEventListener("dblclick", (e) => {
          this.turnShip(e);
        });
        arsenalBox.appendChild(imageBox);
        let ship = new Ship(i + 2, true);
        this.shipsToPlace.push(ship);
      });
      console.log(this.shipsToPlace);
    } else {
      arsenalBox.innerHTML = "";
      this.shipsToPlace.forEach((ship, i) => {
        let imageBox = document.createElement("img");
        if (ship.isHorizontal) {
          imageBox.id = `${ship.length}-h`;
          imageBox.style.height = "70px";
          imageBox.style.maxWidth = "280px";
          imageBox.style.width = "auto";
        } else {
          imageBox.id = `${ship.length}-v`;
          imageBox.style.height = "70px";
          imageBox.style.maxWidth = "280px";
          imageBox.style.width = "auto";
          imageBox.style.transform = "rotate(90deg)";
        }
        imageBox.addEventListener("dblclick", (e) => {
          this.turnShip(e);
        });
        imageBox.src = `${arsenalImages[ship.length - 2]}`;
        imageBox.style.backgroundRepeat = "no-repeat";
        imageBox.style.backgroundSize = "100% 100%";
        arsenalBox.appendChild(imageBox);
      });
    }
  }
  turnShip(event) {
    const idSplit = event.target.id.split("-");
    this.shipsToPlace.forEach((ship) => {
      if (ship.length == idSplit[0]) {
        if (idSplit[1] == "h") {
          ship.isHorizontal = false;
        } else {
          ship.isHorizontal = true;
        }
      }
    });
    this.generateArsenal();
  }
  // UI
  displayBoardUI() {
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
  requireShipLocation(shipToPlace) {
    const table = document.querySelector("#board");
    table.addEventListener("mouseover", (e) => {
      this.handleMouseOver(e, shipToPlace);
    });
    table.addEventListener("mouseout", (e) => {
      this.handleMouseOut(e);
    });
    table.addEventListener("click", (e) => {
      this.handleClick(e, shipToPlace);
    });
  }
  handleMouseOver(event, ship) {
    if (event.target.tagName === "DIV") {
      const hoveredCellLocation = event.target.id.split(",");
      let hoveredCellLocationInt = [];
      hoveredCellLocation.forEach((item) => {
        const intItem = parseInt(item);
        hoveredCellLocationInt.push(intItem);
      });
      if (
        this.gameBoard.checkFullShipPlacementValidity(
          hoveredCellLocationInt[0],
          hoveredCellLocationInt[1],
          this.gameBoard,
          ship
        )
      ) {
        let coordinates = this.gameBoard.getFullShipCoordinates(
          hoveredCellLocationInt[0],
          hoveredCellLocationInt[1],
          this.gameBoard,
          ship
        );
        coordinates.forEach((coordinate) => {
          const cellCoordinates = `${coordinate[0]},${coordinate[1]}`;
          let cell = document.getElementById(cellCoordinates);
          cell.style.backgroundColor = "green";
        });
      } else {
        event.target.style.backgroundColor = "red";
      }
    }
  }
  handleMouseOut(event) {
    const table = document.querySelector("#board");
    let cells = [...table.querySelectorAll("div")];
    cells.forEach((cell) => {
      cell.style.backgroundColor = "transparent";
    });
    ///////////////////////////////////////////////
    // then rebuild all the existing ships!!!
    ///////////////////////////////////////////////
  }
  handleClick(event, ship) {
    if (event.target.tagName === "DIV") {
      const clickedCellLocation = event.target.id.split(",");
      let clickedCellLocationInt = [];
      clickedCellLocation.forEach((item) => {
        const intItem = parseInt(item);
        clickedCellLocationInt.push(intItem);
      });
      if (
        this.gameBoard.checkFullShipPlacementValidity(
          clickedCellLocationInt[0],
          clickedCellLocationInt[1],
          this.gameBoard,
          ship
        )
      ) {
        return clickedCellLocationInt;
      } else {
        throw new Error("Cannot Place YOUR SHIP HERE!!!");
      }
    }
  }
}
let player = new Player();
player.displayBoardUI();
player.generateArsenal();
player.initializeGame();
