const xmlCrypto = require('xml-crypto');

const removeCertificateDelimiters = (certificate: string) => {
  return certificate.replace(/-----BEGIN CERTIFICATE[-\s]+|[-\s]+-----END CERTIFICATE[-\s]+/gm, '')
}

/**
 *
 * @name signXmlInvoice
 * @description Signs a XML invoice based on the SRI specifications.
 * @param xml The XML invoice to sign.
 * @param privateKey The private key to create the signature.
 * @param certificate The X.509 certificate to include in the signature.
 * @returns The signed XML invoice.
 */
const signXmlInvoice = (xml: string, privateKey: string, certificate: string) => {
  const SignedXml = xmlCrypto.SignedXml;

  const sig = new SignedXml();

  sig.addReference("comprobante", ["http://www.w3.org/2000/09/xmldsig#enveloped-signature"]);

  sig.keyInfoProvider = {
    getKeyInfo: () => {
      return `
        <X509Data>
          <X509Certificate>
            ${removeCertificateDelimiters(certificate)}
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