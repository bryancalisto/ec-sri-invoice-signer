import { buildXml, parseXml } from "../utils/xml";

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

  // const solvedAttributesWithPendingNamespace: Attribute[] = attributesWithPendingNamespace.map((attr) => ({ name: attr.name, namespaceURI: namespacesByPrefix[attr.prefix].uri, value: attr.value }));
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

const processNode = (node: Node, depth: number) => {
  const reservedKeywords = new Set([':@', '#text', '#comment']);
  const { attributes, namespaces } = parseAttributesAndNamespaces(node[':@'] ?? {})

  sortNamespaces(namespaces);
  sortAttributes(attributes);

  const tagName = Object.keys(node).find((key) => !reservedKeywords.has(key));
  const children = (node[tagName!] ?? []) as Node[];
  let i = 0;

  if (tagName === 'e5') {
    console.log('NODE', node, 'ATTR', attributes, 'NAMESP', namespaces);
  }

  insertAttributesAndNamespaces(node, attributes, namespaces);

  if (tagName === 'e5') {
    console.log('AFTER NODE', node);
  }

  while (i < children.length) {
    const child = children[i];

    if (child['#comment']) {
      removeNode(children, i);
      continue;
    }

    processNode(child, depth + 1);

    i++;
  }
}

const processObj = (obj: Node[]) => {
  let depth = 0;
  let i = 0;

  while (i < obj.length) {
    const node = obj[i];

    if (node['#comment']) {
      removeNode(obj, i);
      continue;
    }

    processNode(node, depth);

    i++;
  }
}

const c14nCanonicalize = (xml: string) => {
  const obj = parseXml(xml);

  processObj(obj);

  return buildXml(obj);
}

export {
  c14nCanonicalize
}
