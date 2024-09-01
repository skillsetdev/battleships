import { Ship } from "./game.js";

let ship;
beforeEach(() => {
  ship = new Ship(3);
});
test("Counts the hits", () => {
  ship.hit();
  ship.hit();
  expect(ship.timesHit).toBe(2);
});
test("Checks for sinking", () => {
  ship.hit();
  ship.isSunk();
  expect(ship.isUnderWater).toBe(false);
  ship.hit();
  ship.isSunk();
  ship.hit();
  ship.isSunk();
  expect(ship.isUnderWater).toBe(true);
});
