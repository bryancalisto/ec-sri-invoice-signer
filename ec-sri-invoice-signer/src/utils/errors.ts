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

export {
  UnsuportedPkcs12Error,
  XmlFormatError
}