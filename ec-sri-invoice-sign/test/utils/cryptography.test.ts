import { expect } from 'chai';
import { extractPrivateKeyAndCertificateFromPkcs12, getHash, sign } from '../../src/utils/cryptography';
import { verifySignature } from '../test-utils/cryptography';
import fs from 'fs';
import path from 'path';
import * as forge from 'node-forge';
const signatureP12 = fs.readFileSync(path.resolve('test/test-data/pkcs12/signature.p12'));

describe('Given the sign function', () => {
  it('should return the signature for the input data', () => {
    const data = 'something';
    const { privateKey, certificate } = extractPrivateKeyAndCertificateFromPkcs12(signatureP12);

    const resultSignature = sign(data, privateKey);
    const verifiedSuccessfully = verifySignature(data, certificate.publicKey as forge.pki.rsa.PublicKey, resultSignature);

    expect(verifiedSuccessfully).to.be.true;
  });
});

describe('Given the getHash function', () => {
  it('should return the SHA1 hash of the input string expressed in base64', () => {
    const result = getHash('something');
    expect(result).equal('GvF+c3IdvgxAARuC7Uuxp9vjzik=');
  });
});

describe('Given the extractPrivateKeyAndCertificateFromPkcs12 function', () => {
  it('should return an object with the private key and certificate contained in the pkcs12 file', () => {
    const privateKeyPem = fs.readFileSync(path.resolve('test/test-data/pkcs12/privateKey.pem')).toString('utf-8');
    const certificatePem = fs.readFileSync(path.resolve('test/test-data/pkcs12/certificate.pem')).toString('utf-8');
    const password = '';

    const result = extractPrivateKeyAndCertificateFromPkcs12(signatureP12, password);

    // Here we convert from fromPem and toPem to overcome format inconsistencies due to new line encoding and pkcs8 shrouding of private key.
    // This way the comparison is delegated to node-forge functions only becoming abstracted and consistent.
    expect(forge.pki.privateKeyToPem(result.privateKey)).to.equal(forge.pki.privateKeyToPem(forge.pki.privateKeyFromPem(privateKeyPem)));
    expect(forge.pki.certificateToPem(result.certificate)).to.equal(forge.pki.certificateToPem(forge.pki.certificateFromPem(certificatePem)));
  });
});
