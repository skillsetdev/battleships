import { Gameboard } from "../game.js";
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
