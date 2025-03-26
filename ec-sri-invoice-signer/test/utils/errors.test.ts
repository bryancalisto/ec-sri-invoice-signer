import { expect } from "chai";
import { UnsuportedPkcs12Error, XmlFormatError } from "../../src/utils/errors";

describe('XmlFormatError', () => {
  it('Show expected message when thrown', () => {
    expect(() => { throw new XmlFormatError(); }).throws("There's a format error in your XML file");
  });
});

describe('UnsuportedPkcs12Error', () => {
  it('Show expected message when thrown', () => {
    expect(() => { throw new UnsuportedPkcs12Error(); }).throws("The used .p12 file is not supported");
  });

  it('Show expected message with additional details if available when thrown', () => {
    expect(() => { throw new UnsuportedPkcs12Error("Extra details"); }).throws("The used .p12 file is not supported: Extra details");
  });
});