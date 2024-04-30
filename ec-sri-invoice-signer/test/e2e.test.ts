import fs from 'fs';
import { signInvoiceXml } from '../src';
import * as soap from 'soap';

/**
 * SRI test environment
 * https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl
 * https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl
 */

async function validateInvoice(signedInvoice: string) {
  const url = 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl';

  return new Promise((resolve, reject) => {
    soap.createClient(url, function (err, client) {
      if (err) {
        reject(err);
      } else {
        const args = { xml: Buffer.from(signedInvoice).toString('base64') };

        client.validarComprobante(args, function (err: any, result: any) {
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

async function checkInvoiceAuthorization(accessKey: string) {
  const url = 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl';


  return new Promise((resolve, reject) => {
    soap.createClient(url, function (err, client) {
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

/**
 * Unskip, setup a digital signature of your own (i.e. change path or signature location
 * and password) and setup an invoice to test this functionality 
 */
it.skip('Must run first. Sign a sample invoice and send it to the SRI servers confirming the signature validity', async () => {
  // Adjust these params according to your setup
  const invoiceXmlPath = 'test/test-data/invoice.xml';
  const signaturePath = 'test/my-signature.p12';
  const signaturePassword = '';

  const invoiceXml = fs.readFileSync(invoiceXmlPath, 'utf-8');
  const signature = fs.readFileSync(signaturePath);
  const signedInvoice = signInvoiceXml(invoiceXml, signature, { pkcs12Password: signaturePassword })

  const result = await validateInvoice(signedInvoice);
  console.log('SRI RESPONSE', JSON.stringify(result));
}).timeout(10000);

it.skip('Must run second after some time. Confirm the signed invoice was authorized by the SRI service', async () => {
  // Adjust these params according to your setup
  const todayDate = '18042024'; // ddmmYYYY
  const documentType = '01'; // invoice
  const ruc = '123456789001'; // RUC associated to the .p12 certificate
  const environmentType = '1'; // testing
  const establishment = '001';
  const emissionPoint = '001';
  const sequentialDocumentNumber = '000000005'; // sequence according to your invoice numbering sequence
  const numericCode = '12345678'; // 8 random numeric digits
  const emissionType = '1'; // constant value

  const accessKey = `${todayDate}${documentType}${ruc}${environmentType}${establishment}${emissionPoint}${sequentialDocumentNumber}\
${numericCode}${emissionType}`;


  const accessKeyWithVerificationNumber = `${accessKey}${getAccessKeyVerificationNumber(accessKey)}`;
  console.log('Access Key:', accessKeyWithVerificationNumber);

  const result = await checkInvoiceAuthorization(accessKeyWithVerificationNumber);
  console.log('SRI RESPONSE', JSON.stringify(result));
}).timeout(10000);