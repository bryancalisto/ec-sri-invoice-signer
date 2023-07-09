import { XmlProperties } from "../../utils/constants";

type buildKeyInfoArgs = {
  invoiceHash: string;
  invoiceTagId: string;
  keyInfoCertificateTagHash: string;
  keyInfoCertificateTagId: string;
  keyInfoCertificateRefId: string;
  signedInfoTagId: string;
  signedPropertiesRefId: string;
  signedPropertiesTagHash: string;
  signedPropertiesTagId: string;
}

export const buildKeyInfo = ({
  invoiceHash,
  invoiceTagId,
  keyInfoCertificateTagHash,
  keyInfoCertificateTagId,
  keyInfoCertificateRefId,
  signedInfoTagId,
  signedPropertiesRefId,
  signedPropertiesTagHash,
  signedPropertiesTagId
}: buildKeyInfoArgs): string => {
  return `
    <ds:SignedInfo Id="${signedInfoTagId}">
      <ds:CanonicalizationMethod Algorithm="${XmlProperties.algorithms.canonicalization}" />
      <ds:SignatureMethod Algorithm="${XmlProperties.algorithms.signature}" />
      <ds:Reference Id="${signedPropertiesRefId}" Type="${XmlProperties.types.signedProperties}" URI="#${signedPropertiesTagId}">
        <ds:DigestMethod Algorithm="${XmlProperties.algorithms.digest}" />
        <ds:DigestValue>${signedPropertiesTagHash}</ds:DigestValue>
      </ds:Reference>
      <ds:Reference Id="${keyInfoCertificateRefId}" URI="#${keyInfoCertificateTagId}">
        <ds:DigestMethod Algorithm="${XmlProperties.algorithms.digest}" />
        <ds:DigestValue>${keyInfoCertificateTagHash}</ds:DigestValue>
      </ds:Reference>
      <ds:Reference URI="#${invoiceTagId}">
        <ds:Transforms>
          <ds:Transform Algorithm="${XmlProperties.algorithms.transform}" />
        </ds:Transforms>
        <ds:DigestMethod Algorithm="${XmlProperties.algorithms.digest}" />
        <ds:DigestValue>${invoiceHash}</ds:DigestValue>
      </ds:Reference>
    </ds:SignedInfo>
  `;
}
