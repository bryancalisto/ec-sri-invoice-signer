import { XMLParser } from "fast-xml-parser";
import { pipe } from "../utils/utils";

function normalizeWhitespaceInAttributeValue(value: string) {
  const trimmed = value.replace(/&#x20/g, ' ');
  return trimmed;
}

function encodeEntitiesInTagValue(value: string) {
  const encodings: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\r": "&#xD;"
  };

  return value.replace(/([<>\r])/gm, function (match, offset) {
    return encodings[match];
  })
    // Replace the ampersand only if it's not part of an entity 
    .replace(/&(?!(#x[aA-fF\d]+;)|amp;|lt;|gt;)/gm, function (match, offset) {
      return encodings[match];
    });
}

function decodeUtf8HexEntitiesInTagValue(value: string) {
  const notDecodedEntities = new Set(['&#xD;']);
  const entitiesToReplace = value.match(/&#x[aA-fF\d]+;/gm) ?? [];
  let newValue = value;

  for (const entity of entitiesToReplace) {
    if (!notDecodedEntities.has(entity)) {
      const hexToDecode = entity.match(/[aA-fF\d]+/)![0];
      const decimalToDecode = parseInt(hexToDecode, 16);
      const decoded = String.fromCodePoint(decimalToDecode);
      newValue = newValue.replace(entity, decoded);
    }
  }

  return newValue;
}

function decodeUtf8EntitiesInTagValue(value: string) {
  const notDecodedEntities = new Set(['&amp;', '&lt;', '&gt;']);
  const entitiesToReplace = value.match(/&([aA-zZ]+);/gm) ?? [];
  let newValue = value;

  for (const entity of entitiesToReplace) {
    if (!notDecodedEntities.has(entity)) {
      const decoded = new TextDecoder('utf-8').decode(new Uint8Array([parseInt(entity.slice(3), 16)]))
      newValue = newValue.replace(entity, decoded);
    }
  }

  return newValue;
}

/**
 * Replace characters with their respective XML entities.
 * & is a special case, as it's not replaced if it's part of an entity.
 */
function encodeEntitiesInAttributeValue(value: string) {
  const encodings: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    '"': "&quot;",
    "\r": "&#xD;",
    "\n": "&#xA;",
    "\t": "&#x9;"
  };

  // Replace the ampersand only if it's not part of an entity
  return value.replace(/&(?!(#x[aA-fF\d]+;)|amp;|quot;|lt;|apos;)/gm, function (match) {
    return encodings[match];
  }).replace(/[<"\r\n\t]/gm, function (match) {
    return encodings[match];
  });
}

function decodeUtf8HexEntitiesInAttributeValue(value: string) {
  const notDecodedEntities = new Set(['&#xD;', '&#xA;', '&#x9;']);
  const entitiesToReplace = value.match(/&#x[aA-fF\d]+;/gm) ?? [];
  let newValue = value;

  for (const entity of entitiesToReplace) {
    if (!notDecodedEntities.has(entity)) {
      const hexToDecode = entity.match(/[aA-fF\d]+/)![0];
      const decimalToDecode = parseInt(hexToDecode, 16);
      const decoded = String.fromCodePoint(decimalToDecode);
      newValue = newValue.replace(entity, decoded);
    }
  }

  return newValue;
}

function decodeUtf8EntitiesInAttributeValue(value: string) {
  const notDecodedEntities = new Set(['&amp;', '&lt;', '&quot;']);
  const entitiesToReplace = value.match(/&[aA-zZ]+;/gm) ?? [];
  let newValue = value;

  for (const entity of entitiesToReplace) {
    if (!notDecodedEntities.has(entity)) {
      const decoded = new XMLParser().parse(`<body>${entity}</body>`).body ?? '';
      newValue = newValue.replace(entity, decoded);
    }
  }

  return newValue;
}

function removeLeadingZerosInHexEntity(value: string) {
  return value.replace(/0+(?=[\daA-fF]+;)/g, '');
}

function setCapitalsInHexEntities(value: string) {
  const entitiesToReplace = value.match(/&#x[aA-fF\d]+;/gm) ?? [];
  let newValue = value;

  for (const entity of entitiesToReplace) {
    const entityWithoutLeadingZeros = removeLeadingZerosInHexEntity(entity);
    newValue = newValue.replace(entity, `&#x${entityWithoutLeadingZeros.slice(3).toUpperCase()}`);
  }

  return newValue;
}

function convertDecimalEntitiesIntoHexEntities(value: string) {
  const entitiesToReplace = value.match(/&#\d+;/gm) ?? [];
  let newValue = value;

  for (const entity of entitiesToReplace) {
    const hexValue = Number(entity.slice(2, -1)).toString(16).toUpperCase();
    newValue = newValue.replace(entity, `&#x${hexValue};`);
  }

  return newValue;
}

function processAttributeValue(value: string) {
  const processingSteps = [
    setCapitalsInHexEntities,
    convertDecimalEntitiesIntoHexEntities,
    encodeEntitiesInAttributeValue,
    decodeUtf8HexEntitiesInAttributeValue,
    decodeUtf8EntitiesInAttributeValue,
    normalizeWhitespaceInAttributeValue
  ];

  return pipe<string>(processingSteps)(value);
}

function processTagValue(value: string) {
  const processingSteps = [
    setCapitalsInHexEntities,
    convertDecimalEntitiesIntoHexEntities,
    encodeEntitiesInTagValue,
    decodeUtf8HexEntitiesInTagValue,
    decodeUtf8EntitiesInTagValue
  ];

  return pipe<string>(processingSteps)(value);
}

export {
  processAttributeValue,
  processTagValue
};