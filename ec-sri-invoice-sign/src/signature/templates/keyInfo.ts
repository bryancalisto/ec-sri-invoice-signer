type buildKeyInfoTagArgs = {
  certificateContent: string;
  certificateExponent: string;
  certificateModulus: string;
  keyInfoTagId: string;
}

export const buildKeyInfoTag = ({
  certificateContent,
  certificateExponent,
  certificateModulus,
  keyInfoTagId,
}: buildKeyInfoTagArgs) => {
  return `
    <ds:KeyInfo Id="${keyInfoTagId}">
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
