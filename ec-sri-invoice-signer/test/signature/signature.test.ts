import { describe, it, expect, afterEach, jest } from '@jest/globals';
import * as Utils from '../../src/utils/utils';
import { signDebitNoteXml, signInvoiceXml } from '../../src/signature/signature';
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
