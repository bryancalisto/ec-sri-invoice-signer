import fs from 'fs';
import { signInvoiceXml } from '../../src';
import * as soap from 'soap';
import readline from 'readline';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';

/**
 * SRI test environment
 * https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl
 * https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl
 */

function waitForKeyPress() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('[exit]: e, [continue]: any key, but not e', (answer) => {
      if (answer === 'e') {
        process.exit(0);
      }
      else {
        resolve(true);
        rl.close();
      }
    });
  });
}

async function sendInvoiceToSRI(signedInvoice: string) {
  const url = 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl';

  return new Promise((resolve, reject) => {
    soap.createClient(url, { wsdl_options: { timeout: 5000 } }, function (err, client) {
      if (err) {
        reject(err);
      } else {
        const args = { xml: Buffer.from(signedInvoice).toString('base64') };

        console.log('sending invoice to SRI servers...');

        client.validarComprobante(args, function (err: any, result: any) {
          if (err) {
            console.log('error while sending invoice to SRI servers:', err);
            reject(err);
          } else {
            resolve(result);
          }
        });
      }
    });
  });
}

async function checkInvoiceAuthorization(accessKey: string) {
  const url = 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl';


  return new Promise((resolve, reject) => {
    soap.createClient(url, { wsdl_options: { timeout: 5000 } }, function (err, client) {
      if (err) {
        reject(err);
      } else {
        const args = { claveAccesoComprobante: accessKey };
        client.autorizacionComprobante(args, function (err: any, result: any) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      }
    });
  });
}

function getAccessKeyVerificationNumber(data: string) {
  let sum = 0;
  let factor = 7;

  for (let i = 0; i < data.length; i++) {
    sum += Number(data[i]) * factor;
    factor--;
    if (factor === 1) {
      factor = 7;
    }
  }

  const result = 11 - (sum % 11);

  const verificatioNumber = (result === 11 ? 0 : result === 10 ? 1 : result).toString();
  return verificatioNumber;
}

async function longPollInvoice({ accessKey }: { accessKey: string }) {
  while (true) {
    await waitForKeyPress();
    const result = await checkInvoiceAuthorization(accessKey);
    console.log('invoice status:', JSON.stringify(result, null, 2));
  }
}

function findNode(tagName: string, tree: any) {
  for (const node of tree) {
    if (tagName in node) {
      return node[tagName];
    }
  }

  throw new Error(`Node ${tagName} not found`);
}

async function main() {
  // General params: adjust according to your setup
  const invoiceXmlPath = 'test/test-data/bug-xml.xml';
  const signaturePath = 'test/test-data/certificado-calisto-enext.p12';
  const signaturePassword = 'clave1234';

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

  // Replace fields in the XML with the values above automatically
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
  const result = await sendInvoiceToSRI(signedInvoice);
  console.log('invoice sent to SRI servers:', JSON.stringify(result, null, 2));

  // Poll until invoice has been processed
  console.log('polling for invoice information...');
  await longPollInvoice({ accessKey: accessKeyWithVerificationNumber });
}

main()
  .then(() => console.log('DONE'))
  .catch((err) => console.error(err));