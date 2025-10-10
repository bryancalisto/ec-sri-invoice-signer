# 🇪🇨 ec-sri-invoice-signer 🇪🇨
Firmador de comprobantes electrónicos del SRI ecuatoriano. Soporta facturas, notas de crédito, notas de débito, comprobantes de retención y guías de remisión basado en las especificaciones del Servicio de Rentas Internas (SRI) ecuatoriano. Está escrito en puro TypeScript/JavaScript, sin dependencias de binarios criptográficos como OpenSSL, DLLs con el código de firmado o similares.
Por tal razón, funciona en Windows, Unix/Linux o cualquier plataforma que soporte Node.js sin configuraciones adicionales.

## Guía de uso

1. Instala el paquete.
  ```bash
  npm i ec-sri-invoice-signer
  ```
2. Usa la función correspondiente en tu código para firmar el documento respectivo:
  ```js
  import fs from 'fs';
  import {
    signInvoiceXml,
    signDebitNoteXml,
    signCreditNoteXml,
    signRetentionVoucherXml,
    signShippingGuideXml
  } from 'ec-sri-invoice-signer';
  /* Puedes usar require() si usas módulos commonJS. */

  /* El XML del documento a firmarse. */
  const invoiceXml = '<factura id="comprobante>...</factura>';

  /* El contenido del archivo pkcs12 (.p12/.pfx extension) del firmante representado como Node Buffer o string base64.
  En este caso es un Node Buffer. */
  const p12FileData = fs.readFileSync('signature.p12');

  /* Firma la factura. Si no se pasa la opción pkcs12Password, '' será usada como contraseña. */
  const signedInvoice = signInvoiceXml(invoiceXml, p12FileData, { pkcs12Password: 'thePKCS12FilePassword' });

  /* También puedes firmar otros tipos de documentos: */
  const signedDebitNote = signDebitNoteXml(debitNoteXml, p12FileData, { pkcs12Password: 'thePKCS12FilePassword' });
  const signedCreditNote = signCreditNoteXml(creditNoteXml, p12FileData, { pkcs12Password: 'thePKCS12FilePassword' });
  const signedRetentionVoucher = signRetentionVoucherXml(retentionXml, p12FileData, { pkcs12Password: 'thePKCS12FilePassword' });
  const signedShippingGuide = signShippingGuideXml(shippingGuideXml, p12FileData, { pkcs12Password: 'thePKCS12FilePassword' });

  doSomethingWithTheSignedInvoice(signedInvoice);
  ```
3. Si este paquete te ha ayudado, considera dejar tu ⭐.

## Validación XML mejorada

El paquete ahora incluye validación XML exhaustiva que detecta características no soportadas y proporciona mensajes de error descriptivos:

- ✅ **Detección automática de tipo de documento**: El paquete detecta automáticamente si el XML es una factura, nota de crédito, nota de débito, comprobante de retención o guía de remisión
- ✅ **Validación de estructura**: Verifica que el documento tenga los atributos requeridos (Id, versión)
- ✅ **Detección de características no soportadas**: Identifica namespaces, DOCTYPE, atributos xml:prefijados, etc.
- ✅ **Mensajes de error claros**: Proporciona descripciones específicas para facilitar la depuración

### Ejemplos de mensajes de error:
```
Unsupported XML feature: namespace declarations. Namespace declarations (xmlns:) are not supported in the document root. This library adds the necessary namespaces automatically during signing.

Unsupported XML feature: missing Id attribute. Root element 'factura' must have an 'Id' attribute (case-insensitive) with value 'comprobante'.

Unsupported document type: 'documentoInvalido'. Supported types are: factura, notaDebito, notaCredito, comprobanteRetencion, guiaRemision.
```

## Tipos de documentos soportados

| Documento | Función | Código SRI |
|-----------|---------|------------|
| Factura | `signInvoiceXml(xml, p12, options)` | 01 |
| Nota de Crédito | `signCreditNoteXml(xml, p12, options)` | 04 |
| Nota de Débito | `signDebitNoteXml(xml, p12, options)` | 05 |
| Guía de Remisión | `signShippingGuideXml(xml, p12, options)` | 06 |
| Comprobante de Retención | `signRetentionVoucherXml(xml, p12, options)` | 07 |

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

## Nota importante sobre los archivos .p12
El paquete se ha probado satisfactoriamente usando .p12 de estos proveedores (no tengo .p12 de otros proveedores y tampoco he podido recibir el feedback de usuarios del paquete usando otras firmas):
- Uanataca.
- Security Data.
- Lazzate.

Si pruebas el paquete con .p12 de otros proveedores y encuentras problemas, por favor crea un [issue](https://github.com/bryancalisto/ec-sri-invoice-signer/issues)


## Herramientas para prueba directa con servicios del SRI
El paquete incluye herramientas para probar el firmado de facturas y notas de débito contra los servidores del SRI en modo 'prueba'.
Para usarlas, primero configura los parámetros en `test/sri-live-test/invoice/invoice-params.json` (usa `test/sri-live-test/invoice/invoice-params-template.json` como plantilla) y `test/sri-live-test/debit-note/debit-note-params.json` (usa `test/sri-live-test/debit-note/debit-note-params-template.json` como plantilla).
Luego, puedes correr las pruebas con los siguientes comandos:

```bash
npm run test:sri:invoice
npm run test:sri:debit-note
```

Los scripts tomarán los parámetros configurados, firmarán el documento y lo enviarán al SRI para su validación y consultarán el servicio del SRI para verificar el estado del documento.
