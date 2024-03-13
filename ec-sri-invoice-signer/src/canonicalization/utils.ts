import { pipe } from "../utils/utils";

export const normalizeWhitespace = (str: string) => {
  return str.replace(/[\r\t\n]/g, ' ');
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

export function encodeSpecialCharactersInAttribute(value: string) {
  const processingSteps = [
    setCapitalsInHexEntities,
    convertDecimalEntitiesIntoHexEntities
  ];

  return pipe<string>(processingSteps)(value);
}