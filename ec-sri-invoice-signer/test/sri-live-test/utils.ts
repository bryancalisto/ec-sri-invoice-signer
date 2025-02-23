import * as soap from 'soap';
import readline from 'readline';

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

export async function sendDocToSRI(signedDoc: string) {
  console.log('sending doc to SRI servers...');
  const url = 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl';

  return new Promise((resolve, reject) => {
    soap.createClient(url, { wsdl_options: { timeout: 5000 } }, function (err, client) {
      if (err) {
        reject(err);
      } else {
        const args = { xml: Buffer.from(signedDoc).toString('base64') };

        client.validarComprobante(args, function (err: any, result: any) {
          if (err) {
            console.log('error while sending doc to SRI servers:', err);
            reject(err);
          } else {
            resolve(result);
            console.log('doc sent to SRI servers:', JSON.stringify(result, null, 2));
          }
        });
      }
    });
  });
}

async function checkDocAuthorization(accessKey: string) {
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

export function getAccessKeyVerificationNumber(data: string) {
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

export async function longPollDoc({ accessKey }: { accessKey: string }) {
  console.log('polling for doc information...');
  while (true) {
    await waitForKeyPress();
    const result = await checkDocAuthorization(accessKey);
    console.log('doc status:', JSON.stringify(result, null, 2));
  }
}

export function findNode(tagName: string, tree: any) {
  for (const node of tree) {
    if (tagName in node) {
      return node[tagName];
    }
  }

  throw new Error(`Node ${tagName} not found`);
}