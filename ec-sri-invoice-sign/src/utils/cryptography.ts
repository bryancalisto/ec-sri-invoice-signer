import * as crypto from 'crypto';
import * as forge from 'node-forge';

const sign = (data: string, privateKey: forge.pki.rsa.PrivateKey) => {
  const md = forge.md.sha1.create().update(data, 'utf8');
  return forge.util.encode64(privateKey.sign(md));
}

const getHash = (data: string) => {
  return crypto.createHash('sha1').update(data, 'utf-8').end().digest('base64');
}

/**
 * @param pkcs12RawData The p12/pfx file data encoded as base64 or a Buffer.
 * @param password The p12/pfx file password as a UTF-8 string.
 * @returns An object with the private key and certificate extracted (both typed according to node-forge) from the p12/pfx file.
 */
const extractPrivateKeyAndCertificateFromPkcs12 = (pkcs12RawData: string | Buffer, password: string = '') => {
  const pkcs12InBase64 = typeof pkcs12RawData === 'string' ? pkcs12RawData : pkcs12RawData.toString('base64');
  const pkcs12InDer = forge.util.decode64(pkcs12InBase64);
  const p12Asn1 = forge.asn1.fromDer(pkcs12InDer);
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);
  const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
  const certBag = certBags[forge.pki.oids.certBag]?.[0];
  const pkcs8ShroudedKeyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
  const pkcs8ShroudedKeyBag = pkcs8ShroudedKeyBags[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0];

  if (!certBag) {
    throw new Error(); // TODO: make this error custom
  }

  if (!pkcs8ShroudedKeyBag) {
    throw new Error(); // TODO: make this error custom
  }

  const privateKey = pkcs8ShroudedKeyBag.key as forge.pki.rsa.PrivateKey; // Not sure if the SRI software supports other kinds of private keys
  const certificate = certBag.cert;

  if (privateKey === undefined) {
    throw new Error();
  }

  if (certificate === undefined) {
    throw new Error();
  }

  return {
    privateKey,
    certificate
  }
}

const extractX509Data = (certificate: forge.pki.Certificate) => {
  const serialNumber = certificate.serialNumber;
  const issuerName = certificate.issuer.attributes.reverse().map((attr) => `${attr.name}=${attr.value}`).join(','); // .reverse to follow convention of country name last seen in the SRI example
  const certificateAsAsn1 = forge.pki.certificateToAsn1(certificate);
  const content = Buffer.from(forge.asn1.toDer(certificateAsAsn1).getBytes()).toString('base64');

  return {
    content,
    issuerName,
    serialNumber
  };
}

const extractPrivateKeyData = (privateKey: forge.pki.rsa.PrivateKey) => {
  const modulus = Buffer.from(privateKey.e.toString(), 'hex').toString('base64');
  const exponent = Buffer.from(privateKey.n.toString(), 'hex').toString('base64');

  return {
    modulus,
    exponent
  };
}

export {
  sign,
  getHash,
  extractPrivateKeyAndCertificateFromPkcs12,
  extractPrivateKeyData,
  extractX509Data
}