export class Ship {
  timesHit = 0;
  isUnderWater = false;
  constructor(length) {
    this.length = length;
  }
  hit() {
    this.timesHit = this.timesHit + 1;
  }
  isSunk() {
    this.isUnderWater = this.timesHit >= this.length;
  }
}
