import { XmlProperties } from "../../utils/constants";

type buildSignedInfoTagArgs = {
  invoiceHash: string;
  invoiceTagId: string;
  keyInfoCertificateTagHash: string;
  keyInfoCertificateTagId: string;
  keyInfoCertificateRefTagId: string;
  signedInfoTagId: string;
  signedPropertiesRefTagId: string;
  signedPropertiesTagHash: string;
  signedPropertiesTagId: string;
}

export const buildSignedInfoTag = ({
  invoiceHash,
  invoiceTagId,
  keyInfoCertificateTagHash,
  keyInfoCertificateTagId,
  keyInfoCertificateRefTagId,
  signedInfoTagId,
  signedPropertiesRefTagId,
  signedPropertiesTagHash,
  signedPropertiesTagId
}: buildSignedInfoTagArgs) => {
  return `
    <ds:SignedInfo Id="${signedInfoTagId}">
      <ds:CanonicalizationMethod Algorithm="${XmlProperties.algorithms.canonicalization}" />
      <ds:SignatureMethod Algorithm="${XmlProperties.algorithms.signature}" />
      <ds:Reference Id="${signedPropertiesRefTagId}" Type="${XmlProperties.types.signedProperties}" URI="#${signedPropertiesTagId}">
        <ds:DigestMethod Algorithm="${XmlProperties.algorithms.digest}" />
        <ds:DigestValue>${signedPropertiesTagHash}</ds:DigestValue>
      </ds:Reference>
      <ds:Reference Id="${keyInfoCertificateRefTagId}" URI="#${keyInfoCertificateTagId}">
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
