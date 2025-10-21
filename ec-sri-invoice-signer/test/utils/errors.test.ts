import { describe, it, expect } from '@jest/globals';
import { UnsuportedPkcs12Error, XmlFormatError } from "../../src/utils/errors";

describe('XmlFormatError', () => {
  it('Show expected message when thrown', () => {
    expect(() => { throw new XmlFormatError(); }).toThrow("There's a format error in your XML file");
  });
});

describe('UnsuportedPkcs12Error', () => {
  it('Show expected message when thrown', () => {
    expect(() => { throw new UnsuportedPkcs12Error(); }).toThrow("The used .p12 file is not supported");
  });

  it ('Should include extra message when provided', () => {
    expect(() => { throw new UnsuportedPkcs12Error('Extra details here'); }).toThrow("The used .p12 file is not supported: Extra details here");
  });

  it('Should include previous error stack trace', () => {
    const catchedError = new Error('Catched error');
    try {
      throw new UnsuportedPkcs12Error('whatever', catchedError);
    } catch (error: any) {
      expect(error.stack).toContain(catchedError.stack);
    }
  });
});
