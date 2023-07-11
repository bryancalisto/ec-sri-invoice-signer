import { expect } from 'chai';
import { getSHA1Hash, sign } from '../src/utils/cryptography';
import { generateKeyPair, verifySignature } from './utils/cryptography';

const data = '<factura Id="comprobante"><detalle Id="detalle">data</detalle></factura>';

describe('Given the sign function', () => {
  it('should return the signature for the input data', () => {
    const { privateKey, publicKey } = generateKeyPair();
    const resultSignature = sign(data, privateKey);
    const verifiedSuccessfully = verifySignature(data, publicKey, resultSignature);
    expect(verifiedSuccessfully).to.be.true;
  });
});

describe('Given the getSHA1Hash function', () => {
  it('should return the SHA1 hash of the input string expressed in base64', () => {
    const result = getSHA1Hash('something');
    expect(result).equal('GvF+c3IdvgxAARuC7Uuxp9vjzik=');
  });
});
