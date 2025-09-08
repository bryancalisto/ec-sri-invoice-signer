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
});
