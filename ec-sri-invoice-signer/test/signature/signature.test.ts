import * as Utils from '../../src/utils/utils';
import { signInvoiceXml } from '../../src/signature/signature';
import fs from 'fs';
import path from 'path';
import { expect } from 'chai';
import sinon from 'sinon';

describe('Given the signInvoice function', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should generate the signature for the invoice and put it at the end of the invoice', () => {
    const invoiceXml = fs.readFileSync(path.resolve('test/test-data/invoice.xml')).toString();
    const pkcs12Data = fs.readFileSync(path.resolve('test/test-data/pkcs12/signature.p12')).toString('base64');
    const signedInvoice = fs.readFileSync(path.resolve('test/test-data/signed-invoice.xml')).toString();
    // Keep variable data constant
    sinon.stub(Utils, 'getDate').returns('2024-04-18T14:34:32.878-05:00');
    sinon.stub(Utils, 'getRandomUuid').returns('5bdfc32d-a37f-47c3-90fe-49f5a093b7bf');

    const result = signInvoiceXml(invoiceXml, pkcs12Data, { pkcs12Password: '' });
    expect(result).to.equal(signedInvoice);
  });

  it('should generate the signature for the invoice and put it at the end of the invoice with a certificate that has a issuer name with E field (email)', () => {
    const invoiceXml = fs.readFileSync(path.resolve('test/test-data/invoice.xml')).toString();
    const pkcs12Data = fs.readFileSync(path.resolve('test/test-data/edge-cases/certificate-with-email-address/pkcs12/signature.p12')).toString('base64');
    const signedInvoice = fs.readFileSync(path.resolve('test/test-data/edge-cases/certificate-with-email-address/signed-invoice.xml')).toString();
    // Keep variable data constant
    sinon.stub(Utils, 'getDate').returns('2024-04-18T14:34:32.878-05:00');
    sinon.stub(Utils, 'getRandomUuid').returns('5bdfc32d-a37f-47c3-90fe-49f5a093b7bf');

    const result = signInvoiceXml(invoiceXml, pkcs12Data, { pkcs12Password: '' });
    expect(result).to.equal(signedInvoice);
  });
});