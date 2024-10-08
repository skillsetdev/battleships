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
    return this.isUnderWater;
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
    if (col >= board[row].length) {
      return false;
    }
    const boardSize = board.length;
    const isCellOccupied = (r, c) => {
      return (
        r >= 0 &&
        r < boardSize &&
        c >= 0 &&
        c < board[row].length &&
        board[r][c] !== null
      );
    };
    if (
      isCellOccupied(row + 1, col) || // Down
      isCellOccupied(row - 1, col) || // Up
      isCellOccupied(row, col + 1) || // Right
      isCellOccupied(row, col - 1) || // Left
      isCellOccupied(row + 1, col + 1) || // Down-Right
      isCellOccupied(row + 1, col - 1) || // Down-Left
      isCellOccupied(row - 1, col + 1) || // Up-Right
      isCellOccupied(row - 1, col - 1) // Up-Left
    ) {
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
      ship.coordinates.push(`${coordinate[0]},${coordinate[1]}`);
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
  isYourTurn = true;
  nextPreferrableEnemyAttackPosition = null; //change to saving last hit position
  constructor() {
    this.gameBoard = new Gameboard();
    this.enemyBoard = new Gameboard();
  }
  startGame() {
    const arsenalText = document.querySelector("#arsenal-text");
    arsenalText.parentElement.innerHTML = "";
    this.generateEnemyShips();
    this.displayEnemyBoardUI();
  } //activated when all the ships are placed
  generateEnemyShips() {
    for (let i = 2; i <= 6; i++) {
      let enemyShip = new Ship(i, this.generateRandomOrientation());
      let randomLocation = this.generateRandomPosition();
      while (
        !this.enemyBoard.checkFullShipPlacementValidity(
          randomLocation[0],
          randomLocation[1],
          this.enemyBoard,
          enemyShip
        )
      ) {
        randomLocation = this.generateRandomPosition();
      }
      this.enemyBoard.placeShip(
        randomLocation[0],
        randomLocation[1],
        enemyShip,
        this.enemyBoard.board
      );
    }
  }
  generateRandomOrientation() {
    const randomValue = Math.random();
    if (randomValue > 0.5) {
      return true;
    } else {
      return false;
    }
  }
  generateRandomPosition() {
    const randomRow = Math.floor(Math.random() * 10);
    const randomCol = Math.floor(Math.random() * 10);
    return [randomRow, randomCol];
  }
  displayEnemyBoardUI() {
    const myText = document.querySelector("#my-text");
    myText.innerHTML = "Your Board";
    myText.style.color = "blue";
    const enemyText = document.querySelector("#enemy-text");
    enemyText.innerHTML = "Start by clicking on enemy board to attack";
    const table = document.querySelector("#board");
    const colnums = document.querySelector("#col-nums");
    const rownums = document.querySelector("#row-nums");
    const enemyTable = document.querySelector("#enemy-board");
    table.style.height = "min(50vw, 50vh)";
    table.style.width = "min(50vw, 50vh)";
    colnums.innerHTML = "";
    rownums.innerHTML = "";
    enemyTable.style.height = "min(50vw, 50vh)";
    enemyTable.style.width = "min(50vw, 50vh)";
    enemyTable.innerHTML = "";
    this.enemyBoard.board.forEach((value, i, enemyBoard) => {
      enemyBoard[i].forEach((value, j) => {
        let cell = document.createElement("div");
        cell.className = "cell";
        cell.id = `${i},${j},e`;
        cell.addEventListener("click", (e) => {
          this.attack(e);
        });
        this.enemyBoard.ships.forEach((ship) => {
          if (ship.coordinates.includes(`${i},${j}`)) {
            cell.style.backgroundColor = "rgb(66, 111, 113)";
            if (ship.coordinates[0] == `${i},${j}` && !ship.isHorizontal) {
              cell.style.borderTopLeftRadius = "50% 100%";
              cell.style.borderTopRightRadius = "50% 100%";
            }
            if (
              ship.coordinates[ship.length - 1] == `${i},${j}` &&
              !ship.isHorizontal
            ) {
              cell.style.borderBottomLeftRadius = "25%";
              cell.style.borderBottomRightRadius = "25%";
            }
            if (ship.coordinates[0] == `${i},${j}` && ship.isHorizontal) {
              cell.style.borderTopLeftRadius = "25%";
              cell.style.borderBottomLeftRadius = "25%";
            }
            if (
              ship.coordinates[ship.length - 1] == `${i},${j}` &&
              ship.isHorizontal
            ) {
              cell.style.borderTopRightRadius = "100% 50%";
              cell.style.borderBottomRightRadius = "100% 50%";
            }
          }
        });
        enemyTable.appendChild(cell);
      });
    });
    if (
      this.enemyBoard.ships.length === 0 &&
      this.enemyBoard.sunkShips.length === 0
    ) {
      return;
    }
    if (
      this.enemyBoard.ships.length === 0 &&
      this.enemyBoard.sunkShips.length !== 0
    ) {
      // all ships are sunk
    }
    if (this.enemyBoard.ships.length !== 0) {
      // display ships and sunk ships
    }
  }
  attack(event) {
    const enemyText = document.querySelector("#enemy-text");
    if (this.isYourTurn) {
      const cell = event.target;
      const id = event.target.id.split(",");
      for (let i = 0; i < this.enemyBoard.ships.length; i++) {
        let ship = this.enemyBoard.ships[i];
        if (ship.coordinates.includes(`${id[0]},${id[1]}`)) {
          cell.innerHTML = "";
          let explosionImg = document.createElement("img");
          explosionImg.src =
            "./assets/360_F_68741957_Bv0amMRCjorX3rTXdStKM0wbdKuaDe3F.jpg";
          explosionImg.style.width = "100%";
          explosionImg.style.height = "100%";
          cell.appendChild(explosionImg);
          ship.hit();
          enemyText.innerHTML = "Enemy's Ship is hit!";
          if (ship.isSunk()) {
            enemyText.innerHTML = "Enemy's Ship is sunk!!!";
            console.log("sunk");
            ship.coordinates.forEach((coordinate) => {
              let rowCol = coordinate.split(",");
              let cello = document.getElementById(
                `${rowCol[0]},${rowCol[1]},e`
              );
              cello.firstChild.src = "./assets/fireball-422746_1280.webp";
            });
            this.enemyBoard.sunkShips.push(ship);
            if (this.enemyBoard.sunkShips.length >= 5) {
              console.log("YOU WON!!!");
            }
          }
          break;
        } else {
          this.enemyBoard.missedShots.push(`${id[0]},${id[1]}`);
          cell.innerHTML = "";
          let splashImg = document.createElement("img");
          splashImg.src = "./assets/istockphoto-1129413102-612x612.jpg";
          splashImg.style.width = "100%";
          splashImg.style.height = "100%";
          cell.appendChild(splashImg);
          enemyText.innerHTML = "You missed :(";
        }
      }
      const newCell = cell.cloneNode(true);
      cell.parentNode.replaceChild(newCell, cell); // clone node to remove event listeners
      this.isYourTurn = false;
      setTimeout(() => {
        this.enemyAttack();
      }, 2000);
    }
  }
  enemyAttack() {
    if (!this.isYourTurn) {
      const myText = document.querySelector("#my-text");
      const enemyText = document.querySelector("#enemy-text");
      enemyText.innerHTML = "Enemy is attacking";
      enemyText.style.color = "red";
      setTimeout(() => {
        let attackPosition = this.generateRandomPosition();
        while (
          this.gameBoard.missedShots.includes(
            `${attackPosition[0]},${attackPosition[1]}`
          )
        ) {
          attackPosition = this.generateRandomPosition(); //[row, col]
        }
        if (this.nextPreferrableEnemyAttackPosition !== null) {
          attackPosition = this.nextPreferrableEnemyAttackPosition;
        }
        let cell = document.getElementById(
          `${attackPosition[0]},${attackPosition[1]}`
        );
        for (let i = 0; i < this.gameBoard.ships.length; i++) {
          let ship = this.gameBoard.ships[i];
          if (
            ship.coordinates.includes(
              `${attackPosition[0]},${attackPosition[1]}`
            )
          ) {
            cell.innerHTML = "";
            let explosionImg = document.createElement("img");
            explosionImg.src =
              "./assets/360_F_68741957_Bv0amMRCjorX3rTXdStKM0wbdKuaDe3F.jpg";
            explosionImg.style.width = "100%";
            explosionImg.style.height = "100%";
            cell.appendChild(explosionImg);
            ship.hit();
            myText.innerHTML = "Your Ship is hit!";
            if (ship.isSunk()) {
              this.nextPreferrableEnemyAttackPosition = null;
              myText.innerHTML = "Your Ship is sunk!!!";
              console.log("sunk");
              ship.coordinates.forEach((coordinate) => {
                let rowCol = coordinate.split(",");
                let cello = document.getElementById(
                  `${rowCol[0]},${rowCol[1]}`
                );
                cello.firstChild.src = "./assets/fireball-422746_1280.webp";
              });
              this.gameBoard.sunkShips.push(ship);
              if (this.gameBoard.sunkShips.length >= 5) {
                console.log("YOU LOST!!!");
              }
            }
            break;
          } else {
            this.gameBoard.missedShots.push(
              `${attackPosition[0]},${attackPosition[1]}`
            );
            cell.innerHTML = "";
            let splashImg = document.createElement("img");
            splashImg.src = "./assets/istockphoto-1129413102-612x612.jpg";
            splashImg.style.width = "100%";
            splashImg.style.height = "100%";
            cell.appendChild(splashImg);
            myText.innerHTML = "Enemy missed";
          }
        }
        this.isYourTurn = true;
        setTimeout(() => {
          myText.innerHTML = "Your Board";
          enemyText.style.color = "black";
          enemyText.innerHTML = "Your turn, hit him!";
          this.attack();
        }, 2000);
      }, 2000);
    }
  }
  generateArsenal() {
    const arsenalText = document.querySelector("#arsenal-text");
    arsenalText.innerHTML = "Select a Ship";
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
        let shipBox = document.createElement("div");
        shipBox.className = "ship-box";
        let turnIcon = document.createElement("img");
        turnIcon.src =
          "./assets/rotate_left_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
        let imageBox = document.createElement("img");
        imageBox.id = `${i + 2}-h`;
        imageBox.src = `${arsenalImages[i]}`;
        imageBox.style.backgroundRepeat = "no-repeat";
        imageBox.style.backgroundSize = "100% 100%";
        imageBox.style.height = "70px";
        imageBox.style.maxWidth = "280px";
        imageBox.style.width = "auto";
        imageBox.addEventListener("click", (e) => {
          this.selectShip(e);
        });
        turnIcon.addEventListener("click", (e) => {
          this.turnShip(e);
        });
        shipBox.appendChild(imageBox);
        shipBox.appendChild(turnIcon);
        arsenalBox.appendChild(shipBox);
        let ship = new Ship(i + 2, true);
        this.shipsToPlace.push(ship);
      });
    } else {
      arsenalBox.innerHTML = "";
      this.shipsToPlace.forEach((ship, i) => {
        let shipBox = document.createElement("div");
        shipBox.className = "ship-box";
        let turnIcon = document.createElement("img");
        turnIcon.src =
          "./assets/rotate_left_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg";
        let imageBox = document.createElement("img");
        if (ship.isHorizontal) {
          imageBox.id = `${ship.length}-h`;
          imageBox.style.height = "70px";
          imageBox.style.maxWidth = "280px";
          imageBox.style.width = "auto";
        } else {
          imageBox.id = `${ship.length}-v`;
          shipBox.style.width = "auto";
          shipBox.style.height = `${ship.length * 70}px`;
          imageBox.style.height = "70px";
          imageBox.style.maxWidth = "280px";
          imageBox.style.width = "auto";
          imageBox.style.transform = "rotate(270deg)";
        }
        imageBox.addEventListener("click", (e) => {
          this.selectShip(e);
        });
        turnIcon.addEventListener("click", (e) => {
          this.turnShip(e);
        });
        imageBox.src = `${arsenalImages[ship.length - 2]}`;
        imageBox.style.backgroundRepeat = "no-repeat";
        imageBox.style.backgroundSize = "100% 100%";
        if (this.selectedShip !== null) {
          if (this.selectedShip.length == ship.length) {
            shipBox.style.border = "3px solid green";
          }
        }
        shipBox.appendChild(imageBox);
        shipBox.appendChild(turnIcon);
        arsenalBox.appendChild(shipBox);
      });
    }
  }
  selectShip(event) {
    const arsenalText = document.querySelector("#arsenal-text");
    arsenalText.innerHTML = "Place the Ship";
    if (this.selectedShip !== null) {
      const shipBoxes = document.querySelectorAll(".ship-box");
      shipBoxes.forEach((shipBox) => {
        shipBox.style.border = "1px solid black";
      });
    }
    const targetID = event.target.id.split("-");
    const targetLength = targetID[0];
    this.shipsToPlace.forEach((ship) => {
      if (ship.length == targetLength) {
        this.selectedShip = ship;
        console.log(this.selectedShip);
      }
    });
    event.target.parentElement.style.border = "3px solid green";
    this.requireShipLocation(this.selectedShip);
  }
  turnShip(event) {
    const shipIcon = event.target.parentElement.firstChild;
    const idSplit = shipIcon.id.split("-");
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
    table.innerHTML = "";
    this.gameBoard.board.forEach((value, i, gameBoard) => {
      gameBoard[i].forEach((value, j) => {
        let cell = document.createElement("div");
        cell.className = "cell";
        cell.id = `${i},${j}`;

        this.gameBoard.ships.forEach((ship) => {
          if (ship.coordinates.includes(`${i},${j}`)) {
            cell.style.backgroundColor = "rgb(66, 111, 113)";
            if (ship.coordinates[0] == `${i},${j}` && !ship.isHorizontal) {
              cell.style.borderTopLeftRadius = "50% 100%";
              cell.style.borderTopRightRadius = "50% 100%";
            }
            if (
              ship.coordinates[ship.length - 1] == `${i},${j}` &&
              !ship.isHorizontal
            ) {
              cell.style.borderBottomLeftRadius = "25%";
              cell.style.borderBottomRightRadius = "25%";
            }
            if (ship.coordinates[0] == `${i},${j}` && ship.isHorizontal) {
              cell.style.borderTopLeftRadius = "25%";
              cell.style.borderBottomLeftRadius = "25%";
            }
            if (
              ship.coordinates[ship.length - 1] == `${i},${j}` &&
              ship.isHorizontal
            ) {
              cell.style.borderTopRightRadius = "100% 50%";
              cell.style.borderBottomRightRadius = "100% 50%";
            }
          }
        });
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
  cancelLocationRequest() {
    const table = document.querySelector("#board");
    const newTable = table.cloneNode(true);
    table.parentNode.replaceChild(newTable, table);
    // Remove all event listeners by cloning the element
  }
  requireShipLocation(shipToPlace) {
    const table = document.querySelector("#board");
    // Remove all event listeners by cloning the element
    const newTable = table.cloneNode(true);
    table.parentNode.replaceChild(newTable, table);

    newTable.addEventListener("mouseover", (e) => {
      this.handleMouseOver(e, shipToPlace);
    });
    newTable.addEventListener("mouseout", (e) => {
      this.handleMouseOut(e);
    });
    newTable.addEventListener("click", (e) => {
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
    this.displayBoardUI();
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
        if (this.shipsToPlace.length !== 0) {
          this.shipsToPlace.forEach((ship, i, toPlaceArray) => {
            if (ship.length == this.selectedShip.length) {
              this.gameBoard.placeShip(
                clickedCellLocationInt[0],
                clickedCellLocationInt[1],
                this.selectedShip,
                this.gameBoard.board
              );
              toPlaceArray.splice(i, 1);
              this.generateArsenal();
            }
            this.displayBoardUI();
            this.cancelLocationRequest();
          });
        }
        if (this.shipsToPlace.length === 0) {
          this.startGame();
        }
      } else {
        throw new Error("Cannot Place YOUR SHIP HERE!!!");
      }
    }
  }
}
let player = new Player();
player.displayBoardUI();
player.generateArsenal();
