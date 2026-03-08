import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { UnsupportedDocumentTypeError, UnsupportedXmlFeatureError, XmlFormatError } from './errors';
import { processAttributeValue, processTagValue } from '../canonicalization/utils';
import { SupportedDocumentTypes } from './constants';

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
      return processAttributeValue(value);
    },
    tagValueProcessor: (name: string, value: string) => {
      return processTagValue(value);
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

const validateDocumentType = (xml: string) => {
  const parsed = parseXml(xml);

  if (!parsed || parsed.length === 0) {
    throw new XmlFormatError();
  }

  // Find the root element
  const rootElement = Object.keys(parsed[0]).find(key =>
    key !== ':@' && key !== '#text' && !key.startsWith('#')
  );

  if (!rootElement) {
    throw new XmlFormatError();
  }

  if (!SupportedDocumentTypes.has(rootElement)) {
    throw new UnsupportedDocumentTypeError(rootElement);
  }
};

const validateXmlFeatures = (xml: string) => {
  // Check for DOCTYPE declarations
  if (xml.includes('<!DOCTYPE')) {
    throw new UnsupportedXmlFeatureError(
      'DOCTYPE declarations',
      'DOCTYPE declarations are not supported. Remove any <!DOCTYPE> declarations from your XML.'
    );
  }

  // Check for xml-prefixed attributes
  const xmlAttributePattern = /\w+:\w+\s*=/g;
  const xmlAttributeMatches = xml.match(xmlAttributePattern);
  if (xmlAttributeMatches) {
    for (const match of xmlAttributeMatches) {
      if (match.startsWith('xml:')) {
        throw new UnsupportedXmlFeatureError(
          'xml-prefixed attributes',
          `Found attribute "${match}". Remove any xml: prefixed attributes from your XML.`
        );
      }
    }
  }

  // Check for namespace declarations (xmlns)
  if (xml.includes('xmlns:')) {
    throw new UnsupportedXmlFeatureError(
      'namespace declarations',
      'Namespace declarations (xmlns:) are not supported in the document root. This library adds the necessary namespaces automatically during signing.'
    );
  }

  // Check for default xmlns declarations
  const defaultXmlnsPattern = /<\w+[^>]*\s+xmlns\s*=/;
  if (defaultXmlnsPattern.test(xml)) {
    throw new UnsupportedXmlFeatureError(
      'default namespace declarations',
      'Default xmlns declarations are not supported. This library adds the necessary namespaces automatically during signing.'
    );
  }

  // Check for processing instructions other than XML declaration
  const processingInstructionPattern = /<\?[^?]*\?>/g;
  const matches = xml.match(processingInstructionPattern);
  if (matches) {
    for (const match of matches) {
      if (!match.startsWith('<?xml')) {
        throw new UnsupportedXmlFeatureError(
          'processing instructions',
          `Found processing instruction "${match}". Only XML declarations (<?xml ... ?>) are supported.`
        );
      }
    }
  }
};

export {
  buildXml,
  parseXml,
  validateDocumentType,
  validateXmlFeatures
}
