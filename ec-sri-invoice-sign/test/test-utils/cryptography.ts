import * as crypto from 'crypto';

export const generateKeyPair = () => {
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem'
    }
  });
}

export const verifySignature = (preSignData: string, publicKey: string, signature: string) => {
  return crypto.createVerify('RSA-SHA1').update(preSignData, 'utf-8').end().verify(publicKey, signature, 'base64');
}
