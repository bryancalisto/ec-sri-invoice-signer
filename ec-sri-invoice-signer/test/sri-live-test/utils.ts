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
            if (result?.RespuestaRecepcionComprobante?.estado !== 'RECIBIDA') {
              console.error('doc could not be received:', JSON.stringify(result, null, 2));
              process.exit(1);
            }

            console.log('doc received successfully:', JSON.stringify(result, null, 2));
            resolve(result);
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

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function longPollDoc({ accessKey, maxMinutes = 3, maxErrors = 3, intervalSeconds = 5, maxRetries = 3 }: { accessKey: string, maxMinutes?: number, maxErrors?: number, intervalSeconds?: number, maxRetries?: number }) {
  const timeout = setTimeout(() => {
    console.log('timeout reached, exiting...');
    process.exit(1);
  }, maxMinutes * 60 * 1000);
  let errorCount = 0;


  for (let i = 0; i < maxRetries; i++) {
    console.log('polling for doc information...');

    try {
      const result: any = await checkDocAuthorization(accessKey);

      if (result?.RespuestaAutorizacionComprobante?.autorizaciones?.autorizacion?.estado === 'AUTORIZADO') {
        console.log('doc authorized successfully:', JSON.stringify(result, null, 2));
        clearTimeout(timeout);
        return result;
      }
      else if (i < maxRetries - 1) {
        console.log('doc not authorized yet, retrying...', JSON.stringify(result, null, 2));
      }
    }
    catch (error) {
      console.error('error while checking doc status:', error);
      errorCount++;

      if (errorCount >= maxErrors) {
        console.error('max errors reached, exiting...');
        process.exit(1);
      }
    }

    await sleep(intervalSeconds * 1000);
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