/**
 * This doesn't implement the http://www.w3.org/TR/2001/REC-xml-c14n-20010315 specification entirely. Currently it's just
 * good enough to work with xml invoices that align with below requirements (which should cover most of the cases).
 * At first, won't implement the complete specification considering that the SRI software doesn't need many XML features
 * that the specification supports. In the future, if really needed, a complete canonicalization may be implemented.
 * 
 * The requirements for the input invoice XML are (none of these are needed to interchange XML data with the):
 * - The invoice to sign should consist of the 'factura' node and its children (e.g. <?xml version="1.0" encoding="UTF-8"?><factura Id="comprobante">...</factura>).
 *   The document declaration (i.e. <?xml version="1.0" encoding="UTF-8"?>) is optional.
 * - The invoice should be utf-8 encoded.
 * - No namespaces.
 * - No DOCTYPE entities.
 * - No Document type definition (DTD) tags.
 * - No xml-prefixed attributes (xml:<attr_name>).
 * 
 * Canonicalization based on:
 * - https://www.w3.org/TR/xml-c14n
 * - https://www.di-mgt.com.au/xmldsig-c14n.html
 */

// TODO:
/**
 *  - Remove any unnecesary code.
 *  - Make sure tests and coverage are passing. OK
 */

import { buildXml, parseXml } from "../utils/xml";

const CommentNodeIdentifier = '#comment';

const attributeCompare = (a: Attribute, b: Attribute) => {
  if (!a.namespaceURI && b.namespaceURI) {
    return -1;
  }

  if (!b.namespaceURI && a.namespaceURI) {
    return 1;
  }

  const left = a.namespaceURI + a.name;
  const right = b.namespaceURI + b.name;

  if (left === right) {
    return 0;
  }

  return left < right ? -1 : 1;
}

const namespaceCompare = (a: Namespace, b: Namespace) => {
  if (!a.prefix) {
    return -1;
  }

  if (!b.prefix) {
    return 1;
  }

  if (a.prefix === b.prefix) {
    return 0;
  }

  return a.prefix < b.prefix ? -1 : 1;
}

interface Attribute {
  name: string;
  namespacePrefix?: string;
  namespaceURI?: string;
  value: string;
}

interface Namespace {
  prefix?: string;
  uri: string;
}

type Node = Record<string, any>;

type GenericCollection = Record<string, string>;

const parseAttributesAndNamespaces = (data: GenericCollection) => {
  const attributes: Attribute[] = [];
  const attributesWithPendingNamespace: Attribute[] = [];
  const namespacesByPrefix: Record<string, Namespace> = {};

  for (const rawKey of Object.keys(data)) {
    const key = rawKey.substring(2); // without the @_ prefix
    const splittedKey = key.split(':');
    const isNamespace = splittedKey[0] === 'xmlns';
    const isAttribute = !isNamespace;
    const isAttributeWithNamespace = isAttribute && splittedKey.length === 2;

    if (isNamespace) {
      const prefix = splittedKey[1];
      namespacesByPrefix[prefix] = { prefix, uri: data[rawKey] };
    }

    if (isAttribute) {
      if (isAttributeWithNamespace) {
        const prefix = splittedKey[0];
        const namespaceURI = namespacesByPrefix[prefix]?.uri;

        if (namespaceURI === undefined) {
          attributesWithPendingNamespace.push({ name: splittedKey[isAttributeWithNamespace ? 1 : 0], namespaceURI, namespacePrefix: prefix, value: data[rawKey] });
        }
        else {
          attributes.push({ name: splittedKey[isAttributeWithNamespace ? 1 : 0], namespacePrefix: prefix, namespaceURI, value: data[rawKey] });
        }
      }
      else {
        attributes.push({ name: splittedKey[isAttributeWithNamespace ? 1 : 0], namespacePrefix: undefined, namespaceURI: undefined, value: data[rawKey] });
      }
    }
  }

  const solvedAttributesWithPendingNamespace: Attribute[] = attributesWithPendingNamespace.map((attr) => ({ ...attr, namespaceURI: namespacesByPrefix[attr.namespacePrefix ?? ''].uri, value: attr.value }));

  return { attributes: [...attributes, ...solvedAttributesWithPendingNamespace], namespaces: Object.values(namespacesByPrefix) };
}

const sortNamespaces = (namespaces: Namespace[]) => {
  namespaces.sort(namespaceCompare);
}

const sortAttributes = (attributes: Attribute[]) => {
  attributes.sort(attributeCompare);
}

const removeNode = (obj: Node[], currentPosition: number) => {
  obj.splice(currentPosition, 1);
}

const insertAttributesAndNamespaces = (node: Node, attributes: Attribute[], namespaces: Namespace[]) => {
  const toInsert: GenericCollection = {};

  namespaces.forEach((namespace) => {
    toInsert[`@_xmlns${namespace.prefix ? `:${namespace.prefix}` : ''}`] = namespace.uri;
  });

  attributes.forEach((attr) => {
    toInsert[`@_${attr.namespacePrefix ? `${attr.namespacePrefix}:${attr.name}` : attr.name}`] = attr.value;
  });

  node[':@'] = toInsert;
}

const mergeLocalAndInheritedNamespaces = (local: Namespace[], inherited: Namespace[]) => {
  // A local should override an inherited with the same prefix
  const acceptedInherited: Namespace[] = inherited.filter((inheritedNamespace) => !local.some((localNamespace) => localNamespace.prefix === inheritedNamespace.prefix));
  return [...acceptedInherited, ...local];
}

const processNode = (node: Node, alreadyDeclaredNamespaces: Namespace[], inheritedNamespaces?: Namespace[]) => {
  const reservedKeywords = new Set([':@', '#text', CommentNodeIdentifier]);
  let { attributes, namespaces } = parseAttributesAndNamespaces(node[':@'] ?? {})

  if (inheritedNamespaces) {
    namespaces = mergeLocalAndInheritedNamespaces(namespaces, inheritedNamespaces);
  }

  sortNamespaces(namespaces);
  sortAttributes(attributes);

  const tagName = Object.keys(node).find((key) => !reservedKeywords.has(key));
  const children = (node[tagName!] ?? []) as Node[];
  let i = 0;

  insertAttributesAndNamespaces(node, attributes, namespaces);

  while (i < children.length) {
    const child = children[i];

    if (child[CommentNodeIdentifier]) {
      removeNode(children, i);
      continue;
    }

    processNode(child, namespaces);

    i++;
  }

  return {
    namespaces: [...alreadyDeclaredNamespaces, ...namespaces]
  };
}

const processObj = (obj: Node[], inheritedNamespaces?: Namespace[]) => {
  let i = 0;

  while (i < obj.length) {
    const node = obj[i];

    if (node[CommentNodeIdentifier]) {
      removeNode(obj, i);
      continue;
    }

    processNode(node, [], inheritedNamespaces);

    i++;
  }
}

const c14nCanonicalize = (xml: string, options?: { inheritedNamespaces: Namespace[] }) => {
  const obj = parseXml(xml);

  processObj(obj, options?.inheritedNamespaces);

  return buildXml(obj);
}

export {
  c14nCanonicalize
}
