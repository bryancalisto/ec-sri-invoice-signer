import { describe, it, expect, afterEach, jest } from '@jest/globals';
import * as Utils from '../../src/utils/utils';

describe('Given the getRandomInt function', () => {
  it('should return a random UUID v4', () => {
    const result = Utils.getRandomUuid();
    expect(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(result)).toBe(true);
  });
});

describe('Given the getDate function', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return the current date correctly formatted', () => {
    const result = Utils.getDate();
    expect(/^20\d{2}-[0-3]\d-[0-3]\dT[0-2]\d:[0-6]\d:[0-6]\d\.\d{3}[-+][0-2]\d:[0-6]\d$/.test(result)).toBe(true);
  });

  it('should return the current date in local time', () => {
    jest.useFakeTimers({ now: 1694787394044 }); // 2023-09-15T14:16:34.044Z
    const result = Utils.getDate();
    // UTC-5. America/Guayaquil timezone is set in the server. Configure this locally if you are in a different timezone and
    // want to run this test reliably
    expect(result).toEqual('2023-09-15T09:16:34.044-05:00');
  });
});
