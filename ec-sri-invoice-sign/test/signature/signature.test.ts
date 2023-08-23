import Utils from '../../src/utils/utils';
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
    sinon.stub(Utils, 'getDate').returns('2023-07-11T14:34:32.878-05:00'); // Keep the date constant for every test
    sinon.stub(Utils, 'getRandomUuid').returns('5bdfc32d-a37f-47c3-90fe-49f5a093b7bf');

    const result = signInvoiceXml(invoiceXml, pkcs12Data, { pkcs12Password: '' });
    fs.writeFileSync('signed.xml', result);
    expect(result).to.equal(signedInvoice);
  });
});