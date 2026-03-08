import { describe, it, expect } from '@jest/globals';
import { buildXml, parseXml, validateDocumentType, validateXmlFeatures } from '../../src/utils/xml';
import { UnsupportedDocumentTypeError, UnsupportedXmlFeatureError, XmlFormatError } from '../../src/utils/errors';

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
  });
});

describe('Given the validateDocumentType function', () => {
  it.each([
    'factura',
    'liquidacionCompra',
    'notaDebito',
    'notaCredito',
    'comprobanteRetencion',
    'guiaRemision'
  ])('should not throw if the root element is %s', (docType) => {
    const supportedXml = `<${docType}><detalles></detalles></${docType}>`;
    expect(() => validateDocumentType(supportedXml)).not.toThrow();
  });

  it('should throw UnsupportedDocumentTypeError if root element is not supported', () => {
    const unsupportedXml = '<unknownType><data></data></unknownType>';
    expect(() => validateDocumentType(unsupportedXml)).toThrow(UnsupportedDocumentTypeError);
  });

  it('should throw XmlFormatError if XML format is invalid', () => {
    const invalidXml = '<factura';
    expect(() => validateDocumentType(invalidXml)).toThrow(XmlFormatError);
  });

  it('should throw XmlFormatError if no root element is found', () => {
    const emptyXml = '';
    expect(() => validateDocumentType(emptyXml)).toThrow(XmlFormatError);
  });
});

describe('Given the validateXmlFeatures function', () => {
  it('should not throw if XML features are supported', () => {
    const supportedXml = '<factura id="123"><detalle>data</detalle></factura>';
    expect(() => validateXmlFeatures(supportedXml)).not.toThrow();
  });

  it('should throw UnsupportedXmlFeatureError for DOCTYPE declarations', () => {
    const xmlWithDoctype = '<!DOCTYPE root SYSTEM "root.dtd"><root/>';
    expect(() => validateXmlFeatures(xmlWithDoctype)).toThrow(
      new UnsupportedXmlFeatureError(
        'DOCTYPE declarations',
        'DOCTYPE declarations are not supported. Remove any <!DOCTYPE> declarations from your XML.'
      )
    );
  });

  it('should throw UnsupportedXmlFeatureError for xml: prefixed attributes', () => {
    const xmlWithXmlAttr = '<factura xml:space="preserve"/>';
    expect(() => validateXmlFeatures(xmlWithXmlAttr)).toThrow(
      new UnsupportedXmlFeatureError(
        'xml-prefixed attributes',
        'Found attribute "xml:space=". Remove any xml: prefixed attributes from your XML.'
      )
    );
  });

  it('should throw UnsupportedXmlFeatureError for namespace declarations (xmlns:)', () => {
    const xmlWithXmlns = '<factura xmlns:ds="http://www.w3.org/2000/09/xmldsig#"/>';
    expect(() => validateXmlFeatures(xmlWithXmlns)).toThrow(
      new UnsupportedXmlFeatureError(
        'namespace declarations',
        'Namespace declarations (xmlns:) are not supported in the document root. This library adds the necessary namespaces automatically during signing.'
      )
    );
  });

  it('should throw UnsupportedXmlFeatureError for default xmlns declarations', () => {
    const xmlWithDefaultXmlns = '<factura xmlns="http://www.w3.org/2000/09/xmldsig#"/>';
    expect(() => validateXmlFeatures(xmlWithDefaultXmlns)).toThrow(
      new UnsupportedXmlFeatureError(
        'default namespace declarations',
        'Default xmlns declarations are not supported. This library adds the necessary namespaces automatically during signing.'
      )
    );
  });

  it('should throw UnsupportedXmlFeatureError for processing instructions other than <?xml', () => {
    const xmlWithPi = '<?pi target?><factura/>';
    expect(() => validateXmlFeatures(xmlWithPi)).toThrow(
      new UnsupportedXmlFeatureError(
        'processing instructions',
        'Found processing instruction "<?pi target?>". Only XML declarations (<?xml ... ?>) are supported.'
      )
    );
  });
});
