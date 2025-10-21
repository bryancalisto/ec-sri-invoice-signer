import { describe, it, expect, afterEach, jest } from '@jest/globals';
import * as Utils from '../../src/utils/utils';
import { signCreditNoteXml, signDebitNoteXml, signInvoiceXml } from '../../src/signature/signature';
import fs from 'fs';
import path from 'path';

describe('Given the signInvoice function', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should generate the signature for the invoice and put it at the end of the invoice', () => {
    const invoiceXml = fs.readFileSync(path.resolve('test/test-data/invoice/original.xml')).toString();
    const pkcs12Data = fs.readFileSync(path.resolve('test/test-data/pkcs12/signature.p12')).toString('base64');
    const signedInvoice = fs.readFileSync(path.resolve('test/test-data/invoice/signed.xml')).toString();
    // Keep variable data constant
    jest.spyOn(Utils, 'getDate').mockReturnValue('2024-04-18T14:34:32.878-05:00');
    jest.spyOn(Utils, 'getRandomUuid').mockReturnValue('5bdfc32d-a37f-47c3-90fe-49f5a093b7bf');

    const result = signInvoiceXml(invoiceXml, pkcs12Data, { pkcs12Password: '' });
    expect(result).toEqual(signedInvoice);
  });

  it('should generate the signature for the invoice and put it at the end of the invoice with a certificate that has a issuer name with E field (email)', () => {
    const invoiceXml = fs.readFileSync(path.resolve('test/test-data/invoice/original.xml')).toString();
    const pkcs12Data = fs.readFileSync(path.resolve('test/test-data/invoice/edge-cases/certificate-with-email-address/pkcs12/signature.p12')).toString('base64');
    const signedInvoice = fs.readFileSync(path.resolve('test/test-data/invoice/edge-cases/certificate-with-email-address/signed-invoice.xml')).toString();
    // Keep variable data constant
    jest.spyOn(Utils, 'getDate').mockReturnValue('2024-04-18T14:34:32.878-05:00');
    jest.spyOn(Utils, 'getRandomUuid').mockReturnValue('5bdfc32d-a37f-47c3-90fe-49f5a093b7bf');

    const result = signInvoiceXml(invoiceXml, pkcs12Data, { pkcs12Password: '' });
    expect(result).toEqual(signedInvoice);
  });
});

describe('Given the signDebitNote function', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should generate the signature for the invoice and put it at the end of the invoice', () => {
    const original = fs.readFileSync(path.resolve('test/test-data/debit-note/original.xml')).toString();
    const pkcs12Data = fs.readFileSync(path.resolve('test/test-data/pkcs12/signature.p12')).toString('base64');
    const signed = fs.readFileSync(path.resolve('test/test-data/debit-note/signed.xml')).toString();
    // Keep variable data constant
    jest.spyOn(Utils, 'getDate').mockReturnValue('2024-04-18T14:34:32.878-05:00');
    jest.spyOn(Utils, 'getRandomUuid').mockReturnValue('5bdfc32d-a37f-47c3-90fe-49f5a093b7bf');

    const result = signDebitNoteXml(original, pkcs12Data, { pkcs12Password: '' });
    expect(result).toEqual(signed);
  });
});

describe('Given the signCreditNote function', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should generate the signature for the invoice and put it at the end of the invoice', () => {
    const original = fs.readFileSync(path.resolve('test/test-data/credit-note/original.xml')).toString();
    const pkcs12Data = fs.readFileSync(path.resolve('test/test-data/pkcs12/signature.p12')).toString('base64');
    const signed = fs.readFileSync(path.resolve('test/test-data/credit-note/signed.xml')).toString();
    // Keep variable data constant
    jest.spyOn(Utils, 'getDate').mockReturnValue('2024-04-18T14:34:32.878-05:00');
    jest.spyOn(Utils, 'getRandomUuid').mockReturnValue('5bdfc32d-a37f-47c3-90fe-49f5a093b7bf');

    const result = signCreditNoteXml(original, pkcs12Data, { pkcs12Password: '' });
    expect(result).toEqual(signed);
  });
});

describe('Given the signing functions and an invalid input', () => {
  const pkcs12Data = fs.readFileSync(path.resolve('test/test-data/pkcs12/signature.p12')).toString('base64');
  const invoiceXml = fs.readFileSync(path.resolve('test/test-data/invoice/original.xml')).toString();

  it('should throw XmlFormatError for a malformed XML', () => {
    const malformedXml = '<factura><campo>valor</campo'; // Truly malformed XML
    expect(() => signInvoiceXml(malformedXml, pkcs12Data, { pkcs12Password: '' })).toThrow(`There's a format error in your XML file`);
  });

  it('should throw UnsuportedPkcs12Error for an invalid pkcs12', () => {
    const invalidPkcs12 = 'not a valid pkcs12';
    try {
      signInvoiceXml(invoiceXml, invalidPkcs12, { pkcs12Password: '' });
    } catch (error) {
      console.log(error)
    }
    expect(() => signInvoiceXml(invoiceXml, invalidPkcs12, { pkcs12Password: '' })).toThrow('The used .p12 file is not supported: Too few bytes to parse DER.');
  });

  it('should throw UnsupportedXmlFeatureError for XML with comments', () => {
    const xmlWithComment = '<!-- comment --><factura id="comprobante" version="1.0.0"></factura>'; // Valid XML with comment
    expect(() => signInvoiceXml(xmlWithComment, pkcs12Data, { pkcs12Password: '' })).toThrow(`There's a format error in your XML file`);
  });

  it('should not throw UnsupportedXmlFeatureError for XML with declaration', () => {
    const xmlWithDeclaration = '<?xml version="1.0" encoding="UTF-8"?><factura id="comprobante" version="1.0.0"></factura>'; // Valid XML with declaration
    expect(() => signInvoiceXml(xmlWithDeclaration, pkcs12Data, { pkcs12Password: '' })).not.toThrow();
  });

  it('should throw UnsupportedXmlFeatureError for XML with DOCTYPE', () => {
    const xmlWithDoctype = '<!DOCTYPE factura><factura id="comprobante"></factura>'; // Valid XML with DOCTYPE
    expect(() => signInvoiceXml(xmlWithDoctype, pkcs12Data, { pkcs12Password: '' })).toThrow('Unsupported XML feature: DOCTYPE declarations. DOCTYPE declarations are not supported. Remove any <!DOCTYPE> declarations from your XML.');
  });

  it('should throw UnsupportedDocumentTypeError for an unsupported document type', () => {
    const unsupportedXml = '<unsupportedDoc></unsupportedDoc>';
    expect(() => signInvoiceXml(unsupportedXml, pkcs12Data, { pkcs12Password: '' })).toThrow('Unsupported document type: unsupportedDoc. Supported types are: factura, notaDebito, notaCredito, comprobanteRetencion, guiaRemision');
  });

  it('should throw UnexpectedDocumentRootError for a mismatched document type', () => {
    const creditNoteXml = fs.readFileSync(path.resolve('test/test-data/credit-note/original.xml')).toString();
    expect(() => signInvoiceXml(creditNoteXml, pkcs12Data, { pkcs12Password: '' })).toThrow('Unexpected document root: expected <factura>, but found <notaCredito>.');
  });
});
