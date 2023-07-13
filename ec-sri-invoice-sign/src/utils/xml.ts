import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { XmlFormatError } from './errors';

type XmlObj = Array<Record<any, any>>;

const parseXml = (xml: string): XmlObj => {
  const parserOptions = {
    ignoreAttributes: false,
    preserveOrder: true
  };

  try {
    const parser = new XMLParser(parserOptions);
    return parser.parse(xml);
  } catch (err) {
    throw new XmlFormatError();
  }
};

const buildXml = (data: Record<any, any>) => {
  const builderOptions = {
    ignoreAttributes: false,
    preserveOrder: true
  };

  const builder = new XMLBuilder(builderOptions);
  return builder.build(data);
}

export {
  buildXml,
  parseXml
}
