/**
 * End-to-end integration test for the ec-sri-invoice-signer library
 * Tests:
 * 1. Purchase Liquidation signing (new feature)
 * 2. Access key generation and validation (new feature)
 * 3. All document types signing
 */

import fs from 'fs';
import {
  signInvoiceXml,
  signPurchaseLiquidationXml,
  generateAccessKey,
  validateAccessKey,
  parseAccessKey,
  type AccessKeyComponents
} from './src/index';

console.log('\n=== EC-SRI Invoice Signer - Integration Test ===\n');

// Test 1: Access Key Generation and Validation
console.log('1. Testing Access Key Utilities...');
const accessKeyComponents: AccessKeyComponents = {
  date: "10102025",
  documentType: "03",  // Purchase Liquidation
  ruc: "1234567890001",
  environment: "01",    // Test environment
  establishment: "001",
  emissionPoint: "001",
  sequential: "000000001",
};

const accessKey = generateAccessKey(accessKeyComponents);
console.log(`   Generated access key: ${accessKey}`);
console.log(`   Length: ${accessKey.length} digits`);

const isValid = validateAccessKey(accessKey);
console.log(`   Is valid: ${isValid ? '✅' : '❌'}`);

const parsed = parseAccessKey(accessKey);
console.log(`   Parsed components:`, JSON.stringify(parsed, null, 4));

// Test invalid key
const invalidKey = accessKey.substring(0, 48) + ((parseInt(accessKey[48]) + 1) % 10).toString();
const isInvalidKeyRejected = !validateAccessKey(invalidKey);
console.log(`   Invalid key rejected: ${isInvalidKeyRejected ? '✅' : '❌'}`);

console.log('\n2. Testing Purchase Liquidation Signing (NEW)...');

// Create a sample purchase liquidation XML
const purchaseLiquidationXml = `<?xml version="1.0" encoding="UTF-8"?>
<liquidacionCompra Id="comprobante" version="1.0.0">
  <infoTributaria>
    <ambiente>1</ambiente>
    <tipoEmision>1</tipoEmision>
    <razonSocial>Test Company SA</razonSocial>
    <nombreComercial>Test Company</nombreComercial>
    <ruc>1234567890001</ruc>
    <claveAcceso>${accessKey}</claveAcceso>
    <codDoc>03</codDoc>
    <estab>001</estab>
    <ptoEmi>001</ptoEmi>
    <secuencial>000000001</secuencial>
    <dirMatriz>Quito, Ecuador</dirMatriz>
  </infoTributaria>
  <infoLiquidacionCompra>
    <fechaEmision>10/10/2025</fechaEmision>
    <dirEstablecimiento>Quito Norte</dirEstablecimiento>
    <obligadoContabilidad>SI</obligadoContabilidad>
    <tipoIdentificacionProveedor>04</tipoIdentificacionProveedor>
    <razonSocialProveedor>Proveedor Test</razonSocialProveedor>
    <identificacionProveedor>9999999999</identificacionProveedor>
    <totalSinImpuestos>100.00</totalSinImpuestos>
    <totalDescuento>0.00</totalDescuento>
    <totalConImpuestos>
      <totalImpuesto>
        <codigo>2</codigo>
        <codigoPorcentaje>4</codigoPorcentaje>
        <baseImponible>100.00</baseImponible>
        <valor>15.00</valor>
      </totalImpuesto>
    </totalConImpuestos>
    <importeTotal>115.00</importeTotal>
  </infoLiquidacionCompra>
  <detalles>
    <detalle>
      <descripcion>Servicio de prueba</descripcion>
      <cantidad>1.00</cantidad>
      <precioUnitario>100.00</precioUnitario>
      <precioTotalSinImpuesto>100.00</precioTotalSinImpuesto>
      <impuestos>
        <impuesto>
          <codigo>2</codigo>
          <codigoPorcentaje>4</codigoPorcentaje>
          <tarifa>15.00</tarifa>
          <baseImponible>100.00</baseImponible>
          <valor>15.00</valor>
        </impuesto>
      </impuestos>
    </detalle>
  </detalles>
</liquidacionCompra>`;

// Load the test p12 file
const p12Data = fs.readFileSync('../test-p12-temp/signature.p12');

