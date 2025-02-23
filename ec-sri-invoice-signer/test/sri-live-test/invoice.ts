import fs from 'fs';
import { signInvoiceXml } from '../../src';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { findNode, getAccessKeyVerificationNumber, longPollDoc, sendDocToSRI } from './utils';


async function main() {
  // General params: adjust according to your setup
  const invoiceXmlPath = 'test/test-data/your-test-invoice-xml.xml';
  const signaturePath = 'test/test-data/your-p12.p12';
  const signaturePassword = 'your .p12 password';

  // Access key params: adjust according to your setup
  const todayDate = '09/10/2024'; // dd/mm/YYYY
  const documentType = '01'; // invoice
  const ruc = '1234567890001'; // RUC associated to the .p12 certificate
  const environmentType = '1'; // testing
  const establishment = '001';
  const emissionPoint = '001';
  const sequentialDocumentNumber = '000000001'; // sequence according to your invoice numbering sequence
  const numericCode = '12345678'; // 8 random numeric digits
  const emissionType = '1'; // constant value

  // Generate access key
  const accessKey = `${todayDate.replace(/\//gm, '')}${documentType}${ruc}${environmentType}${establishment}${emissionPoint}${sequentialDocumentNumber}\
${numericCode}${emissionType}`;

  const accessKeyWithVerificationNumber = `${accessKey}${getAccessKeyVerificationNumber(accessKey)}`;
  console.log('[access key]:', accessKeyWithVerificationNumber);

  // This replaces fields in the XML with the values above automatically
  let invoiceXml = fs.readFileSync(invoiceXmlPath, 'utf-8');

  const parser = new XMLParser({
    preserveOrder: true,
    trimValues: false,
    ignorePiTags: false,
    parseTagValue: false,
    parseAttributeValue: false,
    ignoreAttributes: false,
  });

  const parsed = parser.parse(invoiceXml);

  const infoTributariaFieldsToReplace = {
    ambiente: environmentType,
    tipoEmision: emissionType,
    ruc: ruc,
    claveAcceso: accessKeyWithVerificationNumber,
    codDoc: documentType,
    estab: establishment,
    ptoEmi: emissionPoint,
    secuencial: sequentialDocumentNumber
  };

  const infoFacturaFieldsToReplace = {
    fechaEmision: todayDate,
  };

  const facturaNode = findNode('factura', parsed);
  const infoTributariaNode = findNode('infoTributaria', facturaNode);
  const infoFacturaNode = findNode('infoFactura', facturaNode);

  for (const node of infoTributariaNode) {
    for (const [key, value] of Object.entries(infoTributariaFieldsToReplace)) {
      if (key in node) {
        node[key].find((node: any) => '#text' in node)['#text'] = value;
      }
    }
  }

  for (const node of infoFacturaNode) {
    for (const [key, value] of Object.entries(infoFacturaFieldsToReplace)) {
      if (key in node) {
        node[key].find((node: any) => '#text' in node)['#text'] = value;
      }
    }
  }

  const builder = new XMLBuilder({
    preserveOrder: true,
    ignoreAttributes: false,
  });

  invoiceXml = builder.build(parsed);

  // Save the updated XML for reference
  fs.writeFileSync('debug-not-signed.xml', invoiceXml);

  // Send the signed invoice to the SRI servers
  const signature = fs.readFileSync(signaturePath);
  const signedInvoice = signInvoiceXml(invoiceXml, signature, { pkcs12Password: signaturePassword })
  fs.writeFileSync('debug-signed.xml', signedInvoice);

  console.log('sending invoice to SRI servers...');
  const result = await sendDocToSRI(signedInvoice);
  console.log('invoice sent to SRI servers:', JSON.stringify(result, null, 2));

  // Poll until invoice has been processed
  console.log('polling for invoice information...');
  await longPollDoc({ accessKey: accessKeyWithVerificationNumber });
}

main()
  .then(() => console.log('DONE'))
  .catch((err) => console.error(err));