import * as crypto from 'crypto';

const sign = (data: string, privateKey: string) => {
  const signer = crypto.createSign('RSA-SHA1');
  signer.update(data);
  const res = signer.sign(privateKey, 'base64');
  return res;
}

export { sign }