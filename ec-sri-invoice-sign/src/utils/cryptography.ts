import * as forge from 'node-forge';
import { UnsuportedPkcs12Error } from './errors';

const sign = (data: string, privateKey: forge.pki.rsa.PrivateKey) => {
  return forge.util.encode64(privateKey.sign(forge.sha1.create().update(data, 'utf8')));
}

const getHash = (data: string) => {
  return forge.util.encode64(forge.sha1.create().update(data, 'utf8').digest().bytes());
}

/**
 * @param pkcs12RawData The p12/pfx file data encoded as base64 or a nodejs Buffer.
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

  if (!certBag || !pkcs8ShroudedKeyBag) {
    throw new UnsuportedPkcs12Error();
  }

  const privateKey = pkcs8ShroudedKeyBag.key as forge.pki.rsa.PrivateKey;
  const certificate = certBag.cert;

  if (!privateKey || !certificate) {
    throw new UnsuportedPkcs12Error();
  }

  return {
    privateKey,
    certificate
  }
}

const extractIssuerData = (certificate: forge.pki.Certificate) => {
  const issuerName = certificate.issuer.attributes.reverse().filter((attr) => attr.shortName || attr.type).map((attr) => {
    if (attr.shortName) {
      return `${attr.shortName}=${attr.value}`;
    }
    else {
      return `${attr.type}=${attr.value}`;
    }
  }).join(','); // .reverse to follow convention of country-name-is-last seen in the SRI example

  return issuerName;
}

const extractX509Data = (certificate: forge.pki.Certificate) => {
  const serialNumber = new forge.jsbn.BigInteger(Array.from(Buffer.from(certificate.serialNumber, 'hex'))).toString();
  const issuerName = extractIssuerData(certificate);
  const certificateAsAsn1 = forge.pki.certificateToAsn1(certificate);
  const contentAsDer = forge.asn1.toDer(certificateAsAsn1);
  const contentHash = forge.util.encode64(forge.sha1.create().update(contentAsDer.bytes()).digest().bytes());
  const content = forge.util.encode64(contentAsDer.bytes());

  return {
    content,
    contentHash,
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