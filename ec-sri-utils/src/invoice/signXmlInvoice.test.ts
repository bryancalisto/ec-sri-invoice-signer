const { signXmlInvoice } = require('./signXmlInvoice');
const forge = require('node-forge');

describe('signXmlInvoice', () => {
  let privateKey: string;
  let certificate: string;

  beforeAll(() => {
    // Setup the private key and certificate (.p12 file content)
    const pki = forge.pki;
    const rsa = forge.pki.rsa;
    const keyPair = rsa.generateKeyPair({ bits: 2048 });

    const cert = pki.createCertificate();
    cert.publicKey = keyPair.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
    cert.sign(keyPair.privateKey);

    privateKey = pki.privateKeyToPem(keyPair.privateKey);
    certificate = pki.certificateToPem(cert);;
  });

  it('should put the signature in the xml', () => {
    const xml = '<comprobante></comprobante>';

    const signed = signXmlInvoice(xml, privateKey, certificate);
    console.log('SIGNED', signed);
  });
});