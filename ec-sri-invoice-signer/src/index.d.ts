import { signInvoiceXmlOptions } from './signature/signature';

export function signInvoiceXml(invoiceXml: string, pkcs12Data: string | Buffer, options?: signInvoiceXmlOptions): string;
