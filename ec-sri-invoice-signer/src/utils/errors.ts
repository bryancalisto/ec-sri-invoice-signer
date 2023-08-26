class XmlFormatError extends Error {
  name: string = 'XmlFormatError';

  constructor() {
    const message = "There's a format error in your XML file";
    super(message);
  }
}

class UnsuportedPkcs12Error extends Error {
  name: string = 'UnsuportedPkcs12Error';

  constructor() {
    const message = "The used pkcs12 file is not supported";
    super(message);
  }
}

export {
  UnsuportedPkcs12Error,
  XmlFormatError
}