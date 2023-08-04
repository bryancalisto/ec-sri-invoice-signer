import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { XmlFormatError } from './errors';
import { normalizeWhitespace } from '../canonicalization/utils';

type XmlObj = Array<Record<any, any>>;

const parseXml = (xml: string): XmlObj => {
  const parserOptions = {
    commentPropName: '#comment', // need to parse comments to keep the possible whitespace that is left when removing them. Otherwhise the library gets rid of it
    ignoreAttributes: false,
    ignoreDeclaration: true,
    parseTagValue: false,
    preserveOrder: true,
    trimValues: false,
    ignorePiTags: true,
    attributeValueProcessor: (name: string, value: string) => {
      return normalizeWhitespace(value);
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
