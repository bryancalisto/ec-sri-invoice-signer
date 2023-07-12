import { expect } from "chai";
import { getRandomInt } from "../../src/utils/utils";

describe('Given the getRandomInt function', () => {
  it('should return a random integer', () => {
    const result = getRandomInt();
    expect(typeof result === 'number' && !Number.isNaN(result) && result % 1 === 0).to.be.true;
  })
});