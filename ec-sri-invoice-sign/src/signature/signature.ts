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

const signInvoiceXml = ({ invoiceXml, privateKey, certificate }: signInvoiceXml) => {
  const signedInfoTag = buildSignedInfoTag({
    invoiceHash: '',
    invoiceTagId: '',
    keyInfoCertificateRefTagId: '',
    keyInfoCertificateTagHash: '',
    keyInfoCertificateTagId: '',
    signedInfoTagId: '',
    signedPropertiesRefTagId: '',
    signedPropertiesTagHash: '',
    signedPropertiesTagId: ''
  });

  const keyInfoTag = buildKeyInfoTag({
    certificateContent: '',
    certificateExponent: '',
    certificateModulus: '',
    keyInfoTagId: ''
  });

  const signedPropertiesTag = buildSignedPropertiesTag({
    invoiceTagRef: '',
    signatureDescription: '',
    signedPropertiesTagId: '',
    signingTime: '',
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