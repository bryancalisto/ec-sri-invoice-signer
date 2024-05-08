# ec-sri-invoice-signer
Firmador de facturas basado en las especificaciones del Servicio de Rentas Internas (SRI) ecuatoriano. Está escrito en puro TypeScript/JavaScript, sin dependencias de binarios criptográficos como OpenSSL, DLLs con el código de firmado o similares.
Por tal razón, funciona en Windows, Unix/Linux o cualquier plataforma que soporte Node.js sin configuraciones adicionales.

## Guía de uso

1. Instala el paquete.
  ```bash
  npm i ec-sri-invoice-signer
  ```
2. Usa la función `signInvoiceXml` en tu código para firmar la factura:
  ```js
  import fs from 'fs';
  import { signInvoiceXml } from 'ec-sri-invoice-signer';
  /* Puedes user require() si usas módulos commonJS. */

  /* El XML de la factura a firmarse. */
  const invoiceXml = '<factura id="comprobante>...</factura>';

  /* El contenido del archivo pkcs12 (.p12/.pfx extension) del firmante representado como Node Buffer o string base64.
  En este caso es un Node Buffer. */
  const p12FileData = fs.readFileSync('signature.p12');

  /* Firma la factura. Si no se pasa la opción pkcs12Password, '' será usada como contraseña. */
  const signedInvoice = signInvoiceXml(invoiceXml, p12FileData, { pkcs12Password: 'thePKCS12FilePassword' });

  doSomethingWithTheSignedInvoice(signedInvoice);
  ```
3. Si este paquete te ha ayudado, considera dejar tu estrella en<a style="
    display: inline-block;
    color: #d9deda;
    width: fit-content;
    padding: 1px 9px;
    text-align: center;
    border-radius: 6px;
    font-weight: bold;"
    href="https://github.com/bryancalisto/ec-sri-invoice-signer">GitHub ⭐</a>.

 ## Notas importantes sobre la estructura del XML
 Este paquete no implementa la especificación de [canonicalización](https://en.wikipedia.org/wiki/Canonicalization) http://www.w3.org/TR/2001/REC-xml-c14n-20010315 por completo.
 El XML es un lenguaje con muchas características sofisticadas que, probablemente, no tienen mucha cabida en una aplicación de facturación electrónica en el marco del SRI.
 Por tal razón, solo se implementa las partes del estándar requeridas para soportar XML con características relativamente comunes. Esto debería cubrir la mayoría de los casos de uso.

 Estas son las características requeridas del XML que se pretende firmar (ninguna de las características no soportadas es requerida para el intercambio de datos con el SRI):
 - La factura a firmarse debe consistir del nodo factura con su respectivo id 'comprobante', su versión y sus etiquetas hijas describiendo el contenido de la factura (sin otros namespaces).
 ```xml
 <?xml version="1.0" encoding="UTF-8"?>
 <factura Id="comprobante" version="1.1.0">
  <infoTributaria>...</infoTributaria>
  <infoFactura>...</infoFactura>
  <detalles>...</detalles>
 <factura>
 ```
 - La declaración del documento XML es opcional.
 ```xml
 <!-- Con declaración -->
 <?xml version="1.0" encoding="UTF-8"?>
 <factura Id="comprobante" version="1.1.0">
 ...
 </factura>
 ```
 o
 ```xml
 <!-- Sin declaración -->
 <factura Id="comprobante" version="1.1.0">
 ...
 </factura>
 ```
 son igual de válidos.
 - La factura debe estar en formato UTF-8.
 - No namespaces (xmlns).
 ```xml
 <!-- En este ejemplo, el xmlns:ds="..." debe ser eliminado. Como contexto, ningún namespace es necesario
 para la factura en sí. Este paquete se encarga de colocar los namespaces necesarios en la firma digital
  generada -->
 <factura Id="comprobante" version="1.1.0" xmlns:ds="...">
 ...
 </factura>
 ```

 ```xml
 <!-- Esto es soportado -->
 <factura Id="comprobante" version="1.1.0">
 ...
 </factura>
 ```
 - No etiquetas de Document Type Definition (DOCTYPE).
 ```xml
 <!-- Esto no es soportado -->
  <!DOCTYPE note
  [
  <!ELEMENT note (to,from,heading,body)>
  <!ELEMENT to (#PCDATA)>
  <!ELEMENT from (#PCDATA)>
  <!ELEMENT heading (#PCDATA)>
  <!ELEMENT body (#PCDATA)>
  ]>
 <factura Id="comprobante" version="1.1.0">
 ...
 <factura>
 ```
 - No atributos con prefijo xml (xml:<attr_name>).
 ```xml
 <!-- Esto no es soportado debido a xml:foo="123"-->
 <factura Id="comprobante" version="1.1.0" xml:foo="123">
 ...
 </factura>
 ```
