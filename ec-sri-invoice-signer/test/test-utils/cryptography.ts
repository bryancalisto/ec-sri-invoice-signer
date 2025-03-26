import * as forge from 'node-forge';

export const verifySignature = (preSignData: string, publicKey: forge.pki.rsa.PublicKey, signature: string) => {
  const digest = forge.md.sha1.create().update(preSignData, 'utf8');
  return publicKey.verify(digest.digest().bytes(), forge.util.decode64(signature));
}

/**
 * NOT WORKING as cannot set the 'Signing Key' friendly name in the pkcs12's cert bag
 */
export const createBancoCentralCertificateKeyAndP12 = () => {
  const keys = forge.pki.rsa.generateKeyPair(4096);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);
  const attrs = [{ name: 'friendlyName', value: 'Signing Key' }];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);

  cert.sign(keys.privateKey, forge.md.sha256.create());

  // Create a PKCS12 structure
  let p12Asn1 = forge.pkcs12.toPkcs12Asn1(
    keys.privateKey,
    [cert],
    '', // No password
    { friendlyName: 'Banco Central Del Ecuador' }
  );

  const certPem = forge.pki.certificateToPem(cert);
  const keyPem = forge.pki.privateKeyToPem(keys.privateKey);
  const p12Buffer = Buffer.from(forge.asn1.toDer(p12Asn1).getBytes(), 'binary');

  return { certPem, keyPem, p12Buffer };
}

