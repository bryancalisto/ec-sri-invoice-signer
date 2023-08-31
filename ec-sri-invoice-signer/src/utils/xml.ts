import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { XmlFormatError } from './errors';
import { normalizeWhitespace, parseEntities } from '../canonicalization/utils';

type XmlObj = Array<Record<any, any>>;

const parseXml = (xml: string): XmlObj => {
  const parserOptions = {
    commentPropName: '#comment', // need to include comments to keep the possible whitespace that is left when removing them. Otherwhise the library gets rid of it
    ignoreAttributes: false,
    ignoreDeclaration: true,
    parseTagValue: false,
    preserveOrder: true,
    trimValues: false,
    processEntities: false,
    ignorePiTags: true,
    attributeValueProcessor: (name: string, value: string) => {
      return normalizeWhitespace(value);
    },
    tagValueProcessor: (name: string, value: string) => {
      return parseEntities(value);
    }
  };

  try {
    const parser = new XMLParser(parserOptions);
    return parser.parse(xml);
  } catch (err) {
    throw new XmlFormatError();
  }
};

const buildXml = (data: Record<any, any>): string => {
  const builderOptions = {
    ignoreAttributes: false,
    preserveOrder: true,
    processEntities: false,
    suppressEmptyNode: false
  };

  const builder = new XMLBuilder(builderOptions);
  return builder.build(data);
}

export {
  buildXml,
  parseXml
}
