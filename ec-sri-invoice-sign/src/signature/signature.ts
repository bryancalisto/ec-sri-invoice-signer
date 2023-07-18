import { defaultSignatureDescription } from "../utils/constants";
import { extractPrivateKeyAndCertificateFromPkcs12, extractPrivateKeyData, extractX509Data, getHash, sign } from "../utils/cryptography";
import Utils from "../utils/utils";
import { buildXml, parseXml } from "../utils/xml";
import { buildKeyInfoTag } from "./templates/keyInfo";
import { buildSignatureTag } from "./templates/signature";
import { buildSignedInfoTag } from "./templates/signedInfo";
import { buildSignedPropertiesTag } from "./templates/signedProperties";

type signInvoiceXmlOptions = Partial<{
  pkcs12Password: string;
  signatureDescription: string;
}>;

const insertSignatureIntoInvoiceXml = (invoiceXml: string, signatureXml: string) => {
  const invoiceXmlObj = parseXml(invoiceXml);
  const signatureXmlObj = parseXml(signatureXml);

  invoiceXmlObj.push(...signatureXmlObj);

  return buildXml(invoiceXmlObj);
}

export const signInvoiceXml = (invoiceXml: string, pkcs12Data: string | Buffer, options?: signInvoiceXmlOptions) => {
  const signingTime = Utils.getDate();
  const { privateKey, certificate } = extractPrivateKeyAndCertificateFromPkcs12(pkcs12Data);
  const { exponent: certificateExponent, modulus: certificateModulus } = extractPrivateKeyData(privateKey);
  const { issuerName: x509IssuerName, serialNumber: x509SerialNumber, content: certificateContent } = extractX509Data(certificate);

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

  // XML sections, hashes and signature
  const keyInfoTag = buildKeyInfoTag({
    certificateContent,
    certificateExponent,
    certificateModulus,
    keyInfoTagId
  });

  const x509Hash = getHash(certificateContent);

  const signedPropertiesTag = buildSignedPropertiesTag({
    invoiceTagRefId,
    signatureDescription: options?.signatureDescription ?? defaultSignatureDescription,
    signedPropertiesTagId,
    signingTime,
    x509Hash,
    x509IssuerName,
    x509SerialNumber
  });

  const invoiceHash = getHash(invoiceXml);
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

  const signedSignedInfoTag = sign(signedInfoTag, privateKey);

  const signatureTag = buildSignatureTag({
    keyInfoTag,
    signatureTagId,
    signatureObjectTagId,
    signedInfoTag,
    signedSignedInfoTag,
    signatureValueTagId,
    signedPropertiesTag
  });

  return insertSignatureIntoInvoiceXml(invoiceXml, signatureTag);
}