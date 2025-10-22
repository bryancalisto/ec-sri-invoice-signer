import { signXmlOptions } from './signature/signature';

export function signInvoiceXml(invoiceXml: string, pkcs12Data: string | Buffer, options?: signXmlOptions): string;
export function signDebitNoteXml(debitNoteXml: string, pkcs12Data: string | Buffer, options?: signXmlOptions): string;
export function signCreditNoteXml(creditNoteXml: string, pkcs12Data: string | Buffer, options?: signXmlOptions): string;
export function signDeliveryGuideXml(deliveryGuideXml: string, pkcs12Data: string | Buffer, options?: signXmlOptions): string;
