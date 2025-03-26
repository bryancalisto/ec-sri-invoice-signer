import { expect } from 'chai';
import { extractIssuerData, extractPrivateKeyAndCertificateFromPkcs12, getHash, sign } from '../../src/utils/cryptography';
import { createBancoCentralCertificateKeyAndP12, verifySignature } from '../test-utils/cryptography';
import fs from 'fs';
import path from 'path';
import * as forge from 'node-forge';

describe('Given the sign function', () => {
  it('should return the signature for the input data', () => {
    const data = 'something';
    const p12 = fs.readFileSync(path.resolve('test/test-data/pkcs12/signature.p12'));
    const { privateKey, certificate } = extractPrivateKeyAndCertificateFromPkcs12(p12);

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
    const p12 = fs.readFileSync(path.resolve('test/test-data/pkcs12/signature.p12'));
    const password = '';

    const result = extractPrivateKeyAndCertificateFromPkcs12(p12, password);

    // Here we convert from fromPem and toPem to overcome format inconsistencies due to new line encoding and pkcs8 shrouding of private key.
    // This way the comparison is delegated to node-forge functions only becoming abstracted and consistent.
    expect(forge.pki.privateKeyToPem(result.privateKey)).to.equal(forge.pki.privateKeyToPem(forge.pki.privateKeyFromPem(privateKeyPem)));
    expect(forge.pki.certificateToPem(result.certificate)).to.equal(forge.pki.certificateToPem(forge.pki.certificateFromPem(certificatePem)));
  });

  /**
   * Unskip when createBancoCentralCertificateKeyAndP12 is fixed
   */
  it.skip("should return the correct private key for a 'Banco Central del Ecuador' .p12", () => {
    const { keyPem, certPem, p12Buffer } = createBancoCentralCertificateKeyAndP12();
    const password = '';

    const result = extractPrivateKeyAndCertificateFromPkcs12(p12Buffer, password);

    // Here we convert from fromPem and toPem to overcome format inconsistencies due to new line encoding and pkcs8 shrouding of private key.
    // This way the comparison is delegated to node-forge functions only becoming abstracted and consistent.
    expect(forge.pki.privateKeyToPem(result.privateKey)).to.equal(forge.pki.privateKeyToPem(forge.pki.privateKeyFromPem(keyPem)));
    expect(forge.pki.certificateToPem(result.certificate)).to.equal(forge.pki.certificateToPem(forge.pki.certificateFromPem(certPem)));
  });
});

describe('Give the extractIssuerData function', () => {
  it('should return the issuer data inverted', () => {
    const certificatePem = fs.readFileSync(path.resolve('test/test-data/pkcs12/certificate.pem')).toString('utf-8');
    const certificate = forge.pki.certificateFromPem(certificatePem);

    const result = extractIssuerData(certificate);
    expect(result).to.equal('CN=ec-sri-invoice-sign,OU=engineering,O=ec-sri-invoice-sign,L=Quito,ST=Pichincha,C=EC');
  });

  it('should convert the \'E\' short name into \'EMAILADDRESS\' to match the SRI validator requirements', () => {
    const certificatePem = fs.readFileSync(path.resolve('test/test-data/edge-cases/certificate-with-email-address/pkcs12/certificate.pem')).toString('utf-8');
    const certificate = forge.pki.certificateFromPem(certificatePem);

    const result = extractIssuerData(certificate);
    expect(result).to.equal('EMAILADDRESS=info@mycompany.com,CN=my company name,O=my company,L=Ibarra,ST=Imbabura,C=EC');
  });
});
