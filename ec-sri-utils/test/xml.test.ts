import { buildXml, parseXml } from '../src/utils/xml';

const xml = '<factura Id="comprobante"><detalle Id="detalle">data</detalle></factura>';

const obj = [
  {
    ":@": {
      "@_Id": "comprobante"
    },
    "factura": [
      {
        ":@": {
          "@_Id": "detalle"
        },
        "detalle": [
          {
            "#text": "data"
          }
        ]
      }
    ]
  }
];

describe('Given the parseXml function', () => {
  it('should return object containing the parsed xml data', () => {
    const result = parseXml(xml);
    expect(result).toEqual(obj);
  });

  it.todo('should throw error if xml is invalid');
});

describe('Given the buildXml function', () => {
  it('should return xml representing the input object', () => {
    const result = buildXml(obj);
    expect(result).toEqual(xml);
  })

  it.todo('should throw error if input object is invalid');
})