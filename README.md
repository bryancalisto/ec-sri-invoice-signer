# 🇪🇨 ec-sri-invoice-signer 🇪🇨
Firmador de comprobantes electrónicos del Servicio de Rentas Internas (SRI) ecuatoriano. Soporta facturas, notas de crédito, notas de débito, comprobantes de retención y guías de remisión. Está escrito en puro TypeScript, sin dependencias de binarios criptográficos como OpenSSL, DLLs con el código de firmado, JARs o similares.

Funciona en Windows, Unix / Linux, o cualquier plataforma que soporte Node.js, sin configuraciones adicionales.

## Guía de uso

1. Instala el paquete.
  ```bash
  npm i ec-sri-invoice-signer
  ```
2. Usa la función correspondiente en tu código para firmar el documento respectivo. En este ejemplo se firmará una factura:
  ```js
  import fs from 'fs';
  import {
    signInvoiceXml,
    // Otras funciones disponibles:
    // signPurchaseLiquidationXml,
    // signDebitNoteXml,
    // signCreditNoteXml,
    // signDeliveryGuideXml,
    // signWithholdingCertificateXml,
    } from 'ec-sri-invoice-signer';
  /* Puedes user require() si usas módulos commonJS. */

  /* El XML del documento a firmarse. */
  const invoiceXml = '<factura id="comprobante>...</factura>';

  /* El contenido del archivo pkcs12 (.p12/.pfx extension) del firmante representado como Node Buffer o string base64.
  En este caso es un Node Buffer. */
  const p12FileData = fs.readFileSync('signature.p12');

  /* Firma la factura. Si no se pasa la opción pkcs12Password, '' será usada como contraseña. */
  const signedInvoice = signInvoiceXml(invoiceXml, p12FileData, { pkcs12Password: 'thePKCS12FilePassword' });

  doSomethingWithTheSignedInvoice(signedInvoice);
  ```

  Así mismo puedes firmar otros tipos de documentos.
  ```js
  /* Firma notas de débito */
  const signedDebitNote = signDebitNoteXml(debitNoteXml, p12FileData, { pkcs12Password: 'thePKCS12FilePassword' });

  /* Firma notas de crédito */
  const signedCreditNote = signCreditNoteXml(creditNoteXml, p12FileData, { pkcs12Password: 'thePKCS12FilePassword' });

  /* Firma guías de remisión */
  const signedDeliveryGuide = signDeliveryGuideXml(deliveryGuideXml, p12FileData, { pkcs12Password: 'thePKCS12FilePassword' });

  /* Firma comprobantes de retención */
  const signedWithholdingCertificate = signWithholdingCertificateXml(withholdingCertificateXml, p12FileData, { pkcs12Password: 'thePKCS12FilePassword' });
  ```

3. Si este paquete te ha ayudado, considera dejar tu ⭐.

 ## Notas importantes sobre la estructura del XML
 Este paquete no implementa la especificación de [canonicalización](https://en.wikipedia.org/wiki/Canonicalization) http://www.w3.org/TR/2001/REC-xml-c14n-20010315 por completo.
 El XML es un lenguaje con muchas características sofisticadas que, probablemente, no tienen mucha cabida en una aplicación de facturación electrónica en el marco del SRI.
 Por tal razón, solo se implementa las partes del estándar requeridas para soportar XML con características relativamente comunes. Esto debería cubrir la mayoría de los casos de uso.

 Estas son las características requeridas del XML que se pretende firmar (ninguna de las características no soportadas es requerida para el intercambio de datos con el SRI):
 - El documento a firmarse debe consistir del nodo raíz (e.g. `factura` o `notaDebito`) con su respectivo id 'comprobante', su versión y sus etiquetas hijas describiendo el contenido del documento (sin otros namespaces).
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

 ## Manejo de errores
Este paquete exporta clases de error específicas para facilitar el manejo de excepciones:

- `XmlFormatError`: Lanzado cuando el XML proporcionado no tiene un formato válido.
- `UnsuportedPkcs12Error`: Lanzado cuando el archivo .p12 no es soportado o la contraseña es incorrecta.
- `UnsupportedXmlFeatureError`: Lanzado cuando el XML contiene características no soportadas (como `DOCTYPE` o `xmlns`).
- `UnsupportedDocumentTypeError`: Lanzado cuando el tipo de documento (nodo raíz) no es soportado.

Ejemplo de manejo:
```js
import { signInvoiceXml, XmlFormatError, UnsupportedXmlFeatureError } from 'ec-sri-invoice-signer';

try {
  const signedInvoice = signInvoiceXml(invoiceXml, p12FileData, { pkcs12Password });
} catch (error) {
  if (error instanceof XmlFormatError) {
    console.error('El XML tiene errores de formato');
  } else if (error instanceof UnsupportedXmlFeatureError) {
    console.error('El XML contiene características no soportadas:', error.message);
  } else {
    console.error('Error inesperado:', error.message);
  }
}
```

## Nota importante sobre los archivos .p12
El paquete se ha probado satisfactoriamente usando .p12 de estos proveedores (no tengo .p12 de otros proveedores y tampoco he podido recibir el feedback de usuarios del paquete usando otras firmas):
- Uanataca.
- Security Data.
- Lazzate.

Si pruebas el paquete con .p12 de otros proveedores y encuentras problemas, por favor crea un [issue](https://github.com/bryancalisto/ec-sri-invoice-signer/issues)


## Herramientas para prueba directa con servicios del SRI
El repositorio incluye herramientas para probar el firmado de facturas y notas de débito contra los servidores del SRI en modo 'prueba'.

Para usarlas, primero configura los parámetros correspondientes al tipo de documento que quieres probar. Los scripts tomarán los parámetros configurados, firmarán el documento y lo enviarán al SRI para su validación y consultarán el servicio del SRI para verificar el estado del documento, reportando el resultado.

**Nota:** No olvides primero ubicarte en la raíz del proyecto de node (directorio `ec-sri-invoice-signer/` donde está el package.json) antes de correr los comandos siguientes.

### Facturas
Crea el archivo `test/sri-live-test/invoice/invoice-params.json` (usa `test/sri-live-test/invoice/invoice-params-template.json` como plantilla).

Corre la prueba:

```bash
npm run test:sri:invoice
```

### Notas de Débito
Crea el archivo `test/sri-live-test/debit-note/debit-note-params.json` (usa `test/sri-live-test/debit-note/debit-note-params-template.json` como plantilla).

Corre la prueba:

```bash
npm run test:sri:debit-note
```

### Notas de Crédito
Crea el archivo `test/sri-live-test/credit-note/credit-note-params.json` (usa `test/sri-live-test/credit-note/credit-note-params-template.json` como plantilla).

Corre la prueba:

```bash
npm run test:sri:credit-note
```

### Guías de Remisión
Crea el archivo `test/sri-live-test/delivery-guide/delivery-guide-params.json` (usa `test/sri-live-test/delivery-guide/delivery-guide-params-template.json` como plantilla).

Corre la prueba:

```bash
npm run test:sri:delivery-guide
```

### Comprobantes de Retención
Crea el archivo `test/sri-live-test/withholding-certificate/withholding-certificate-params.json` (usa `test/sri-live-test/withholding-certificate/withholding-certificate-params-template.json` como plantilla).

Corre la prueba:

```bash
npm run test:sri:withholding-certificate
```
