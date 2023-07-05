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
  const prefix = 'ds';

  const sig = new SignedXml();

  sig.addReference("comprobante", ["http://www.w3.org/2000/09/xmldsig#enveloped-signature"]);

  sig.signatureAlgorithm = 'http://www.w3.org/2000/09/xmldsig#rsa-sha1';
  sig.canonicalizationAlgorithm = 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315';

  sig.keyInfoProvider = {
    getKeyInfo: () => {
      return `
        <${prefix}:X509Data>
          <${prefix}:X509Certificate>
            ${removeCertificateDelimiters(certificate)}
          </${prefix}:X509Certificate>
        </${prefix}:X509Data>
        <${prefix}:KeyValue>
            <${prefix}:RSAKeyValue>
                <${prefix}:Modulus>
                    40UTs5fpJhVbNEb6vp+jupblFDNWcdXEsgCwBVvGUCovkkCMGoZtpKAGvcyapOPANbV9R2GrhgFUZxhQyABHouGb82K4NQvJvB44RDwzealuyVgIhqnYbE+bWDkpyVhukhWFWyAdAz8bSXoT1wMha3i+T2LzlauaCQhRpDdnhQIsS85bSw0bW9I2TWJvsz5kHauSiPIRxddQF013vOlJxzEi2la8jL2G7P4VdP1IitgbeBNYmVLEab0CBEA6yyCwwnYSY7soA511K6TjFDubGIJ4+cmAFwPRoQHFfeHrN57cDixqhq39ZQmetyb7sHtV1T32yifcaPhFv6c2IcoKKw==
                </${prefix}:Modulus>
                <${prefix}:Exponent>
                    AQAB
                </${prefix}:Exponent>
            </${prefix}:RSAKeyValue>
        </${prefix}:KeyValue>`;
    },
  };

  sig.signingKey = privateKey;
  sig.computeSignature(xml, { prefix: 'ds' });
  return sig.getSignedXml();
};

module.exports = {
  signXmlInvoice
};