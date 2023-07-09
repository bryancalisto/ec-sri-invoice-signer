type buildKeyInfoArgs = {
  certificateContent: string;
  certificateExponent: string;
  certificateModulus: string;
  certificateTagId: string;
}

export const buildKeyInfo = ({
  certificateContent,
  certificateExponent,
  certificateModulus,
  certificateTagId,
}: buildKeyInfoArgs): string => {
  return `
    <ds:KeyInfo Id="Certificate${certificateTagId}">
      <ds:X509Data>
        <ds:X509Certificate>${certificateContent}</ds:X509Certificate>
      </ds:X509Data>
      <ds:KeyValue>
        <ds:RSAKeyValue>
          <ds:Modulus>${certificateModulus}</ds:Modulus>
          <ds:Exponent>${certificateExponent}</ds:Exponent>
        </ds:RSAKeyValue>
      </ds:KeyValue>
    </ds:KeyInfo>
  `;
}
