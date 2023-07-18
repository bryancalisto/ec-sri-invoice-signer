import { expect } from "chai";
import Utils from "../../src/utils/utils";

describe('Given the getRandomInt function', () => {
  it('should return a random integer', () => {
    const result = Utils.getRandomInt();
    expect(typeof result === 'number' && !Number.isNaN(result) && result % 1 === 0).to.be.true;
  })
});