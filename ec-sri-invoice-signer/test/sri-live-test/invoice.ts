import fs from 'fs';
import { signInvoiceXml } from '../../src';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { findNode, getAccessKeyVerificationNumber, longPollDoc, sendDocToSRI } from './utils';
import path from 'path';

async function main() {
  const defaultParamsPath = path.resolve(__dirname, 'invoice-params.json');
  const paramsPath = process.argv[2] || defaultParamsPath;

  if (!fs.existsSync(paramsPath)) {
    throw new Error(`Params file not found: ${paramsPath}`);
  }

  const params = JSON.parse(fs.readFileSync(paramsPath, 'utf-8'));

  const {
    invoiceXmlPath,
    signaturePath,
    signaturePassword,
    date,
    documentType,
    ruc,
    environmentType,
    establishment,
    emissionPoint,
    sequentialDocumentNumber,
    numericCode,
    emissionType
  } = params;

  // Generate access key
  const accessKey = `${date.replace(/\//gm, '')}${documentType}${ruc}${environmentType}${establishment}${emissionPoint}${sequentialDocumentNumber}\
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
    fechaEmision: date,
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

  await sendDocToSRI(signedInvoice);

  // Poll until invoice has been processed
  await longPollDoc({ accessKey: accessKeyWithVerificationNumber });
}

main().catch((err) => console.error(err));