import { XmlProperties } from '../../utils/constants';

type buildSignedPropertiesTagArgs = {
  invoiceTagRefId: string;
  signedPropertiesTagId: string;
  signingTime: string;
  x509Hash: string;
  x509IssuerName: string;
  x509SerialNumber: string;
}

export const buildSignedPropertiesTag = ({
  invoiceTagRefId,
  signedPropertiesTagId,
  signingTime,
  x509Hash,
  x509IssuerName,
  x509SerialNumber,
}: buildSignedPropertiesTagArgs) => {
  return `\
<xades:SignedProperties Id="${signedPropertiesTagId}">\
<xades:SignedSignatureProperties>\
<xades:SigningTime>${signingTime}</xades:SigningTime>\
<xades:SigningCertificate>\
<xades:Cert>\
<xades:CertDigest>\
<ds:DigestMethod Algorithm="${XmlProperties.algorithms.digest}"/>\
<ds:DigestValue>${x509Hash}</ds:DigestValue>\
</xades:CertDigest>\
<xades:IssuerSerial>\
<ds:X509IssuerName>${x509IssuerName}</ds:X509IssuerName>\
<ds:X509SerialNumber>${x509SerialNumber}</ds:X509SerialNumber>\
</xades:IssuerSerial>\
</xades:Cert>\
</xades:SigningCertificate>\
</xades:SignedSignatureProperties>\
<xades:SignedDataObjectProperties>\
<xades:DataObjectFormat ObjectReference="#${invoiceTagRefId}">\
<xades:Description>Firma digital</xades:Description>\
<xades:MimeType>text/xml</xades:MimeType>\
<xades:Encoding>UTF-8</xades:Encoding>\
</xades:DataObjectFormat>\
</xades:SignedDataObjectProperties>\
</xades:SignedProperties>`;
}
