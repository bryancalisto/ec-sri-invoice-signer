import { expect } from 'chai';
import { getHash, sign } from '../../src/utils/cryptography';
import { generateKeyPair, verifySignature } from '../test-utils/cryptography';

const data = '<factura Id="comprobante"><detalle Id="detalle">data</detalle></factura>';

describe('Given the sign function', () => {
  it('should return the signature for the input data', () => {
    const { privateKey, publicKey } = generateKeyPair();
    const resultSignature = sign(data, privateKey);
    const verifiedSuccessfully = verifySignature(data, publicKey, resultSignature);
    expect(verifiedSuccessfully).to.be.true;
  });
});

describe('Given the getHash function', () => {
  it('should return the SHA1 hash of the input string expressed in base64', () => {
    const result = getHash('something');
    expect(result).equal('GvF+c3IdvgxAARuC7Uuxp9vjzik=');
  });
});
