import * as forge from 'node-forge';
import { UnsuportedPkcs12Error } from './errors';

const sign = (data: string, privateKey: forge.pki.rsa.PrivateKey) => {
  return forge.util.encode64(privateKey.sign(forge.sha1.create().update(data, 'utf8')));
}

const getHash = (data: string) => {
  return forge.util.encode64(forge.sha1.create().update(data, 'utf8').digest().bytes());
}

const getBancoCentralPkcs12PrivateKey = (pkcs8ShroudedKeyBags: forge.pkcs12.Bag[]) => {
    const privateKeyBag = pkcs8ShroudedKeyBags.find((bag) => {
      const name = bag.attributes.friendlyName[0];
      return /Signing Key/i.test(name);
    });

    if (!privateKeyBag) {
      throw new UnsuportedPkcs12Error();
    }

    const privateKey = privateKeyBag.key as forge.pki.rsa.PrivateKey;

    if (!privateKey) {
      throw new UnsuportedPkcs12Error();
    }

    return privateKey;
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

  if (!certBag || !pkcs8ShroudedKeyBags) {
    throw new UnsuportedPkcs12Error();
  }

  const friendlyName = certBag?.attributes?.friendlyName?.[0];

  const certificate = certBag.cert;

  if (!certificate) {
    throw new UnsuportedPkcs12Error();
  }

  let privateKey: forge.pki.rsa.PrivateKey | null = null;

  if (/banco central/i.test(friendlyName)) {
    privateKey = getBancoCentralPkcs12PrivateKey(pkcs8ShroudedKeyBags[forge.pki.oids.pkcs8ShroudedKeyBag] ?? []);
  }
  else {
    const firstPkcs8ShroudedKeyBag = pkcs8ShroudedKeyBags[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0];
    privateKey = firstPkcs8ShroudedKeyBag?.key ? firstPkcs8ShroudedKeyBag.key as forge.pki.rsa.PrivateKey : null;
  }

  if (!privateKey) {
    throw new UnsuportedPkcs12Error();
  }

  return {
    privateKey,
    certificate
  }
}

const normalizeIssuerAttributeShortName = (shortName: string) => {
  switch (shortName) {
    case 'E':
      // As required by the SRI validator code in this line (https://github.com/gdiazs/MITyCLib/blob/master/MITyCLibXADES/src/main/java/es/mityc/firmaJava/libreria/xades/ValidarFirmaXML.java#L2139).
      // X500Principal needs EMAILADDRESS instead of E (https://docs.oracle.com/javase/7/docs/api/javax/security/auth/x500/X500Principal.html#X500Principal(java.lang.String)) and has been seen that some certificate issuers set the email address with 'E' shortName.
      // The oid for email (1.2.840.113549.1.9.1) could also be used, but that's a bit cryptic and we know the SRI accepts EMAILADDRESS without issue so no need to be that generic.
      return 'EMAILADDRESS';
    default:
      return shortName;
  };
};

const extractIssuerData = (certificate: forge.pki.Certificate) => {
  const issuerName = certificate.issuer.attributes.reverse().filter((attr) => attr.shortName || attr.type).map((attr) => {
    if (attr.shortName) {
      const normalizedShortName = normalizeIssuerAttributeShortName(attr.shortName);
      return `${normalizedShortName}=${attr.value}`;
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
  extractIssuerData,
  extractX509Data
}