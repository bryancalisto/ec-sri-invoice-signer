import { XmlProperties } from "../../utils/constants";

type buildSignatureTagArgs = {
  keyInfoSection: string;
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
  keyInfoSection,
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
      ${keyInfoSection}
      <ds:Object Id="${signatureObjectTagId}">
        <etsi:QualifyingProperties Target="#${signatureTagId}">
          ${signedPropertiesTag}
        </etsi:QualifyingProperties>
      </ds:Object>
    </ds:Signature>
  `;
}
