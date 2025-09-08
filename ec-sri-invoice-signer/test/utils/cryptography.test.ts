import { describe, it, expect } from '@jest/globals';
import { extractIssuerData, extractPrivateKeyAndCertificateFromPkcs12, getHash, sign } from '../../src/utils/cryptography';
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

    expect(verifiedSuccessfully).toBe(true);
  });
});

describe('Given the getHash function', () => {
  it('should return the SHA1 hash of the input string expressed in base64', () => {
    const result = getHash('something');
    expect(result).toEqual('GvF+c3IdvgxAARuC7Uuxp9vjzik=');
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
    expect(forge.pki.privateKeyToPem(result.privateKey)).toEqual(forge.pki.privateKeyToPem(forge.pki.privateKeyFromPem(privateKeyPem)));
    expect(forge.pki.certificateToPem(result.certificate)).toEqual(forge.pki.certificateToPem(forge.pki.certificateFromPem(certificatePem)));
  });
});

describe('Give the extractIssuerData function', () => {
  it('should return the issuer data inverted', () => {
    const certificatePem = fs.readFileSync(path.resolve('test/test-data/pkcs12/certificate.pem')).toString('utf-8');
    const certificate = forge.pki.certificateFromPem(certificatePem);

    const result = extractIssuerData(certificate);
    expect(result).toEqual('CN=ec-sri-invoice-sign,OU=engineering,O=ec-sri-invoice-sign,L=Quito,ST=Pichincha,C=EC');
  });

  it('should convert the \'E\' short name into \'EMAILADDRESS\' to match the SRI validator requirements', () => {
    const certificatePem = fs.readFileSync(path.resolve('test/test-data/invoice/edge-cases/certificate-with-email-address/pkcs12/certificate.pem')).toString('utf-8');
    const certificate = forge.pki.certificateFromPem(certificatePem);

    const result = extractIssuerData(certificate);
    expect(result).toEqual('EMAILADDRESS=info@mycompany.com,CN=my company name,O=my company,L=Ibarra,ST=Imbabura,C=EC');
  });
});
