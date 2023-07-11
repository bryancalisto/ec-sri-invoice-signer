import * as crypto from 'crypto';

const sign = (data: string, privateKey: string) => {
  return crypto.createSign('RSA-SHA1').update(data, 'utf-8').end().sign(privateKey, 'base64');
}

const getSHA1Hash = (data: string) => {
  return crypto.createHash('sha1').update(data, 'utf-8').end().digest('base64');
}

export { sign, getSHA1Hash }