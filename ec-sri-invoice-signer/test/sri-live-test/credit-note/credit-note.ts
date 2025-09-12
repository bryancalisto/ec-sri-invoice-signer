import fs from 'fs';
import { signDebitNoteXml } from '../../../src';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { findNode, getAccessKeyVerificationNumber, longPollDoc, sendDocToSRI } from '../utils';
import path from 'path';

async function main() {
  const defaultParamsPath = path.resolve(__dirname, 'debit-note-params.json');
  const paramsPath = process.argv[2] || defaultParamsPath;

  if (!fs.existsSync(paramsPath)) {
    throw new Error(`Params file not found: ${paramsPath}`);
  }

  const params = JSON.parse(fs.readFileSync(paramsPath, 'utf-8'));

  const {
    xmlPath,
    signaturePath,
    signaturePassword,
    date,
    documentType,
    ruc,
    razonSocial,
    nombreComercial,
    dirMatriz,
    environmentType,
    establishment,
    emissionPoint,
    sequentialDocumentNumber,
    numericCode,
    emissionType,
    buyerIdType,
    razonSocialComprador,
    identificacionComprador,
    codDocModificado,
    numDocModificado,
    fechaEmisionDocSustento,
  } = params;

  // Generate access key
  const accessKey = `${date.replace(/\//gm, '')}${documentType}${ruc}${environmentType}${establishment}${emissionPoint}${sequentialDocumentNumber}\
${numericCode}${emissionType}`;

  const accessKeyWithVerificationNumber = `${accessKey}${getAccessKeyVerificationNumber(accessKey)}`;
  console.log('[access key]:', accessKeyWithVerificationNumber);

  // This replaces fields in the XML with the values above automatically
  let debitNoteXml = fs.readFileSync(xmlPath, 'utf-8');

  const parser = new XMLParser({
    preserveOrder: true,
    trimValues: false,
    ignorePiTags: false,
    parseTagValue: false,
    parseAttributeValue: false,
    ignoreAttributes: false,
  });

  const parsed = parser.parse(debitNoteXml);

  const infoTributariaFieldsToReplace = {
    ambiente: environmentType,
    tipoEmision: emissionType,
    razonSocial,
    nombreComercial,
    ruc,
    claveAcceso: accessKeyWithVerificationNumber,
    codDoc: documentType,
    estab: establishment,
    ptoEmi: emissionPoint,
    secuencial: sequentialDocumentNumber,
    dirMatriz,
  };

  const infoNotaDebitoFieldsToReplace = {
    fechaEmision: date,
    buyerIdType,
    razonSocialComprador,
    identificacionComprador,
    codDocModificado,
    numDocModificado,
    fechaEmisionDocSustento,
  };

  const debitNoteNode = findNode('notaDebito', parsed);
  const infoTributariaNode = findNode('infoTributaria', debitNoteNode);
  const infoNotaDebitoNode = findNode('infoNotaDebito', debitNoteNode);

  for (const node of infoTributariaNode) {
    for (const [key, value] of Object.entries(infoTributariaFieldsToReplace)) {
      if (key in node) {
        node[key].find((node: any) => '#text' in node)['#text'] = value;
      }
    }
  }

  for (const node of infoNotaDebitoNode) {
    for (const [key, value] of Object.entries(infoNotaDebitoFieldsToReplace)) {
      if (key in node) {
        node[key].find((node: any) => '#text' in node)['#text'] = value;
      }
    }
  }

  const builder = new XMLBuilder({
    preserveOrder: true,
    ignoreAttributes: false,
  });

  debitNoteXml = builder.build(parsed);

  // Send the signed debit note to the SRI servers
  const signature = fs.readFileSync(signaturePath);
  const signedDebitNote = signDebitNoteXml(debitNoteXml, signature, { pkcs12Password: signaturePassword })

  await sendDocToSRI(signedDebitNote);

  // Poll until debit note has been processed
  await longPollDoc({ accessKey: accessKeyWithVerificationNumber });
}

main().catch((err) => console.error(err));