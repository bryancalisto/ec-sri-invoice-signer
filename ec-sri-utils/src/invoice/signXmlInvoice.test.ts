const fs = require('fs');
const { signXmlInvoice } = require('./signXmlInvoice');
const pem = require('pem');
const pkcs12 = fs.readFileSync('client-identity.p12');


describe('signXmlInvoice', () => {
  it('should put the signature in the xml', (done) => {
    const xml = `
      <library>
        <book>
        <name>Harry Potter</name>
        </book>
      </library>
    `;

    pem.readPkcs12(pkcs12, { p12Password: '' }, async (err: any, cert: any) => {
      if (err) return done(err);

      const privateKey = cert.key;
      const certificate = cert.cert;

      const signed = signXmlInvoice(xml, privateKey, certificate);
      console.log('SINGED', signed);
      done();
    });
  });
});