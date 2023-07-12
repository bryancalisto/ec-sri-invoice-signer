import { getHash } from "../utils/cryptography";
import { buildKeyInfoTag } from "./templates/keyInfo";
import { buildSignatureTag } from "./templates/signature";
import { buildSignedInfoTag } from "./templates/signedInfo";
import { buildSignedPropertiesTag } from "./templates/signedProperties";

// Signature example can be found in the SRI manual page 110
type signInvoiceXml = {
  invoiceXml: string;
  privateKey: string;
  certificate: string;
}

export const signInvoiceXml = ({ invoiceXml, privateKey, certificate }: signInvoiceXml) => {
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

  // HASHES
  const invoiceHash = getHash(invoiceXml);

  const signedInfoTag = buildSignedInfoTag({
    invoiceHash,
    invoiceTagId,
    keyInfoCertificateRefTagId,
    keyInfoCertificateTagHash: '',
    keyInfoCertificateTagId,
    signedInfoTagId,
    signedPropertiesRefTagId,
    signedPropertiesTagHash: '',
    signedPropertiesTagId
  });

  const keyInfoTag = buildKeyInfoTag({
    certificateContent: '',
    certificateExponent: '',
    certificateModulus: '',
    keyInfoTagId
  });

  const signedPropertiesTag = buildSignedPropertiesTag({
    invoiceTagRefId,
    signatureDescription: '',
    signedPropertiesTagId: '',
    signingTime,
    x509Hash: '',
    x509IssuerName: '',
    x509SerialNumber: ''
  });

  const signatureTag = buildSignatureTag({
    signatureTagId: '',
    signatureObjectTagId: '',
    signedInfoTag: '',
    keyInfoSection: '',
    signedSignedInfoTag: '',
    signatureValueTagId: '',
    signedPropertiesTag: ''
  });

  const signedInvoiceXml = invoiceXml;

  return signedInvoiceXml;
}