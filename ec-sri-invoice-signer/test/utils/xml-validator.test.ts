import { jest, describe, test, expect } from "@jest/globals";
import {
  validateXmlForSigning,
  UnsupportedXmlFeatureError,
  UnsupportedDocumentTypeError,
  XmlFormatError
} from "../../src/utils/xml-validator";

describe("XML Validator", () => {
  describe("validateXmlForSigning", () => {
    test("should validate a proper invoice XML", () => {
      const validInvoiceXml = `<?xml version="1.0" encoding="UTF-8"?>
      <factura Id="comprobante" version="1.1.0">
        <infoTributaria>
          <ambiente>1</ambiente>
          <tipoEmision>1</tipoEmision>
          <ruc>1234567890123</ruc>
          <claveAcceso>0106202301123456789012345678901234567890123456789012</claveAcceso>
          <codDoc>01</codDoc>
          <estab>001</estab>
          <ptoEmi>001</ptoEmi>
          <secuencial>000000001</secuencial>
          <dirMatriz>VIA PRINCIPAL N12-34 Y SECUNDARIA</dirMatriz>
        </infoTributaria>
        <infoFactura>
          <fechaEmision>01/06/2023</fechaEmision>
          <dirEstablecimiento>VIA PRINCIPAL N12-34</dirEstablecimiento>
          <contribuyenteRazonSocial>EMPRESA DE PRUEBA SA</contribuyenteRazonSocial>
          <obligadoContabilidad>SI</obligadoContabilidad>
          <tipoIdentificacionComprador>04</tipoIdentificacionComprador>
          <guiaRemision>001-001-000000001</guiaRemision>
          <totalSinImpuestos>100.00</totalSinImpuestos>
          <totalDescuento>0.00</totalDescuento>
          <totalConImpuestos>
            <totalImpuesto>
              <codigo>2</codigo>
              <codigoPorcentaje>2</codigoPorcentaje>
              <baseImponible>100.00</baseImponible>
              <valor>12.00</valor>
            </totalImpuesto>
          </totalConImpuestos>
          <propina>0.00</propina>
          <importeTotal>112.00</importeTotal>
          <moneda>DOLAR</moneda>
          <pagos>
            <pago>
              <formaPago>01</formaPago>
              <total>112.00</total>
              <plazo>30</plazo>
              <unidadTiempo>dias</unidadTiempo>
            </pago>
          </pagos>
        </infoFactura>
        <detalles>
          <detalle>
            <codigoPrincipal>PROD001</codigoPrincipal>
            <descripcion>PRODUCTO DE PRUEBA</descripcion>
            <cantidad>1</cantidad>
            <precioUnitario>100.00</precioUnitario>
            <descuento>0.00</descuento>
            <precioTotalSinImpuesto>100.00</precioTotalSinImpuesto>
            <impuestos>
              <impuesto>
                <codigo>2</codigo>
                <codigoPorcentaje>2</codigoPorcentaje>
                <tarifa>12</tarifa>
                <baseImponible>100.00</baseImponible>
                <valor>12.00</valor>
              </impuesto>
            </impuestos>
          </detalle>
        </detalles>
      </factura>`;

      const documentType = validateXmlForSigning(validInvoiceXml);
      expect(documentType).toBe("factura");
    });

    test("should validate a proper debit note XML", () => {
      const validDebitNoteXml = `<?xml version="1.0" encoding="UTF-8"?>
      <notaDebito Id="comprobante" version="1.1.0">
        <infoTributaria>
          <ambiente>1</ambiente>
          <tipoEmision>1</tipoEmision>
          <ruc>1234567890123</ruc>
          <claveAcceso>0106202301123456789012345678901234567890123456789012</claveAcceso>
          <codDoc>05</codDoc>
          <estab>001</estab>
          <ptoEmi>001</ptoEmi>
          <secuencial>000000001</secuencial>
          <dirMatriz>VIA PRINCIPAL N12-34 Y SECUNDARIA</dirMatriz>
        </infoTributaria>
        <infoNotaDebito>
          <fechaEmision>01/06/2023</fechaEmision>
          <dirEstablecimiento>VIA PRINCIPAL N12-34</dirEstablecimiento>
          <tipoIdentificacionComprador>04</tipoIdentificacionComprador>
          <razonSocialComprador>EMPRESA CLIENTE SA</razonSocialComprador>
          <identificacionComprador>1234567890123</identificacionComprador>
          <codDocModificado>01</codDocModificado>
          <numDocModificado>001-001-000000001</numDocModificado>
          <fechaEmisionDocSustento>01/06/2023</fechaEmisionDocSustento>
          <totalSinImpuestos>100.00</totalSinImpuestos>
          <valorTotal>112.00</valorTotal>
          <pagos>
            <pago>
              <formaPago>01</formaPago>
              <total>112.00</total>
              <plazo>30</plazo>
              <unidadTiempo>dias</unidadTiempo>
            </pago>
          </pagos>
        </infoNotaDebito>
        <detalles>
          <detalle>
            <razonModificacion>AUMENTO EN EL VALOR</razonModificacion>
            <valor>10.00</valor>
            <impuestos>
              <impuesto>
                <codigo>2</codigo>
                <codigoPorcentaje>2</codigoPorcentaje>
                <tarifa>12</tarifa>
                <baseImponible>10.00</baseImponible>
                <valor>1.20</valor>
              </impuesto>
            </impuestos>
          </detalle>
        </detalles>
      </notaDebito>`;

      const documentType = validateXmlForSigning(validDebitNoteXml);
      expect(documentType).toBe("notaDebito");
    });

    test("should validate a proper credit note XML", () => {
      const validCreditNoteXml = `<?xml version="1.0" encoding="UTF-8"?>
      <notaCredito Id="comprobante" version="1.1.0">
        <infoTributaria>
          <ambiente>1</ambiente>
          <tipoEmision>1</tipoEmision>
          <ruc>1234567890123</ruc>
          <claveAcceso>0106202301123456789012345678901234567890123456789012</claveAcceso>
          <codDoc>04</codDoc>
          <estab>001</estab>
          <ptoEmi>001</ptoEmi>
          <secuencial>000000001</secuencial>
          <dirMatriz>VIA PRINCIPAL N12-34 Y SECUNDARIA</dirMatriz>
        </infoTributaria>
        <infoNotaCredito>
          <fechaEmision>01/06/2023</fechaEmision>
          <dirEstablecimiento>VIA PRINCIPAL N12-34</dirEstablecimiento>
          <tipoIdentificacionComprador>04</tipoIdentificacionComprador>
          <razonSocialComprador>EMPRESA CLIENTE SA</razonSocialComprador>
          <identificacionComprador>1234567890123</identificacionComprador>
          <codDocModificado>01</codDocModificado>
          <numDocModificado>001-001-000000001</numDocModificado>
          <fechaEmisionDocSustento>01/06/2023</fechaEmisionDocSustento>
          <totalSinImpuestos>100.00</totalSinImpuestos>
          <valorModificacion>10.00</valorModificacion>
          <moneda>DOLAR</moneda>
          <totalConImpuestos>
            <totalImpuesto>
              <codigo>2</codigo>
              <codigoPorcentaje>2</codigoPorcentaje>
              <baseImponible>10.00</baseImponible>
              <valor>1.20</valor>
            </totalImpuesto>
          </totalConImpuestos>
          <valorTotal>11.20</valorTotal>
        </infoNotaCredito>
        <detalles>
          <detalle>
            <codigoInterno>PROD001</codigoInterno>
            <descripcion>PRODUCTO DEVUELTO</descripcion>
            <cantidad>1</cantidad>
            <precioUnitario>10.00</precioUnitario>
            <descuento>0.00</descuento>
            <precioTotalSinImpuesto>10.00</precioTotalSinImpuesto>
            <impuestos>
              <impuesto>
                <codigo>2</codigo>
                <codigoPorcentaje>2</codigoPorcentaje>
                <tarifa>12</tarifa>
                <baseImponible>10.00</baseImponible>
                <valor>1.20</valor>
              </impuesto>
            </impuestos>
          </detalle>
        </detalles>
      </notaCredito>`;

      const documentType = validateXmlForSigning(validCreditNoteXml);
      expect(documentType).toBe("notaCredito");
    });

    test("should validate a proper retention voucher XML", () => {
      const validRetentionXml = `<?xml version="1.0" encoding="UTF-8"?>
      <comprobanteRetencion Id="comprobante" version="1.0.0">
        <infoTributaria>
          <ambiente>1</ambiente>
          <tipoEmision>1</tipoEmision>
          <ruc>1234567890123</ruc>
          <claveAcceso>0106202301123456789012345678901234567890123456789012</claveAcceso>
          <codDoc>07</codDoc>
          <estab>001</estab>
          <ptoEmi>001</ptoEmi>
          <secuencial>000000001</secuencial>
          <dirMatriz>VIA PRINCIPAL N12-34 Y SECUNDARIA</dirMatriz>
        </infoTributaria>
        <infoCompRetencion>
          <fechaEmision>01/06/2023</fechaEmision>
          <dirEstablecimiento>VIA PRINCIPAL N12-34</dirEstablecimiento>
          <obligadoContabilidad>SI</obligadoContabilidad>
          <tipoIdentificacionSujetoRetenido>04</tipoIdentificacionSujetoRetenido>
          <razonSocialSujetoRetenido>EMPRESA PROVEEDORA SA</razonSocialSujetoRetenido>
          <identificacionSujetoRetenido>1234567890123</identificacionSujetoRetenido>
          <periodoFiscal>06/2023</periodoFiscal>
        </infoCompRetencion>
        <impuestos>
          <impuesto>
            <codigo>1</codigo>
            <codigoRetencion>1</codigoRetencion>
            <baseImponible>1000.00</baseImponible>
            <porcentajeRetener>1.0</porcentajeRetener>
            <valorRetenido>10.00</valorRetenido>
            <codDocSustento>01</codDocSustento>
            <numDocSustento>001-001-000000001</numDocSustento>
            <fechaEmisionDocSustento>01/06/2023</fechaEmisionDocSustento>
          </impuesto>
        </impuestos>
        <infoAdicional>
          <campoAdicional nombre="Email">cliente@ejemplo.com</campoAdicional>
          <campoAdicional nombre="Teléfono">+593 2 1234567</campoAdicional>
        </infoAdicional>
      </comprobanteRetencion>`;

      const documentType = validateXmlForSigning(validRetentionXml);
      expect(documentType).toBe("comprobanteRetencion");
    });

    test("should validate a proper shipping guide XML", () => {
      const validShippingGuideXml = `<?xml version="1.0" encoding="UTF-8"?>
      <guiaRemision Id="comprobante" version="1.1.0">
        <infoTributaria>
          <ambiente>1</ambiente>
          <tipoEmision>1</tipoEmision>
          <ruc>1234567890123</ruc>
          <claveAcceso>0106202301123456789012345678901234567890123456789012</claveAcceso>
          <codDoc>06</codDoc>
          <estab>001</estab>
          <ptoEmi>001</ptoEmi>
          <secuencial>000000001</secuencial>
          <dirMatriz>VIA PRINCIPAL N12-34 Y SECUNDARIA</dirMatriz>
        </infoTributaria>
        <infoGuiaRemision>
          <dirEstablecimiento>VIA PRINCIPAL N12-34</dirEstablecimiento>
          <dirPartida>VIA PRINCIPAL N12-34</dirPartida>
          <razonSocialTransportista>TRANSPORTES SA</razonSocialTransportista>
          <tipoIdentificacionTransportista>04</tipoIdentificacionTransportista>
          <rucTransportista>9876543210987</rucTransportista>
          <obligadoContabilidad>SI</obligadoContabilidad>
          <contribuyenteRazonSocial>EMPRESA CLIENTE SA</contribuyenteRazonSocial>
          <contribuyenteIdentificacion>1234567890123</contribuyenteIdentificacion>
          <contribuyenteDireccion>VIA SECUNDARIA N56-78</contribuyenteDireccion>
          <contribuyenteTelefono>022345678</contribuyenteTelefono>
          <contribuyenteEmail>cliente@ejemplo.com</contribuyenteEmail>
          <fechaIniTransporte>01/06/2023</fechaIniTransporte>
          <fechaFinTransporte>01/06/2023</fechaFinTransporte>
          <placa>ABC123</placa>
        </infoGuiaRemision>
        <destinatarios>
          <destinatario>
            <identificacionDestinatario>1234567890123</identificacionDestinatario>
            <razonSocialDestinatario>EMPRESA DESTINO SA</razonSocialDestinatario>
            <dirDestinatario>VIA DESTINO N90-12</dirDestinatario>
            <motivoTraslado>VENTAS</motivoTraslado>
            <docAduaneroUnico>1234567890</docAduaneroUnico>
            <fechaEmisionDocSustento>01/06/2023</fechaEmisionDocSustento>
            <detalles>
              <detalle>
                <codigoInterno>PROD001</codigoInterno>
                <descripcion>PRODUCTO TRANSPORTADO</descripcion>
                <cantidad>10</cantidad>
                <detallesAdicionales>
                  <detAdicional nombre="Marca">MARCA-EJEMPLO</detAdicional>
                  <detAdicional nombre="Modelo">MODELO-2023</detAdicional>
                </detallesAdicionales>
              </detalle>
            </detalles>
          </destinatario>
        </destinatarios>
        <infoAdicional>
          <campoAdicional nombre="Observaciones">Entrega en horario laboral</campoAdicional>
        </infoAdicional>
      </guiaRemision>`;

      const documentType = validateXmlForSigning(validShippingGuideXml);
      expect(documentType).toBe("guiaRemision");
    });

    test("should throw XmlFormatError for empty XML", () => {
      expect(() => validateXmlForSigning("")).toThrow(XmlFormatError);
      expect(() => validateXmlForSigning(null as any)).toThrow(XmlFormatError);
      expect(() => validateXmlForSigning(undefined as any)).toThrow(XmlFormatError);
    });

    test("should throw UnsupportedXmlFeatureError for DOCTYPE declarations", () => {
      const xmlWithDoctype = `<!DOCTYPE note [
        <!ELEMENT note (to,from,heading,body)>
        <!ELEMENT to (#PCDATA)>
      ]>
      <factura Id="comprobante" version="1.1.0">
      </factura>`;

      expect(() => validateXmlForSigning(xmlWithDoctype)).toThrow(UnsupportedXmlFeatureError);
    });

    test("should throw UnsupportedXmlFeatureError for xml-prefixed attributes", () => {
      const xmlWithXmlAttr = `<factura Id="comprobante" version="1.1.0" xml:foo="123">
      </factura>`;

      expect(() => validateXmlForSigning(xmlWithXmlAttr)).toThrow(UnsupportedXmlFeatureError);
    });

    test("should throw UnsupportedXmlFeatureError for namespace declarations", () => {
      const xmlWithNamespace = `<factura Id="comprobante" version="1.1.0" xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
      </factura>`;

      expect(() => validateXmlForSigning(xmlWithNamespace)).toThrow(UnsupportedXmlFeatureError);
    });

    test("should throw UnsupportedXmlFeatureError for default xmlns declarations", () => {
      const xmlWithDefaultNs = `<factura Id="comprobante" version="1.1.0" xmlns="http://example.com">
      </factura>`;

      expect(() => validateXmlForSigning(xmlWithDefaultNs)).toThrow(UnsupportedXmlFeatureError);
    });

    test("should throw UnsupportedXmlFeatureError for processing instructions", () => {
      const xmlWithPi = `<?xml version="1.0" encoding="UTF-8"?>
      <?some-pi instruction?>
      <factura Id="comprobante" version="1.1.0">
      </factura>`;

      expect(() => validateXmlForSigning(xmlWithPi)).toThrow(UnsupportedXmlFeatureError);
    });

    test("should throw UnsupportedDocumentTypeError for unsupported document types", () => {
      const unsupportedXml = `<unsupportedDoc Id="comprobante" version="1.1.0">
      </unsupportedDoc>`;

      expect(() => validateXmlForSigning(unsupportedXml)).toThrow(UnsupportedDocumentTypeError);
    });

    test("should throw UnsupportedXmlFeatureError when Id attribute is missing", () => {
      const xmlWithoutId = `<factura version="1.1.0">
      </factura>`;

      expect(() => validateXmlForSigning(xmlWithoutId)).toThrow(UnsupportedXmlFeatureError);
    });

    test("should throw UnsupportedXmlFeatureError when version attribute is missing", () => {
      const xmlWithoutVersion = `<factura Id="comprobante">
      </factura>`;

      expect(() => validateXmlForSigning(xmlWithoutVersion)).toThrow(UnsupportedXmlFeatureError);
    });

    test("should be case-insensitive for Id attribute", () => {
      const xmlWithId = `<factura id="comprobante" version="1.1.0">
      </factura>`;

      expect(() => validateXmlForSigning(xmlWithId)).not.toThrow();
    });

    test("should be case-insensitive for version attribute", () => {
      const xmlWithVersion = `<factura Id="comprobante" Version="1.1.0">
      </factura>`;

      expect(() => validateXmlForSigning(xmlWithVersion)).not.toThrow();
    });

    test("should accept XML without XML declaration", () => {
      const xmlWithoutDeclaration = `<factura Id="comprobante" version="1.1.0">
      </factura>`;

      expect(() => validateXmlForSigning(xmlWithoutDeclaration)).not.toThrow();
    });
  });
});