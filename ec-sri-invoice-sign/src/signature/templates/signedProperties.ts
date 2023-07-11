import { XmlProperties } from '../../utils/constants';

type buildSignedPropertiesTagArgs = {
  invoiceTagRef: string;
  signedPropertiesTagId: string;
  signatureDescription: string;
  signingTime: string;
  x509Hash: string;
  x509IssuerName: string;
  x509SerialNumber: string;
}

export const buildSignedPropertiesTag = ({
  invoiceTagRef,
  signatureDescription,
  signedPropertiesTagId,
  signingTime,
  x509Hash,
  x509IssuerName,
  x509SerialNumber,
}: buildSignedPropertiesTagArgs) => {
  return `
    <etsi:SignedProperties Id="${signedPropertiesTagId}">
      <etsi:SignedSignatureProperties>
        <etsi:SigningTime>${signingTime}</etsi:SigningTime>
        <etsi:SigningCertificate>
          <etsi:Cert>
            <etsi:CertDigest>
              <ds:DigestMethod Algorithm="${XmlProperties.algorithms.digest}" />
              <ds:DigestValue>${x509Hash}</ds:DigestValue>
            </etsi:CertDigest>
            <etsi:IssuerSerial>
              <ds:X509IssuerName>${x509IssuerName}</ds:X509IssuerName>
              <ds:X509SerialNumber>${x509SerialNumber}</ds:X509SerialNumber>
            </etsi:IssuerSerial>
          </etsi:Cert>
        </etsi:SigningCertificate>
      </etsi:SignedSignatureProperties>
      <etsi:SignedDataObjectProperties>
        <etsi:DataObjectFormat ObjectReference="#${invoiceTagRef}">
          <etsi:Description>${signatureDescription}</etsi:Description>
            <etsi:MimeType>text/xml</etsi:MimeType>
        </etsi:DataObjectFormat>
      </etsi:SignedDataObjectProperties>
    </etsi:SignedProperties>
  `;
}
