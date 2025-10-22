import fs from 'fs';
import { signDeliveryGuideXml } from '../../../src';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { findNode, getAccessKeyVerificationNumber, longPollDoc, sendDocToSRI } from '../utils';
import path from 'path';

async function main() {
  const defaultParamsPath = path.resolve(__dirname, 'delivery-guide-params.json');
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
    dirPartida,
    razonSocialTransportista,
    tipoIdentificacionTransportista,
    rucTransportista,
    fechaIniTransporte,
    fechaFinTransporte,
    placa,
  } = params;

  // Generate access key
  const accessKey = `${date.replace(/\//gm, '')}${documentType}${ruc}${environmentType}${establishment}${emissionPoint}${sequentialDocumentNumber}${numericCode}${emissionType}`;

  const accessKeyWithVerificationNumber = `${accessKey}${getAccessKeyVerificationNumber(accessKey)}`;
  console.log('[access key]:', accessKeyWithVerificationNumber);

  // This replaces fields in the XML with the values above automatically
  let deliveryGuideXml = fs.readFileSync(xmlPath, 'utf-8');

  const parser = new XMLParser({
    preserveOrder: true,
    trimValues: false,
    ignorePiTags: false,
    parseTagValue: false,
    parseAttributeValue: false,
    ignoreAttributes: false,
  });

  const parsed = parser.parse(deliveryGuideXml);

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

  const infoGuiaRemisionFieldsToReplace = {
    dirPartida,
    razonSocialTransportista,
    tipoIdentificacionTransportista,
    rucTransportista,
    fechaIniTransporte,
    fechaFinTransporte,
    placa,
  };

  const deliveryGuideNode = findNode('guiaRemision', parsed);
  const infoTributariaNode = findNode('infoTributaria', deliveryGuideNode);
  const infoGuiaRemisionNode = findNode('infoGuiaRemision', deliveryGuideNode);

  for (const node of infoTributariaNode) {
    for (const [key, value] of Object.entries(infoTributariaFieldsToReplace)) {
      if (key in node) {
        node[key].find((node: any) => '#text' in node)['#text'] = value;
      }
    }
  }

  for (const node of infoGuiaRemisionNode) {
    for (const [key, value] of Object.entries(infoGuiaRemisionFieldsToReplace)) {
      if (key in node) {
        node[key].find((node: any) => '#text' in node)['#text'] = value;
      }
    }
  }

  const builder = new XMLBuilder({
    preserveOrder: true,
    ignoreAttributes: false,
  });

  deliveryGuideXml = builder.build(parsed);

  // Send the signed delivery guide to the SRI servers
  const signature = fs.readFileSync(signaturePath);
  const signedDeliveryGuide = signDeliveryGuideXml(deliveryGuideXml, signature, { pkcs12Password: signaturePassword })

  await sendDocToSRI(signedDeliveryGuide);

  // Poll until delivery guide has been processed
  await longPollDoc({ accessKey: accessKeyWithVerificationNumber });
}

main().catch((err) => console.error(err));