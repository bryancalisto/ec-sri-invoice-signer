import { describe, it, expect } from '@jest/globals';
import { buildXml, parseXml } from '../../src/utils/xml';

const xml = `<factura xmlns:t1="http://www.thing1.com" xmlns:t2="http://www.thing2.com" Id="comprobante">
  <detalle Id="detalle">data</detalle>
</factura>`;

const obj = [
  {
    ":@": {
      "@_xmlns:t1": "http://www.thing1.com",
      "@_xmlns:t2": "http://www.thing2.com",
      "@_Id": "comprobante"
    },
    "factura": [
      {
        "#text": "\n  "
      },
      {
        ":@": {
          "@_Id": "detalle"
        },
        "detalle": [
          {
            "#text": "data"
          }
        ]
      },
      {
        "#text": "\n"
      }
    ]
  }
];

describe('Given the parseXml function', () => {
  it('should return object containing the parsed xml data', () => {
    const result = parseXml(xml);
    expect(result).toEqual(obj);
  });

  it('should throw error if xml is invalid', () => {
    expect(() => parseXml('<a id="abc>')).toThrow();
  });
});

describe('Given the buildXml function', () => {
  it('should return xml representing the input object', () => {
    const result = buildXml(obj);
    expect(result).toEqual(xml);
  })
})
