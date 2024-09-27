import { jest } from "@jest/globals";
import { Gameboard, Ship } from "../game.js";
let gameboard;
beforeEach(() => {
  gameboard = new Gameboard(3);
});
test("initializes a proper gameboard", () => {
  expect(gameboard.initializeBoard(3)).toEqual([
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ]);
});
test("clears the board", () => {
  let board = [
    [[], [], []],
    [[], [], []],
    [[], [], []],
  ];
  gameboard.clearBoard(board);
  expect(board).toEqual([
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ]);
});
test("checks if the cell is within the bounds", () => {
  let board = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
  expect(gameboard.checkPlacementValidity(10, 4, board)).toBeFalsy();
  expect(gameboard.checkPlacementValidity(1, 2, board)).toBeTruthy();
});
test("places a horizontal ship correctly", () => {
  let board = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
  let ship = new Ship(2, true);
  expect(gameboard.placeShip(0, 1, ship, board)).toEqual([
    [null, "2", "2"],
    [null, null, null],
    [null, null, null],
  ]);
});
test("places a verticl ship correctly", () => {
  let board = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
  let ship = new Ship(2, false);
  expect(gameboard.placeShip(0, 1, ship, board)).toEqual([
    [null, "2", null],
    [null, "2", null],
    [null, null, null],
  ]);
  console.log(JSON.stringify(gameboard.ships));
  const hitMockFn = jest.fn((row, col) => {
    console.log(`A ship is hit at position ${row} x ${col}`);
  });
  const missMockFn = jest.fn((row, col) => {
    console.log(`Striked water at position ${row} x ${col}`);
  });
  const sunkMockFn = jest.fn(() => {
    console.log(`Ship is sunk`);
  });
  gameboard.receiveAttack(1, 1, hitMockFn, missMockFn, sunkMockFn);
  gameboard.receiveAttack(0, 1, hitMockFn, missMockFn, sunkMockFn);
});
test("checks ships's full length location", () => {
  let board = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
  let ship = new Ship(2, true);
  expect(gameboard.checkFullShipPlacement(1, 1, board, ship).toBeTruthy);
});
