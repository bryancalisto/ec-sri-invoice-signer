// https://stackoverflow.com/questions/68101590/sign-xml-file-with-my-pem-certificate-using-nodejs
const xmlCrypto = require('xml-crypto');

const signXmlInvoice = (xml: string, privateKey: Buffer | string, certificate: Buffer | string) => {
  const SignedXml = xmlCrypto.SignedXml;

  console.log(certificate);

  const sig = new SignedXml();
  sig.signingKey = privateKey;
  sig.computeSignature(xml);
  return sig.getSignedXml();
};

module.exports = {
  signXmlInvoice
};