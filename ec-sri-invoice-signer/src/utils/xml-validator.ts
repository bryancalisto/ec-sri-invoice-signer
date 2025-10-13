import { parseXml } from "./xml";
import { UnsupportedXmlFeatureError, UnsupportedDocumentTypeError, XmlFormatError } from "./errors";

const SUPPORTED_DOCUMENT_TYPES = ['factura', 'liquidacionCompra', 'notaDebito', 'notaCredito', 'comprobanteRetencion', 'guiaRemision'];

const validateDocumentType = (xml: string): string => {
  const parsed = parseXml(xml);

  // Find the root element
  const rootElement = Object.keys(parsed[0]).find(key =>
    key !== ':@' && key !== '#text' && !key.startsWith('#')
  );

  if (!rootElement) {
    throw new XmlFormatError();
  }

  if (!SUPPORTED_DOCUMENT_TYPES.includes(rootElement)) {
    throw new UnsupportedDocumentTypeError(rootElement);
  }

  return rootElement;
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

const validateRootDocumentStructure = (xml: string, documentType: string) => {
  const parsed = parseXml(xml);
  const rootObject = parsed[0];
  const rootElement = rootObject[documentType];

  if (!rootElement) {
    throw new XmlFormatError();
  }

  // Check if root element has the required 'Id' attribute
  const attributes = rootObject[':@'] || {};
  const hasIdAttribute = Object.keys(attributes).some(key => {
    const cleanKey = key.replace('@_', '').toLowerCase();
    return cleanKey === 'id';
  });

  if (!hasIdAttribute) {
    throw new UnsupportedXmlFeatureError(
      'missing Id attribute',
      `Root element '${documentType}' must have an 'Id' attribute (case-insensitive) with value 'comprobante'.`
    );
  }

  // Check if root element has version attribute
  const hasVersionAttribute = Object.keys(attributes).some(key => {
    const cleanKey = key.replace('@_', '').toLowerCase();
    return cleanKey === 'version';
  });

  if (!hasVersionAttribute) {
    throw new UnsupportedXmlFeatureError(
      'missing version attribute',
      `Root element '${documentType}' must have a 'version' attribute.`
    );
  }
};

export const validateXmlForSigning = (xml: string): string => {
  // Basic XML validation
  if (!xml || typeof xml !== 'string') {
    throw new XmlFormatError();
  }

  // Validate XML features
  validateXmlFeatures(xml);

  // Validate document type and return it
  const documentType = validateDocumentType(xml);

  // Validate root document structure
  validateRootDocumentStructure(xml, documentType);

  return documentType;
};

export {
  UnsupportedXmlFeatureError,
  UnsupportedDocumentTypeError,
  XmlFormatError
};