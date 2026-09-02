import { describe, it, expect, jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';

jest.mock('../../src/utils/utils', () => ({
  getDate: jest.fn(() => '2024-04-18T14:34:32.878-05:00'),
  getRandomUuid: jest.fn(() => '5bdfc32d-a37f-47c3-90fe-49f5a093b7bf'),
  pipe: (jest.requireActual('../../src/utils/utils') as any).pipe,
}));

describe('Given the signInvoice function', () => {
  it('should generate the signature for the invoice and put it at the end of the invoice', async () => {
    const { signInvoiceXml } = await import ('../../src/signature/signature');
    const invoiceXml = fs.readFileSync(path.resolve('test/test-data/invoice/original.xml')).toString();
    const pkcs12Data = fs.readFileSync(path.resolve('test/test-data/pkcs12/signature.p12')).toString('base64');
    const signedInvoice = fs.readFileSync(path.resolve('test/test-data/invoice/signed.xml')).toString();

    const result = signInvoiceXml(invoiceXml, pkcs12Data, { pkcs12Password: '' });
    // fs.writeFileSync(path.resolve('test/test-data/invoice/signed.xml'), result)
    expect(result).toEqual(signedInvoice);
  });

  it('should generate the signature for the invoice and put it at the end of the invoice with a certificate that has a issuer name with E field (email)', async () => {
    const { signInvoiceXml } = await import ('../../src/signature/signature');
    const invoiceXml = fs.readFileSync(path.resolve('test/test-data/invoice/original.xml')).toString();
    const pkcs12Data = fs.readFileSync(path.resolve('test/test-data/invoice/edge-cases/certificate-with-email-address/pkcs12/signature.p12')).toString('base64');
    const signedInvoice = fs.readFileSync(path.resolve('test/test-data/invoice/edge-cases/certificate-with-email-address/signed-invoice.xml')).toString();

    const result = signInvoiceXml(invoiceXml, pkcs12Data, { pkcs12Password: '' });
    // fs.writeFileSync(path.resolve('test/test-data/invoice/edge-cases/certificate-with-email-address/signed-invoice.xml'), result)
    expect(result).toEqual(signedInvoice);
  });
});

describe('Given the signDebitNote function', () => {
  it('should generate the signature for the invoice and put it at the end of the invoice', async () => {
    const { signDebitNoteXml } = await import ('../../src/signature/signature');
    const original = fs.readFileSync(path.resolve('test/test-data/debit-note/original.xml')).toString();
    const pkcs12Data = fs.readFileSync(path.resolve('test/test-data/pkcs12/signature.p12')).toString('base64');
    const signed = fs.readFileSync(path.resolve('test/test-data/debit-note/signed.xml')).toString();

    const result = signDebitNoteXml(original, pkcs12Data, { pkcs12Password: '' });
    // fs.writeFileSync(path.resolve('test/test-data/debit-note/signed.xml'), result)
    expect(result).toEqual(signed);
  });
});

describe('Given the signCreditNote function', () => {
  it('should generate the signature for the invoice and put it at the end of the invoice', async () => {
    const { signCreditNoteXml } = await import ('../../src/signature/signature');
    const original = fs.readFileSync(path.resolve('test/test-data/credit-note/original.xml')).toString();
    const pkcs12Data = fs.readFileSync(path.resolve('test/test-data/pkcs12/signature.p12')).toString('base64');
    const signed = fs.readFileSync(path.resolve('test/test-data/credit-note/signed.xml')).toString();

    const result = signCreditNoteXml(original, pkcs12Data, { pkcs12Password: '' });
    // fs.writeFileSync(path.resolve('test/test-data/credit-note/signed.xml'), result)
    expect(result).toEqual(signed);
  });
});

describe('Given the signDeliveryGuide function', () => {
  it('should generate the signature for the delivery guide and put it at the end of the delivery guide', async () => {
    const { signDeliveryGuideXml } = await import ('../../src/signature/signature');
    const original = fs.readFileSync(path.resolve('test/test-data/delivery-guide/original.xml')).toString();
    const pkcs12Data = fs.readFileSync(path.resolve('test/test-data/pkcs12/signature.p12')).toString('base64');
    const signed = fs.readFileSync(path.resolve('test/test-data/delivery-guide/signed.xml')).toString();
    const result = signDeliveryGuideXml(original, pkcs12Data, { pkcs12Password: '' });
    // fs.writeFileSync(path.resolve('test/test-data/delivery-guide/signed.xml'), result)
    expect(result).toEqual(signed);
  });
});

describe('Given the signWithholdingCertificateXml function', () => {
  it('should generate the signature for the withholding certificate and put it at the end of the document', async () => {
    const { signWithholdingCertificateXml } = await import ('../../src/signature/signature');
    const original = fs.readFileSync(path.resolve('test/test-data/withholding-certificate/original.xml')).toString();
    const pkcs12Data = fs.readFileSync(path.resolve('test/test-data/pkcs12/signature.p12')).toString('base64');
    const signed = fs.readFileSync(path.resolve('test/test-data/withholding-certificate/signed.xml')).toString();
    const result = signWithholdingCertificateXml(original, pkcs12Data, { pkcs12Password: '' });
    // fs.writeFileSync(path.resolve('test/test-data/withholding-certificate/signed.xml'), result)
    expect(result).toEqual(signed);
  });
});
