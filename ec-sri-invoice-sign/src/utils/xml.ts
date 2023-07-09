import { XMLParser, XMLBuilder } from 'fast-xml-parser';

const parseXml = (xml: string) => {
  const parserOptions = {
    ignoreAttributes: false,
    preserveOrder: true
  };

  const parser = new XMLParser(parserOptions);
  return parser.parse(xml);
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
