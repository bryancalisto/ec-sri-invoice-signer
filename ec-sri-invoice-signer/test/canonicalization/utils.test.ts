import { expect } from "chai";
import { processAttributeValue, processTagValue } from "../../src/canonicalization/utils";

describe('processAttributeValue', () => {
  it('Capitalizes lowercase chars in hex entities', () => {
    expect(processAttributeValue('Thing &#xd; 1 &#xd;')).to.equal('Thing &#xD; 1 &#xD;');
  });

  it('Converts decimal entities to hex ones', () => {
    expect(processAttributeValue('Thing &#013; 1 &#013;')).to.equal('Thing &#xD; 1 &#xD;');
  });

  it('encodes special characters', () => {
    expect(processAttributeValue('Thing" &\n << &#09; 1 &#09;')).to.equal('Thing&quot; &amp;&#xA; &lt;&lt; &#x9; 1 &#x9;');
    expect(processAttributeValue('Thing &#xf3; 1 &#xf3;')).to.equal('Thing ó 1 ó');
    expect(processAttributeValue('Thing &#x16f; 1 &#x16f;')).to.equal('Thing ů 1 ů');
    expect(processAttributeValue('Thing &#x1fA; 1 &#x1fA;')).to.equal('Thing Ǻ 1 Ǻ');
  });

  it('Normalizes whitespace', () => {
    expect(processAttributeValue(' &#x20; Thing &#x20; &#x20; ')).to.equal('   Thing     ');
  });
});

describe('processTagValue', () => {
  it('Capitalizes lowercase chars in hex entities', () => {
    expect(processAttributeValue('Thing &#xd; 1 &#xd;')).to.equal('Thing &#xD; 1 &#xD;');
  });

  it('Converts decimal entities to hex ones', () => {
    expect(processAttributeValue('Thing &#013; 1 &#013;')).to.equal('Thing &#xD; 1 &#xD;');
  });

  it('encodes special characters', () => {
    const input = 'First line&#x0d;&#10;Second line';
    const expected = `First line&#xD;
Second line`;

    expect(processTagValue(input)).to.equal(expected);
  });

});