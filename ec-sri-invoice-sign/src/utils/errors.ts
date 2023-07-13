class XmlFormatError extends Error {
  name: string = 'XmlFormatError';

  constructor() {
    const message = `There's an format error in your XML file`;
    super(message);
  }
}

export {
  XmlFormatError
}