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
  return `
    <ds:Signature  xmlns:etsi="${XmlProperties.namespaces.etsi}" Id="${signatureTagId}">
      ${signedInfoTag}
      <ds:SignatureValue Id="${signatureValueTagId}">
        ${signedSignedInfoTag}
      </ds:SignatureValue>
      ${keyInfoTag}
      <ds:Object Id="${signatureObjectTagId}">
        <etsi:QualifyingProperties Target="#${signatureTagId}">
          ${signedPropertiesTag}
        </etsi:QualifyingProperties>
      </ds:Object>
    </ds:Signature>
  `;
}
