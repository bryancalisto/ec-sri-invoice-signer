class XmlFormatError extends Error {
  name: string = 'XmlFormatError';

  constructor() {
    const message = "There's a format error in your XML file";
    super(message);
  }
}

class UnsuportedPkcs12Error extends Error {
  name: string = 'UnsuportedPkcs12Error';

  constructor(extraMessage?: string) {
    let message = "The used .p12 file is not supported";

    if (extraMessage) {
      message += `: ${extraMessage}`;
    }

    super(message);
  }
}

class UnsupportedXmlFeatureError extends Error {
  name: string = 'UnsupportedXmlFeatureError';

  constructor(feature: string, description: string) {
    super(`Unsupported XML feature: ${feature}. ${description}`);
  }
}

class UnsupportedDocumentTypeError extends Error {
  name: string = 'UnsupportedDocumentTypeError';

  constructor(documentType: string) {
    super(`Unsupported document type: ${documentType}. Supported types are: factura, notaDebito, notaCredito, comprobanteRetencion, guiaRemision`);
  }
}

class UnexpectedDocumentRootError extends Error {
  name: string = 'UnexpectedDocumentRootError';

  constructor(expectedRoot: string, actualRoot: string) {
    super(`Unexpected document root: expected <${expectedRoot}>, but found <${actualRoot}>.`);
  }
}

export {
  UnsuportedPkcs12Error,
  XmlFormatError,
  UnsupportedXmlFeatureError,
  UnsupportedDocumentTypeError,
  UnexpectedDocumentRootError
}