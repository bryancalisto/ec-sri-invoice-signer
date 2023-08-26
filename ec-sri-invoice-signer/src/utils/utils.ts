import * as crypto from 'crypto';

/**
 * @returns A random UUID v4.
 */
const getRandomUuid = (): string => {
  return crypto.randomUUID();
}

/**
 * @returns The current date in format `YYYY-MM-DDTHH:mm:ss.sss[-+]HH:mm`.
 */
const getDate = (): string => {
  const date = new Date();

  const offsetRelativeToUTCInMinutes = date.getTimezoneOffset();
  const offsetHours = Math.trunc(offsetRelativeToUTCInMinutes / 60);
  const offsetMinutes = offsetRelativeToUTCInMinutes % 60;
  const formattedOffset = `${offsetRelativeToUTCInMinutes > 0 ? '-' : '+'}${String(Math.abs(offsetHours)).padStart(2, '0')}:${String(Math.abs(offsetMinutes)).padStart(2, '0')}`;

  return new Date(date.getTime() + offsetRelativeToUTCInMinutes * 60 * 1000).toISOString().replace('Z', formattedOffset);
}

export default {
  getDate,
  getRandomUuid
};