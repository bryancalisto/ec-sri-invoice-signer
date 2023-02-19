const { signXmlInvoice } = require('./signXmlInvoice');
const pem = require('pem');

describe('signXmlInvoice', () => {
  let privateKey: string;
  let certificate: string;

  beforeAll((done) => {
    // Setup the private key and certificate (.p12 file content)
    pem.createPrivateKey(2048, null, (err: unknown, key: any) => {
      if (err) done(err);

      privateKey = key.key;

      pem.createCertificate({
        serviceKey: privateKey,
        days: 1
      }, (err: unknown, cert: any) => {
        if (err) done(err);

        const certificateWithoutDelimiters = cert.certificate.replace(/-----BEGIN CERTIFICATE[-\s]+|[-\s]+-----END CERTIFICATE[-\s]+/gm, '');
        certificate = certificateWithoutDelimiters;
        done();
      });
    })
  });

  it('should put the signature in the xml', () => {
    const xml = '<comprobante></comprobante>';

    const signed = signXmlInvoice(xml, privateKey, certificate);
    console.log('SINGED', signed);
  });
});