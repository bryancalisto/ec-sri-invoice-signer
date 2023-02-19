const xmlCrypto = require('xml-crypto');

const signXmlInvoice = (xml: string, privateKey: string, certificate: string) => {
  const SignedXml = xmlCrypto.SignedXml;

  const sig = new SignedXml();

  sig.addReference("comprobante", ["http://www.w3.org/2000/09/xmldsig#enveloped-signature"]);

  sig.keyInfoProvider = {
    getKeyInfo: () => {
      return `
        <X509Data>
          <X509Certificate>
            ${certificate}
          </X509Certificate>
        </X509Data>`;
    },
  };

  sig.signingKey = privateKey;
  sig.computeSignature(xml);
  return sig.getSignedXml();
};

module.exports = {
  signXmlInvoice
};