import { signXmlOptions } from './signature/signature';

export class XmlFormatError extends Error {
  name: string;
}

export class UnsuportedPkcs12Error extends Error {
  name: string;
}

export class UnsupportedXmlFeatureError extends Error {
  name: string;
}

export class UnsupportedDocumentTypeError extends Error {
  name: string;
}

export function signInvoiceXml(invoiceXml: string, pkcs12Data: string | Buffer, options?: signXmlOptions): string;
export function signDebitNoteXml(debitNoteXml: string, pkcs12Data: string | Buffer, options?: signXmlOptions): string;
export function signCreditNoteXml(creditNoteXml: string, pkcs12Data: string | Buffer, options?: signXmlOptions): string;
export function signDeliveryGuideXml(deliveryGuideXml: string, pkcs12Data: string | Buffer, options?: signXmlOptions): string;
export function signWithholdingCertificateXml(withholdingCertificateXml: string, pkcs12Data: string | Buffer, options?: signXmlOptions): string;
