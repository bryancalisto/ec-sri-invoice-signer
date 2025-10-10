import { c14nCanonicalize } from "../canonicalization/c14n";
import { XmlProperties } from "../utils/constants";
import { extractPrivateKeyAndCertificateFromPkcs12, extractPrivateKeyData, extractX509Data, getHash, sign } from "../utils/cryptography";
import * as Utils from "../utils/utils";
import { validateXmlForSigning } from "../utils/xml-validator";
import { buildKeyInfoTag } from "./templates/keyInfo";
import { buildSignatureTag } from "./templates/signature";
import { buildSignedInfoTag } from "./templates/signedInfo";
import { buildSignedPropertiesTag } from "./templates/signedProperties";

export type signXmlOptions = Partial<{
  pkcs12Password: string;
}>;

const insertSignatureIntoInvoiceXml = (invoiceXml: string, signatureXml: string, rootTagName: string) => {
  const tagName = `</${rootTagName}>`;
  return invoiceXml.replace(tagName, `${signatureXml}${tagName}`);
}

export const signDocumentXml = (docXml: string, pkcs12Data: string | Buffer, rootTagName?: string, options?: signXmlOptions) => {
  // Validate XML and detect document type if not provided
  const detectedDocumentType = validateXmlForSigning(docXml);
  const documentType = rootTagName || detectedDocumentType;

  const signingTime = Utils.getDate();
  const { privateKey, certificate } = extractPrivateKeyAndCertificateFromPkcs12(pkcs12Data, options?.pkcs12Password);
  const { exponent: certificateExponent, modulus: certificateModulus } = extractPrivateKeyData(privateKey);
  const { issuerName: x509IssuerName, serialNumber: x509SerialNumber, content: certificateContent, contentHash: x509Hash } = extractX509Data(certificate);

  // IDs
  const docTagId = 'comprobante';
  const docTagRefId = `DocumentRef-${Utils.getRandomUuid()}`;
  const keyInfoTagId = `Certificate-${Utils.getRandomUuid()}`;
  const keyInfoRefTagId = `CertificateRef-${Utils.getRandomUuid()}`;
  const signedInfoTagId = `SignedInfo-${Utils.getRandomUuid()}`;
  const signedPropertiesRefTagId = `SignedPropertiesRef-${Utils.getRandomUuid()}`;
  const signedPropertiesTagId = `SignedProperties-${Utils.getRandomUuid()}`;
  const signatureTagId = `Signature-${Utils.getRandomUuid()}`;
  const signatureObjectTagId = `SignatureObject-${Utils.getRandomUuid()}`;
  const signatureValueTagId = `SignatureValue-${Utils.getRandomUuid()}`;

  // XML sections, hashes and signature
  const keyInfoTag = buildKeyInfoTag({
    certificateContent,
    certificateExponent,
    certificateModulus,
    keyInfoTagId
  });

  const signedPropertiesTag = buildSignedPropertiesTag({
    invoiceTagRefId: docTagRefId,
    signedPropertiesTagId,
    signingTime,
    x509Hash,
    x509IssuerName,
    x509SerialNumber
  });

  const docHash = getHash(c14nCanonicalize(docXml));
  const signedPropertiesTagHash = getHash(c14nCanonicalize(signedPropertiesTag, { inheritedNamespaces: [{ prefix: 'xades', uri: XmlProperties.namespaces.xades }, { prefix: 'ds', uri: XmlProperties.namespaces.ds }] }));
  const keyInfoTagHash = getHash(c14nCanonicalize(keyInfoTag, { inheritedNamespaces: [{ prefix: 'ds', uri: XmlProperties.namespaces.ds }] }));

  const signedInfoTag = buildSignedInfoTag({
    invoiceHash: docHash,
    invoiceTagId: docTagId,
    invoiceTagRefId: docTagRefId,
    keyInfoRefTagId,
    keyInfoTagHash,
    keyInfoTagId,
    signedInfoTagId,
    signedPropertiesRefTagId,
    signedPropertiesTagHash,
    signedPropertiesTagId
  });

  const signedSignedInfoTag = sign(c14nCanonicalize(signedInfoTag, { inheritedNamespaces: [{ prefix: 'ds', uri: XmlProperties.namespaces.ds }] }), privateKey);

  const signatureTag = buildSignatureTag({
    keyInfoTag,
    signatureTagId,
    signatureObjectTagId,
    signedInfoTag,
    signedSignedInfoTag,
    signatureValueTagId,
    signedPropertiesTag
  });

  return insertSignatureIntoInvoiceXml(docXml, signatureTag, documentType);
}

/**
 *
 * @param xml The invoice XML to be signed.
 * @param pkcs12Data The pkcs12 file (.p12/.pfx) data expressed as a node Buffer or base64 string.
 * @param options Options are:
 * - **pkcs12Password**: The pkcs12 file password. Defaults to no password.
 * @returns
 */
export const signInvoiceXml = (xml: string, pkcs12Data: string | Buffer, options?: signXmlOptions) => {
  return signDocumentXml(xml, pkcs12Data, 'factura', options);
}

/**
 *
 * @param xml The debit note XML to be signed.
 * @param pkcs12Data The pkcs12 file (.p12/.pfx) data expressed as a node Buffer or base64 string.
 * @param options Options are:
 * - **pkcs12Password**: The pkcs12 file password. Defaults to no password.
 * @returns
 */
export const signDebitNoteXml = (xml: string, pkcs12Data: string | Buffer, options?: signXmlOptions) => {
  return signDocumentXml(xml, pkcs12Data, 'notaDebito', options);
}

/**
 *
 * @param xml The credit note XML to be signed.
 * @param pkcs12Data The pkcs12 file (.p12/.pfx) data expressed as a node Buffer or base64 string.
 * @param options Options are:
 * - **pkcs12Password**: The pkcs12 file password. Defaults to no password.
 * @returns
 */
export const signCreditNoteXml = (xml: string, pkcs12Data: string | Buffer, options?: signXmlOptions) => {
  return signDocumentXml(xml, pkcs12Data, 'notaCredito', options);
}

/**
 *
 * @param xml The retention voucher XML to be signed.
 * @param pkcs12Data The pkcs12 file (.p12/.pfx) data expressed as a node Buffer or base64 string.
 * @param options Options are:
 * - **pkcs12Password**: The pkcs12 file password. Defaults to no password.
 * @returns
 */
export const signRetentionVoucherXml = (xml: string, pkcs12Data: string | Buffer, options?: signXmlOptions) => {
  return signDocumentXml(xml, pkcs12Data, 'comprobanteRetencion', options);
}

/**
 *
 * @param xml The shipping guide XML to be signed.
 * @param pkcs12Data The pkcs12 file (.p12/.pfx) data expressed as a node Buffer or base64 string.
 * @param options Options are:
 * - **pkcs12Password**: The pkcs12 file password. Defaults to no password.
 * @returns
 */
export const signShippingGuideXml = (xml: string, pkcs12Data: string | Buffer, options?: signXmlOptions) => {
  return signDocumentXml(xml, pkcs12Data, 'guiaRemision', options);
}
