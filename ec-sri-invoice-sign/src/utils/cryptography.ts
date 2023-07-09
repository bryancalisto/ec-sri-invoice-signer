import * as crypto from 'crypto';

const sign = (data: string, privateKey: string) => {
  const signer = crypto.createSign('RSA-SHA1');
  signer.update(data);
  const res = signer.sign(privateKey, 'base64');
  return res;
}

const getSHA1Hash = (data: string) => {
  return crypto.createHash('sha1').update(data).digest('base64');
}

export { sign, getSHA1Hash }