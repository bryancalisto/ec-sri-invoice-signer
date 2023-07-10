import * as crypto from 'crypto';

const getRandomInt = (max: number = 10000) => {
  return crypto.randomInt(max);
}

export {
  getRandomInt
};