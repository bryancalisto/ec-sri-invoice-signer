# ec-sri-invoice-signer
Firmador de facturas basado en las especificaciones del Servicio de Rentas Internas (SRI) ecuatoriano. Está escrito en puro TypeScript/JavaScript, sin dependencias de binarios criptográficos como OpenSSL o similares.

### Guía de uso

Instala el paquete.
  ```bash
  npm i ec-sri-invoice-signer
  ```
Usa la función `signInvoiceXml` en tu código para firmar la factura:
  ```js
  import fs from 'fs';
  import { signInvoiceXml } from 'ec-sri-invoice-signer';
  // Can import with require() if working with commonJS modules.

  // The invoice XML to be signed.
  const invoiceXml = '<factura id="comprobante>...</factura>';

  // The invoice signer's pkcs12 file (.p12/.pfx extension) content as Node Buffer or base64 string. Here it's a Node Buffer.
  const p12FileData = fs.readFileSync('signature.p12');

  // Sign the invoice. If no pkcs12Password option is provided, '' will be used.
  const signedInvoice = signInvoiceXml(invoiceXml, p12FileData, { pkcs12Password: 'thePKCS12FilePassword' });

  doSomethingWithTheSignedInvoice(signedInvoice);
  ```

