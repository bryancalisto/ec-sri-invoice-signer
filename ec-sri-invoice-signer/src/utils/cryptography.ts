import * as forge from 'node-forge';
import { UnsuportedPkcs12Error } from './errors';

const sign = (data: string, privateKey: forge.pki.rsa.PrivateKey) => {
  const md = forge.md.sha1.create();
  md.update(data, 'utf8');
  return forge.util.encode64(privateKey.sign(md));
}

const getHash = (data: string) => {
  const md = forge.md.sha1.create();
  md.update(data, 'utf8');
  return forge.util.encode64(md.digest().bytes());
}

const getBancoCentralPkcs12PrivateKey = (pkcs8ShroudedKeyBags: forge.pkcs12.Bag[]) => {
  const privateKeyBag = pkcs8ShroudedKeyBags.find((bag) => {
    const name = bag?.attributes?.friendlyName?.[0];
    return /signing|private|key/i.test(name) || !name;
  });

  if (!privateKeyBag) {
    throw new UnsuportedPkcs12Error("No private key bag found in BCE .p12");
  }

  const privateKey = privateKeyBag.key as forge.pki.rsa.PrivateKey;

  if (!privateKey) {
    throw new UnsuportedPkcs12Error("No valid key found in BCE .p12");
  }

  return privateKey;
}

const extractPrivateKeyAndCertificateFromPkcs12 = (
  pkcs12RawData: string | Buffer, 
  password: string = ''
) => {
  const pkcs12InBase64 = typeof pkcs12RawData === 'string' 
    ? pkcs12RawData 
    : pkcs12RawData.toString('base64');
  
  const pkcs12InDer = forge.util.decode64(pkcs12InBase64);
  const p12Asn1 = forge.asn1.fromDer(pkcs12InDer);
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);
  
  const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
  const certBag = certBags[forge.pki.oids.certBag]?.[0];
  const pkcs8ShroudedKeyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });

  if (!certBag) {
    throw new UnsuportedPkcs12Error("No certificate found in PKCS#12");
  }

  if (!pkcs8ShroudedKeyBags || Object.keys(pkcs8ShroudedKeyBags).length === 0) {
    throw new UnsuportedPkcs12Error("No private key found in PKCS#12");
  }

  const friendlyName = certBag?.attributes?.friendlyName?.[0];
  const certificate = certBag.cert;

  if (!certificate) {
    throw new UnsuportedPkcs12Error("Couldn't find certificate");
  }

  let privateKey: forge.pki.rsa.PrivateKey | null = null;

  // Extract private key
  const allKeyBags = [
    ...(pkcs8ShroudedKeyBags[forge.pki.oids.pkcs8ShroudedKeyBag] || []),
    ...(pkcs8ShroudedKeyBags[forge.pki.oids.keyBag] || []),
  ];

  // If it's a BCE certificate, use the specific extraction
  if (/banco central/i.test(friendlyName) || /eci|bce/i.test(friendlyName)) {
    privateKey = getBancoCentralPkcs12PrivateKey(allKeyBags);
  } else {
    const firstKeyBag = allKeyBags[0];
    privateKey = firstKeyBag?.key ? firstKeyBag.key as forge.pki.rsa.PrivateKey : null;
  }

  if (!privateKey) {
    throw new UnsuportedPkcs12Error("Couldn't find private key");
  }

  // Also extract the full certificate chain if available
  const caBags = p12.getBags({ bagType: forge.pki.oids.certBag });
  const certChain = (caBags[forge.pki.oids.certBag] || [])
    .map(bag => bag.cert)
    .filter(cert => cert !== undefined);

  return {
    privateKey,
    certificate,
    certChain // Full chain for validation
  };
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
   // reverse to follow convention of country-name-is-last seen in the SRI example
  const attributes = certificate.issuer.attributes
    .filter((attr) => attr.shortName || attr.type)
    .reverse();

  return attributes.map((attr) => {
    const name = attr.shortName ? normalizeIssuerAttributeShortName(attr.shortName) : attr.type;
    const value = attr.value || '';
    return `${name}=${value}`;
  }).join(',');
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
  const modulus = forge.util.encode64(
    forge.util.hexToBytes(privateKey.n.toString(16))
  );
  const exponent = forge.util.encode64(
    forge.util.hexToBytes(privateKey.e.toString(16))
  );

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
