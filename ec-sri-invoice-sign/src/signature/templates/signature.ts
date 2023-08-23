import { XmlProperties } from "../../utils/constants";

type buildSignatureTagArgs = {
  keyInfoTag: string;
  signatureTagId: string;
  signatureObjectTagId: string;
  signatureValueTagId: string;
  signedInfoTag: string;
  signedSignedInfoTag: string;
  signedPropertiesTag: string;
}

export const buildSignatureTag = ({
  signatureTagId,
  signatureObjectTagId,
  signedInfoTag,
  keyInfoTag,
  signedSignedInfoTag,
  signatureValueTagId,
  signedPropertiesTag
}: buildSignatureTagArgs) => {
  return `\
<ds:Signature xmlns:ds="${XmlProperties.namespaces.ds}" Id="${signatureTagId}">\
${signedInfoTag}\
<ds:SignatureValue Id="${signatureValueTagId}">\
${signedSignedInfoTag}\
</ds:SignatureValue>\
${keyInfoTag}\
<ds:Object Id="${signatureObjectTagId}">\
<xades:QualifyingProperties xmlns:xades="http://uri.etsi.org/01903/v1.3.2#" Target="#${signatureTagId}">\
${signedPropertiesTag}\
</xades:QualifyingProperties>\
</ds:Object>\
</ds:Signature>`;
}
