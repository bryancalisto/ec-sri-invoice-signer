# ec-sri-invoice-signer
Firmador de facturas basado en las especificaciones del Servicio de Rentas Internas (SRI) ecuatoriano. Está escrito en puro TypeScript/JavaScript, sin dependencias de binarios criptográficos como OpenSSL o similares.

## Guía de uso

Instala el paquete.
  ```bash
  npm i ec-sri-invoice-signer
  ```
Usa la función `signInvoiceXml` en tu código para firmar la factura:
  ```js
  import fs from 'fs';
  import { signInvoiceXml } from 'ec-sri-invoice-signer';
  /* Can import with require() if working with commonJS modules. */

  /* The invoice XML to be signed. */
  const invoiceXml = '<factura id="comprobante>...</factura>';

  /* The invoice signer's pkcs12 file (.p12/.pfx extension) content as Node Buffer or base64 string.
  Here it's a Node Buffer. */
  const p12FileData = fs.readFileSync('signature.p12');

  /* Sign the invoice. If no pkcs12Password option is provided, '' will be used. */
  const signedInvoice = signInvoiceXml(invoiceXml, p12FileData, { pkcs12Password: 'thePKCS12FilePassword' });

  doSomethingWithTheSignedInvoice(signedInvoice);
  ```

 ## Nota importante sobre la el formato del XML.
 Este paquete no implemeneta la especificación de canonicalización http://www.w3.org/TR/2001/REC-xml-c14n-20010315 por completo. Solo implementa el es estándar para soportar XML con características comunes (Esto debería cubrir la mayoría de los casos de uso).
 Por ahora no se implementará la especificación completa ya que el software del SRI no requiere el uso de las características sofisticadas de XML.

 Estas son las características requeridas del XML que se pretende firmar (ninguna de las características no soportadas es requerida para el intercambio de datos con el SRI):
 - La factura a firmarse debe consistir del nodo factura con su respectivo id 'comprobante' y sus etiquetas hijas describiendo el contenido de la factura (sin otros id ni namespaces).
 ```xml
 <?xml version="1.0" encoding="UTF-8"?>
 <factura Id="comprobante">
  <infoTributaria>...</infoTributaria>
  <infoFactura>...</infoFactura>
  <detalles>...</detalles>
 <factura>
 ```
 - La declaración del documento XML es opcional.
 ```xml
 <?xml version="1.0" encoding="UTF-8"?><factura Id="comprobante">...</factura>
 ```
 o
 ```xml
 <factura Id="comprobante">...</factura>
 ```
 son igual de válidos.
 - La factura debe estar en formato UTF-8.
 - No namespaces (xmlns).
 ```xml
 <!-- En este ejemplo, el xmlns:ds="..." debe ser eliminado. Como contexto, ningún namespace es necesario
 para la factura en sí. Este paquete se encarga de colocar los namespaces necesarios en la firma digital
  generada -->
 <factura Id="comprobante" xmlns:ds="...">...</factura>
 ```

 ```xml
 <!-- Esto es soportado -->
 <factura Id="comprobante">...</factura>
 ```
 - No CDATA.
 ```xml
 <!-- Esto no es soportado -->
 <factura Id="comprobante">
  <detalles>
    <detalle><![CDATA[Foo]]></detalle>
  </detalles>
 </factura>
 ```
```xml
 <!-- Esto es soportado -->
 <factura Id="comprobante">
  <detalles>
    <detalle>Foo</detalle>
  </detalles>
 </factura>
```
 - No XML, HTML u otros tipos de entidades.
 ```xml
 <!-- Esto no es soportado, pero lo será pronto ya que, más que nada, las comillas simples y dobles son algo
  común -->
 <factura Id="comprobante">
  <detalles>
    <!-- El contenido de <detalle> equivale a '<foo="bar">' -->
    <detalle>&apos;&lt;foo=&quot;bar&quot;&gt;&apos;</detalle>
  </detalles>
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
 <factura Id="comprobante">...<factura>
 ```
 - No atributos con prefijo xml (xml:<attr_name>).
 ```xml
 <!-- Esto no es soportado -->
 <factura Id="comprobante" xml:foo="123">...</factura>
 ```