import * as forge from 'node-forge';

export const verifySignature = (preSignData: string, publicKey: forge.pki.rsa.PublicKey, signature: string) => {
  const digest = forge.md.sha1.create().update(preSignData, 'utf8');
  return publicKey.verify(digest.digest().bytes(), forge.util.decode64(signature));
}
