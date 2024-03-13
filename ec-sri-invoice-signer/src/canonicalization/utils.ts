import { pipe } from "../utils/utils";

function normalizeWhitespace(str: string) {
  return str.replace(/[\r\t\n]/g, ' ');
}

function encodeEntitiesInTagValue(value: string) {
  const encodings: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\r": "&#xD;"
  };

  return value.replace(/([&<>\r])/g, function (str, item) {
    return encodings[item];
  });
}

function encodeEntitiesInAttributeValue(value: string) {
  const encodings: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    '"': "&quot;",
    "\r": "&#xD;",
    "\n": "&#xA;",
    "\t": "&#x9;"
  };

  return value.replace(/([&<"\r\n\t])/g, function (str, item) {
    return encodings[item];
  });
}

function setCapitalsInHexEntities(value: string) {
  const entitiesToReplace = value.match(/&#x[aA-fF\d]+;/gm) ?? [];
  let newValue = value;

  for (const entity of entitiesToReplace) {
    newValue = newValue.replace(entity, `&#x${entity.slice(3).toUpperCase()}`);
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
    normalizeWhitespace,
    setCapitalsInHexEntities,
    convertDecimalEntitiesIntoHexEntities
  ];

  return pipe<string>(processingSteps)(value);
}

function processTagValue(value: string) {
  const processingSteps = [
    setCapitalsInHexEntities,
    convertDecimalEntitiesIntoHexEntities,
    encodeEntitiesInTagValue
  ];

  return pipe<string>(processingSteps)(value);
}

export {
  processAttributeValue,
  processTagValue
};