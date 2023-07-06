import { sign } from '../src/utils/sign';

const xml = '<factura Id="comprobante"><detalle Id="detalle">data</detalle></factura>';

describe('Given the sign function', () => {
  it('should return the signature for the input data', () => {
    const result = sign(xml, '111');
    console.log('RESS', result);

    // expect(result).toEqual(obj);
  });
});
