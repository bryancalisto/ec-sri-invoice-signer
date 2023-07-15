import * as crypto from 'crypto';
import * as forge from 'node-forge';

const sign = (data: string, privateKey: string) => {
  return crypto.createSign('RSA-SHA1').update(data, 'utf-8').end().sign(privateKey, 'base64');
}

const getHash = (data: string) => {
  return crypto.createHash('sha1').update(data, 'utf-8').end().digest('base64');
}

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

  const privateKey = pkcs8ShroudedKeyBag.key;
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

export {
  sign,
  getHash,
  extractPrivateKeyAndCertificateFromPkcs12
}