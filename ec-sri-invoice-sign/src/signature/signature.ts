import * as crypto from 'crypto';
import { defaultSignatureDescription } from "../utils/constants";
import { getHash } from "../utils/cryptography";
import { getRandomInt } from "../utils/utils";
import { buildXml, parseXml } from "../utils/xml";
import { buildKeyInfoTag } from "./templates/keyInfo";
import { buildSignatureTag } from "./templates/signature";
import { buildSignedInfoTag } from "./templates/signedInfo";
import { buildSignedPropertiesTag } from "./templates/signedProperties";
import * as forge from 'node-forge';

type signInvoiceXmlOptions = Partial<{
  signatureDescription: string
}>;

const insertSignatureIntoInvoiceXml = (invoiceXml: string, signatureXml: string) => {
  const invoiceXmlObj = parseXml(invoiceXml);
  const signatureXmlObj = parseXml(signatureXml);

  invoiceXmlObj.push(...signatureXmlObj);

  return buildXml(invoiceXmlObj);
}

export const signInvoiceXml = (invoiceXml: string, privateKey: string, certificate: string, options?: signInvoiceXmlOptions) => {
  const signingTime = new Date().toISOString();

  // IDs
  const invoiceTagId = 'comprobante';
  const invoiceTagRefId = `InvoiceRef`;
  const keyInfoTagId = `Certificate`;
  const keyInfoRefTagId = `CertificateRef`;
  const signedInfoTagId = `SignedInfo`;
  const signedPropertiesRefTagId = `SignedPropertiesRef`;
  const signedPropertiesTagId = `SignedProperties`;
  const signatureTagId = `Signature`;
  const signatureObjectTagId = `SignatureObject`;
  const signatureValueTagId = `SignatureValue`;

  // HASHES
  const invoiceHash = getHash(invoiceXml);

  const keyInfoTag = buildKeyInfoTag({
    certificateContent: '',
    certificateExponent: '',
    certificateModulus: '',
    keyInfoTagId
  });

  const signedPropertiesTag = buildSignedPropertiesTag({
    invoiceTagRefId,
    signatureDescription: options?.signatureDescription ?? defaultSignatureDescription,
    signedPropertiesTagId,
    signingTime,
    x509Hash: '',
    x509IssuerName: '',
    x509SerialNumber: ''
  });

  const signedPropertiesTagHash = getHash(signedPropertiesTag);
  const keyInfoTagHash = getHash(keyInfoTag);

  const signedInfoTag = buildSignedInfoTag({
    invoiceHash,
    invoiceTagId,
    keyInfoRefTagId,
    keyInfoTagHash,
    keyInfoTagId,
    signedInfoTagId,
    signedPropertiesRefTagId,
    signedPropertiesTagHash,
    signedPropertiesTagId
  });

  const signatureTag = buildSignatureTag({
    keyInfoTag,
    signatureTagId,
    signatureObjectTagId,
    signedInfoTag,
    signedSignedInfoTag: '',
    signatureValueTagId,
    signedPropertiesTag
  });

  return insertSignatureIntoInvoiceXml(invoiceXml, signatureTag);
}