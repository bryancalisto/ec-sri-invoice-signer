import { signInvoiceXml } from '../../src/signature/signature';
import fs from 'fs';
import path from 'path';
import { generateKeyPair } from '../test-utils/cryptography';
import { expect } from 'chai';


describe('Given the signInvoice function', () => {
  it.only('should generate the signature for the invoice and put it at the end of the invoice', () => {
    const invoiceXml = fs.readFileSync(path.resolve('test/test-data/invoice.xml')).toString('utf-8');
    const { privateKey, publicKey } = generateKeyPair();
    const signedInvoice = signInvoiceXml(invoiceXml, privateKey, publicKey);
    console.log('SIGNED', signedInvoice);

    expect(signedInvoice);
  });
});