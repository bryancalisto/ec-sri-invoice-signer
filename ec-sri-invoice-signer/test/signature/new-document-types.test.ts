import { jest, describe, test, expect } from "@jest/globals";
import {
  signCreditNoteXml,
  signRetentionVoucherXml,
  signShippingGuideXml,
  signPurchaseLiquidationXml,
  signDocumentXml,
  signInvoiceXml,
  signDebitNoteXml
} from "../../src/signature/signature";
import {
  UnsupportedDocumentTypeError,
  UnsupportedXmlFeatureError,
  XmlFormatError
} from "../../src/utils/errors";
import { validateXmlForSigning } from "../../src/utils/xml-validator";

// Mock the cryptography module to avoid PKCS12 parsing issues in tests
jest.mock('../../src/utils/cryptography', () => ({
  extractPrivateKeyAndCertificateFromPkcs12: jest.fn(() => ({
    privateKey: 'mock-private-key',
    certificate: 'mock-certificate'
  })),
  extractPrivateKeyData: jest.fn(() => ({
    exponent: 'mock-exponent',
    modulus: 'mock-modulus'
  })),
  extractX509Data: jest.fn(() => ({
    issuerName: 'mock-issuer',
    serialNumber: 'mock-serial',
    content: 'mock-content',
    contentHash: 'mock-hash'
  })),
  getHash: jest.fn(() => 'mock-hash'),
  sign: jest.fn(() => 'mock-signature')
}));

describe("New Document Type Signing", () => {
  describe("Document Type Detection and Validation", () => {
    test("validateXmlForSigning should detect notaCredito correctly", () => {
      const creditNoteXml = `<?xml version="1.0" encoding="UTF-8"?>
      <notaCredito Id="comprobante" version="1.1.0">
        <infoTributaria>
          <ambiente>1</ambiente>
          <tipoEmision>1</tipoEmision>
          <ruc>1234567890123</ruc>
        </infoTributaria>
      </notaCredito>`;

      const documentType = validateXmlForSigning(creditNoteXml);
      expect(documentType).toBe("notaCredito");
    });

    test("validateXmlForSigning should detect comprobanteRetencion correctly", () => {
      const retentionVoucherXml = `<?xml version="1.0" encoding="UTF-8"?>
      <comprobanteRetencion Id="comprobante" version="1.0.0">
        <infoTributaria>
          <ambiente>1</ambiente>
          <tipoEmision>1</tipoEmision>
          <ruc>1234567890123</ruc>
        </infoTributaria>
      </comprobanteRetencion>`;

      const documentType = validateXmlForSigning(retentionVoucherXml);
      expect(documentType).toBe("comprobanteRetencion");
    });

    test("validateXmlForSigning should detect guiaRemision correctly", () => {
      const shippingGuideXml = `<?xml version="1.0" encoding="UTF-8"?>
      <guiaRemision Id="comprobante" version="1.1.0">
        <infoTributaria>
          <ambiente>1</ambiente>
          <tipoEmision>1</tipoEmision>
          <ruc>1234567890123</ruc>
        </infoTributaria>
      </guiaRemision>`;

      const documentType = validateXmlForSigning(shippingGuideXml);
      expect(documentType).toBe("guiaRemision");
    });

    test("validateXmlForSigning should detect liquidacionCompra correctly", () => {
      const purchaseLiquidationXml = `<?xml version="1.0" encoding="UTF-8"?>
      <liquidacionCompra Id="comprobante" version="1.0.0">
        <infoTributaria>
          <ambiente>1</ambiente>
          <tipoEmision>1</tipoEmision>
          <ruc>1234567890123</ruc>
        </infoTributaria>
      </liquidacionCompra>`;

      const documentType = validateXmlForSigning(purchaseLiquidationXml);
      expect(documentType).toBe("liquidacionCompra");
    });
  });

  describe("Function Export and Availability", () => {
    test("signCreditNoteXml function should be exported", () => {
      expect(typeof signCreditNoteXml).toBe("function");
    });

    test("signRetentionVoucherXml function should be exported", () => {
      expect(typeof signRetentionVoucherXml).toBe("function");
    });

    test("signShippingGuideXml function should be exported", () => {
      expect(typeof signShippingGuideXml).toBe("function");
    });

    test("signDocumentXml function should be exported", () => {
      expect(typeof signDocumentXml).toBe("function");
    });

    test("signPurchaseLiquidationXml function should be exported", () => {
      expect(typeof signPurchaseLiquidationXml).toBe("function");
    });
  });

  describe("Error Handling for New Document Types", () => {
    test("should throw error for unsupported document type", () => {
      const unsupportedXml = `<?xml version="1.0" encoding="UTF-8"?>
      <documentoNoSoportado Id="comprobante" version="1.1.0">
        <infoTributaria>
          <ambiente>1</ambiente>
          <tipoEmision>1</tipoEmision>
          <ruc>1234567890123</ruc>
        </infoTributaria>
      </documentoNoSoportado>`;

      expect(() => validateXmlForSigning(unsupportedXml)).toThrow(UnsupportedDocumentTypeError);
    });

    test("should throw error for XML with unsupported features", () => {
      const xmlWithNamespace = `<?xml version="1.0" encoding="UTF-8"?>
      <notaCredito Id="comprobante" version="1.1.0" xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <infoTributaria>
          <ambiente>1</ambiente>
          <tipoEmision>1</tipoEmision>
          <ruc>1234567890123</ruc>
        </infoTributaria>
      </notaCredito>`;

      expect(() => validateXmlForSigning(xmlWithNamespace)).toThrow(UnsupportedXmlFeatureError);
    });

    test("should throw error for XML with missing required attributes", () => {
      const xmlWithoutId = `<?xml version="1.0" encoding="UTF-8"?>
      <notaCredito version="1.1.0">
        <infoTributaria>
          <ambiente>1</ambiente>
          <tipoEmision>1</tipoEmision>
          <ruc>1234567890123</ruc>
        </infoTributaria>
      </notaCredito>`;

      expect(() => validateXmlForSigning(xmlWithoutId)).toThrow(UnsupportedXmlFeatureError);
    });
  });
});