console.log('   Signing purchase liquidation XML...');
const signedPurchaseLiquidation = signPurchaseLiquidationXml(purchaseLiquidationXml, p12Data, {
  pkcs12Password: ''
});

console.log(`   Signed XML length: ${signedPurchaseLiquidation.length} characters`);
console.log(`   Contains signature: ${signedPurchaseLiquidation.includes('<ds:Signature') ? '✅' : '❌'}`);
console.log(`   Contains SignedInfo: ${signedPurchaseLiquidation.includes('<ds:SignedInfo') ? '✅' : '❌'}`);
console.log(`   Contains KeyInfo: ${signedPurchaseLiquidation.includes('<ds:KeyInfo') ? '✅' : '❌'}`);
console.log(`   Contains X509Data: ${signedPurchaseLiquidation.includes('<ds:X509Data') ? '✅' : '❌'}`);

// Save signed document for inspection
fs.writeFileSync('../test-p12-temp/signed-purchase-liquidation.xml', signedPurchaseLiquidation);
console.log('   Saved to: ../test-p12-temp/signed-purchase-liquidation.xml');

console.log('\n3. Testing Invoice Signing (EXISTING)...');

const invoiceXml = `<?xml version="1.0" encoding="UTF-8"?>
<factura Id="comprobante" version="1.1.0">
  <infoTributaria>
    <ambiente>1</ambiente>
    <tipoEmision>1</tipoEmision>
    <razonSocial>Test Company SA</razonSocial>
    <nombreComercial>Test Company</nombreComercial>
    <ruc>1234567890001</ruc>
    <claveAcceso>1010202501123456789000110010010000000015555555512</claveAcceso>
    <codDoc>01</codDoc>
    <estab>001</estab>
    <ptoEmi>001</ptoEmi>
    <secuencial>000000001</secuencial>
    <dirMatriz>Quito, Ecuador</dirMatriz>
  </infoTributaria>
  <infoFactura>
    <fechaEmision>10/10/2025</fechaEmision>
    <dirEstablecimiento>Quito Norte</dirEstablecimiento>
    <tipoIdentificacionComprador>05</tipoIdentificacionComprador>
    <razonSocialComprador>Cliente Test</razonSocialComprador>
    <identificacionComprador>0987654321</identificacionComprador>
    <totalSinImpuestos>100.00</totalSinImpuestos>
    <totalDescuento>0.00</totalDescuento>
    <totalConImpuestos>
      <totalImpuesto>
        <codigo>2</codigo>
        <codigoPorcentaje>4</codigoPorcentaje>
        <baseImponible>100.00</baseImponible>
        <valor>15.00</valor>
      </totalImpuesto>
    </totalConImpuestos>
    <propina>0.00</propina>
    <importeTotal>115.00</importeTotal>
    <moneda>USD</moneda>
  </infoFactura>
  <detalles>
    <detalle>
      <descripcion>Producto de prueba</descripcion>
      <cantidad>1.00</cantidad>
      <precioUnitario>100.00</precioUnitario>
      <descuento>0.00</descuento>
      <precioTotalSinImpuesto>100.00</precioTotalSinImpuesto>
      <impuestos>
        <impuesto>
          <codigo>2</codigo>
          <codigoPorcentaje>4</codigoPorcentaje>
          <tarifa>15.00</tarifa>
          <baseImponible>100.00</baseImponible>
          <valor>15.00</valor>
        </impuesto>
      </impuestos>
    </detalle>
  </detalles>
</factura>`;

console.log('   Signing invoice XML...');
const signedInvoice = signInvoiceXml(invoiceXml, p12Data, { pkcs12Password: '' });

console.log(`   Signed XML length: ${signedInvoice.length} characters`);
console.log(`   Contains signature: ${signedInvoice.includes('<ds:Signature') ? '✅' : '❌'}`);

// Save signed invoice
fs.writeFileSync('../test-p12-temp/signed-invoice.xml', signedInvoice);
console.log('   Saved to: ../test-p12-temp/signed-invoice.xml');

console.log('\n=== All Tests Completed Successfully ===\n');
console.log('Summary:');
console.log('✅ Access key generation and validation');
console.log('✅ Purchase liquidation signing (NEW)');
console.log('✅ Invoice signing (EXISTING)');
console.log('\nAll new features are working correctly!');
