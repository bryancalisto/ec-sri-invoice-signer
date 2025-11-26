import fs from 'fs';
import { signWithholdingCertificateXml } from '../../../src';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { findNode, getAccessKeyVerificationNumber, longPollDoc, sendDocToSRI } from '../utils';
import path from 'path';

async function main() {
  const defaultParamsPath = path.resolve(__dirname, 'withholding-certificate-params.json');
  const paramsPath = process.argv[2] || defaultParamsPath;

  if (!fs.existsSync(paramsPath)) {
    throw new Error(`Params file not found: ${paramsPath}`);
  }

  const params = JSON.parse(fs.readFileSync(paramsPath, 'utf-8'));

  const {
    withholdingCertificateXmlPath,
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
  let withholdingCertificateXml = fs.readFileSync(withholdingCertificateXmlPath, 'utf-8');

  const parser = new XMLParser({
    preserveOrder: true,
    trimValues: false,
    ignorePiTags: false,
    parseTagValue: false,
    parseAttributeValue: false,
    ignoreAttributes: false,
  });

  const parsed = parser.parse(withholdingCertificateXml);

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

  const infoCompRetencionFieldsToReplace = {
    fechaEmision: date,
  };

  const comprobanteRetencionNode = findNode('comprobanteRetencion', parsed);
  const infoTributariaNode = findNode('infoTributaria', comprobanteRetencionNode);
  const infoCompRetencionNode = findNode('infoCompRetencion', comprobanteRetencionNode);

  for (const node of infoTributariaNode) {
    for (const [key, value] of Object.entries(infoTributariaFieldsToReplace)) {
      if (key in node) {
        node[key].find((node: any) => '#text' in node)['#text'] = value;
      }
    }
  }

  for (const node of infoCompRetencionNode) {
    for (const [key, value] of Object.entries(infoCompRetencionFieldsToReplace)) {
      if (key in node) {
        node[key].find((node: any) => '#text' in node)['#text'] = value;
      }
    }
  }

  const builder = new XMLBuilder({
    preserveOrder: true,
    ignoreAttributes: false,
  });

  withholdingCertificateXml = builder.build(parsed);

  // Send the signed withholding certificate to the SRI servers
  const signature = fs.readFileSync(signaturePath);
  const signedWithholdingCertificate = signWithholdingCertificateXml(withholdingCertificateXml, signature, { pkcs12Password: signaturePassword })

  await sendDocToSRI(signedWithholdingCertificate);

  // Poll until withholding certificate has been processed
  await longPollDoc({ accessKey: accessKeyWithVerificationNumber });
}

main().catch((err) => console.error(err));
