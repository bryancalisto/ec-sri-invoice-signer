import { defaultSignatureDescription } from "../utils/constants";
import { getHash } from "../utils/cryptography";
import { buildXml, parseXml } from "../utils/xml";
import { buildKeyInfoTag } from "./templates/keyInfo";
import { buildSignatureTag } from "./templates/signature";
import { buildSignedInfoTag } from "./templates/signedInfo";
import { buildSignedPropertiesTag } from "./templates/signedProperties";

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
  const invoiceTagRefId = ``;
  const keyInfoTagId = ``;
  const keyInfoCertificateRefTagId = ``;
  const keyInfoCertificateTagId = ``;
  const signedInfoTagId = ``;
  const signedPropertiesRefTagId = ``;
  const signedPropertiesTagId = ``;
  const signatureTagId = ``;
  const signatureObjectTagId = ``;
  const signatureValueTagId = ``;

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

  const signedInfoTag = buildSignedInfoTag({
    invoiceHash,
    invoiceTagId,
    keyInfoCertificateRefTagId,
    keyInfoCertificateTagHash: '',
    keyInfoCertificateTagId,
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