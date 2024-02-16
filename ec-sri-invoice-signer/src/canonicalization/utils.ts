import { pipe } from "../utils/utils";

export const normalizeWhitespace = (str: string) => {
  return str.replace(/[\r\t\n]/g, ' ');
}

// TODO: Refactor this function to a more declarative approach
export const parseEntities = (str: string) => {
  let current = 0;
  let result = '';

  const peekApos = (str: string) => {
    const start = current + 1;
    const end = current + 6;
    return str.substring(start, end) === 'apos;';
  };

  const peekQuot = (str: string) => {
    const start = current + 1;
    const end = current + 6;
    return str.substring(start, end) === 'quot;';
  };

  while (current < str.length) {
    switch (str[current]) {
      case '<':
        result += '&lt;';
        break;
      case '>':
        result += '&gt;';
        break;
      case '&':
        if (peekApos(str)) {
          current += 5;
          result += '\'';
          break;
        }

        if (peekQuot(str)) {
          current += 5;
          result += '\"';
          break;
        }

        result += '&amp;';
        break;
      default:
        result += str[current];
        break;
    };

    current++;
  }

  return result;
}

function setCapitalsInHexEntities(value: string) {
  const entitiesToReplace = /&#x[aA-fF\d]+;/.exec(value) ?? [];
  let newValue = value;

  for (const entity of entitiesToReplace) {
    newValue = newValue.replace(entity, `&#x${entity.slice(3).toUpperCase()}`);
  }

  return newValue;
}

function convertDecimalEntitiesIntoHexEntities(value: string) {
  const entitiesToReplace = /&#\d+;/.exec(value) ?? [];
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