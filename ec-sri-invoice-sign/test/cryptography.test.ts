import { expect } from 'chai';
import { getSHA1Hash, sign } from '../src/utils/cryptography';

const xml = '<factura Id="comprobante"><detalle Id="detalle">data</detalle></factura>';

describe('Given the sign function', () => {
  it.skip('should return the signature for the input data', () => {
    const result = sign(xml, '111');
    console.log('RESS', result);

    // expect(result).toEqual(obj);
  });
});

describe('Given the getSHA1Hash function', () => {
  it('should return the SHA1 hash of the input string expressed in base64', () => {
    const result = getSHA1Hash('something');
    expect(result).equal('GvF+c3IdvgxAARuC7Uuxp9vjzik=');
  });
});
