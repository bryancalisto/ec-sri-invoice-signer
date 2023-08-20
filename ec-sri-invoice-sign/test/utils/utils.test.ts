import { expect } from "chai";
import Utils from "../../src/utils/utils";

describe('Given the getRandomInt function', () => {
  it('should return a random UUID v4', () => {
    const result = Utils.getRandomUuid();
    expect(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(result)).to.be.true;
  });
});

describe('Given the getDate function', () => {
  it('should return the current date correctly formatted', () => {
    const result = Utils.getDate();
    expect(/^20\d{2}-[0-3]\d-[0-3]\dT[0-2]\d:[0-6]\d:[0-6]\d\.\d{3}[-+][0-2]\d:[0-6]\d$/.test(result)).to.be.true;
  });
});