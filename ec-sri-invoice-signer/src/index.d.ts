import { signXmlOptions } from './signature/signature';

export function signInvoiceXml(invoiceXml: string, pkcs12Data: string | Buffer, options?: signXmlOptions): string;
export function signDebitNoteXml(debitNoteXml: string, pkcs12Data: string | Buffer, options?: signXmlOptions): string;
