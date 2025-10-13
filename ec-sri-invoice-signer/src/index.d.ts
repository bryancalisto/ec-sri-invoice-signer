import { signXmlOptions } from './signature/signature';

// Document signing functions
export function signInvoiceXml(invoiceXml: string, pkcs12Data: string | Buffer, options?: signXmlOptions): string;
export function signDebitNoteXml(debitNoteXml: string, pkcs12Data: string | Buffer, options?: signXmlOptions): string;
export function signCreditNoteXml(creditNoteXml: string, pkcs12Data: string | Buffer, options?: signXmlOptions): string;
export function signRetentionVoucherXml(retentionVoucherXml: string, pkcs12Data: string | Buffer, options?: signXmlOptions): string;
export function signShippingGuideXml(shippingGuideXml: string, pkcs12Data: string | Buffer, options?: signXmlOptions): string;
export function signPurchaseLiquidationXml(purchaseLiquidationXml: string, pkcs12Data: string | Buffer, options?: signXmlOptions): string;

// Access key utilities
export interface AccessKeyComponents {
  date: string;
  documentType: string;
  ruc: string;
  environment: "01" | "02";
  establishment: string;
  emissionPoint: string;
  sequential: string;
  numericCode?: string;
}

export function generateAccessKey(components: AccessKeyComponents): string;
export function validateAccessKey(accessKey: string): boolean;
export function calculateCheckDigit(accessKeyWithoutCheckDigit: string): number;
export function parseAccessKey(accessKey: string): AccessKeyComponents & { checkDigit: string };
