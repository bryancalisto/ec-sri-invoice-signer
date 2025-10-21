import { jest, describe, test, expect } from "@jest/globals";
import {
  validateXmlForSigning,
  UnsupportedXmlFeatureError,
  UnsupportedDocumentTypeError,
  XmlFormatError
} from "../../src/utils/xml-validation";
import { UnexpectedDocumentRootError } from "../../src/utils/errors";

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

      // expect no error to be thrown if root tag name is correct
      expect(() => validateXmlForSigning(validInvoiceXml, 'factura')).not.toThrow();

      // expect error to be thrown if root tag name is incorrect
      expect(() => validateXmlForSigning(validInvoiceXml, 'facturaa')).toThrow(UnexpectedDocumentRootError);
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

      expect(() => validateXmlForSigning(validDebitNoteXml, 'notaDebito')).not.toThrow();
      expect(() => validateXmlForSigning(validDebitNoteXml, 'notaDebitoo')).toThrow(UnexpectedDocumentRootError);
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

      expect(() => validateXmlForSigning(validCreditNoteXml, 'notaCredito')).not.toThrow();
      expect(() => validateXmlForSigning(validCreditNoteXml, 'notaCreditoo')).toThrow(UnexpectedDocumentRootError);
    });


    test("should throw XmlFormatError for empty XML", () => {
      expect(() => validateXmlForSigning("", 'factura')).toThrow(XmlFormatError);
      expect(() => validateXmlForSigning(null as any, 'factura')).toThrow(XmlFormatError);
      expect(() => validateXmlForSigning(undefined as any, 'factura')).toThrow(XmlFormatError);
    });

    test("should throw UnsupportedXmlFeatureError for DOCTYPE declarations", () => {
      const xmlWithDoctype = `<!DOCTYPE note [
        <!ELEMENT note (to,from,heading,body)>
        <!ELEMENT to (#PCDATA)>
      ]>
      <factura Id="comprobante" version="1.1.0">
      </factura>`;

      expect(() => validateXmlForSigning(xmlWithDoctype, 'factura')).toThrow(UnsupportedXmlFeatureError);
    });

    test("should throw UnsupportedXmlFeatureError for xml-prefixed attributes", () => {
      const xmlWithXmlAttr = `<factura Id="comprobante" version="1.1.0" xml:foo="123">
      </factura>`;

      expect(() => validateXmlForSigning(xmlWithXmlAttr, 'factura')).toThrow(UnsupportedXmlFeatureError);
    });

    test("should throw UnsupportedXmlFeatureError for namespace declarations", () => {
      const xmlWithNamespace = `<factura Id="comprobante" version="1.1.0" xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
      </factura>`;

      expect(() => validateXmlForSigning(xmlWithNamespace, 'factura')).toThrow(UnsupportedXmlFeatureError);
    });

    test("should throw UnsupportedXmlFeatureError for default xmlns declarations", () => {
      const xmlWithDefaultNs = `<factura Id="comprobante" version="1.1.0" xmlns="http://example.com">
      </factura>`;

      expect(() => validateXmlForSigning(xmlWithDefaultNs, 'factura')).toThrow(UnsupportedXmlFeatureError);
    });

    test("should throw UnsupportedXmlFeatureError for processing instructions", () => {
      const xmlWithPi = `<?xml version="1.0" encoding="UTF-8"?>
      <?some-pi instruction?>
      <factura Id="comprobante" version="1.1.0">
      </factura>`;

      expect(() => validateXmlForSigning(xmlWithPi, 'factura')).toThrow(UnsupportedXmlFeatureError);
    });

    test("should throw UnsupportedDocumentTypeError for unsupported document types", () => {
      const unsupportedXml = `<unsupportedDoc Id="comprobante" version="1.1.0">
      </unsupportedDoc>`;

      expect(() => validateXmlForSigning(unsupportedXml, 'unsupportedDoc')).toThrow(UnsupportedDocumentTypeError);
    });

    test("should throw UnsupportedXmlFeatureError when Id attribute is missing", () => {
      const xmlWithoutId = `<factura version="1.1.0">
      </factura>`;

      expect(() => validateXmlForSigning(xmlWithoutId, 'factura')).toThrow(UnsupportedXmlFeatureError);
    });

    test("should throw UnsupportedXmlFeatureError when version attribute is missing", () => {
      const xmlWithoutVersion = `<factura Id="comprobante">
      </factura>`;

      expect(() => validateXmlForSigning(xmlWithoutVersion, 'factura')).toThrow(UnsupportedXmlFeatureError);
    });

    test("should be case-insensitive for Id attribute", () => {
      const xmlWithId = `<factura id="comprobante" version="1.1.0">
      </factura>`;

      expect(() => validateXmlForSigning(xmlWithId, 'factura')).not.toThrow();
    });

    test("should be case-insensitive for version attribute", () => {
      const xmlWithVersion = `<factura Id="comprobante" Version="1.1.0">
      </factura>`;

      expect(() => validateXmlForSigning(xmlWithVersion, 'factura')).not.toThrow();
    });

    test("should accept XML without XML declaration", () => {
      const xmlWithoutDeclaration = `<factura Id="comprobante" version="1.1.0">
      </factura>`;

      expect(() => validateXmlForSigning(xmlWithoutDeclaration, 'factura')).not.toThrow();
    });
  });
});