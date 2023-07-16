import { signInvoiceXml } from '../../src/signature/signature';
import fs from 'fs';
import path from 'path';
import { expect } from 'chai';


describe('Given the signInvoice function', () => {
  it('should generate the signature for the invoice and put it at the end of the invoice', () => {
    const invoiceXml = fs.readFileSync(path.resolve('test/test-data/invoice.xml')).toString('utf-8');
    const pkcs12Data = fs.readFileSync(path.resolve('test/test-data/pkcs12/signature.p12')).toString('base64');

    const signedInvoice = signInvoiceXml(invoiceXml, pkcs12Data);

    fs.writeFileSync('signed.xml', signedInvoice);
    expect(signedInvoice);
  });
});