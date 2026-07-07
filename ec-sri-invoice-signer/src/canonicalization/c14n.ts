/**
 * Inclusive XML canonicalization (http://www.w3.org/TR/2001/REC-xml-c14n-20010315).
 *
 * This delegates to the spec-compliant implementation shipped by `xml-crypto`
 * (parsing via `@xmldom/xmldom`) instead of a hand-rolled canonicalizer.
 *
 * A canonicalization target that is only a fragment of a larger document (e.g.
 * the SignedInfo/KeyInfo/SignedProperties sections, which live inside the
 * ds:Signature element and inherit its namespace declarations) references
 * prefixes that are declared on an ancestor rather than in the fragment itself.
 * A namespace-aware parser rejects such undeclared prefixes, and inclusive c14n
 * must in any case render those inherited namespaces on the fragment's apex
 * element. Both concerns are solved by declaring them on the apex before
 * parsing; pass them via `options.inheritedNamespaces`.
 */

import { DOMParser } from '@xmldom/xmldom';
import { C14nCanonicalization } from 'xml-crypto';

interface Namespace {
  prefix?: string;
  uri: string;
}

/**
 * Declare the given namespaces on the root element's start tag so a
 * namespace-aware parser accepts inherited prefixes and c14n renders them on
 * the apex element.
 */
const declareNamespacesOnRoot = (xml: string, namespaces: Namespace[]) => {
  if (namespaces.length === 0) {
    return xml;
  }

  const declarations = namespaces
    .map((ns) => ` xmlns${ns.prefix ? `:${ns.prefix}` : ''}="${ns.uri}"`)
    .join('');

  // Insert right after the root element name in its opening tag.
  return xml.replace(/^(\s*<[^?!\s/>]+)/, `$1${declarations}`);
}

const c14nCanonicalize = (xml: string, options?: { inheritedNamespaces: Namespace[] }) => {
  const preparedXml = declareNamespacesOnRoot(xml, options?.inheritedNamespaces ?? []);
  const document = new DOMParser().parseFromString(preparedXml, 'text/xml');

  return new C14nCanonicalization().process(document.documentElement as unknown as Node, {});
}

export {
  c14nCanonicalize
}
