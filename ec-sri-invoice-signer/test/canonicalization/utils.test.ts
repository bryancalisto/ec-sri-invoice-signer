import { expect } from "chai";
import { encodeSpecialCharactersInAttribute } from "../../src/canonicalization/utils";

describe.only('encodeSpecialCharactersInAttribute', () => {
  it('Capitalizes lowercase chars in hex entities', () => {
    expect(encodeSpecialCharactersInAttribute('Thing &#xf3; 1 &#xf3;')).to.equal('Thing &#xF3; 1 &#xF3;');
    expect(encodeSpecialCharactersInAttribute('Thing &#x1f3; 1 &#x1f3;')).to.equal('Thing &#x1F3; 1 &#x1F3;');
    expect(encodeSpecialCharactersInAttribute('Thing &#x1fA; 1 &#x1fA;')).to.equal('Thing &#x1FA; 1 &#x1FA;');
  });

  it('Converts decimal entities to hex ones', () => {
    expect(encodeSpecialCharactersInAttribute('Thing &#09; 1 &#09;')).to.equal('Thing &#x9; 1 &#x9;');
    expect(encodeSpecialCharactersInAttribute('Thing &#012; 1 &#012;')).to.equal('Thing &#xC; 1 &#xC;');
    expect(encodeSpecialCharactersInAttribute('Thing &#47; 1 &#47;')).to.equal('Thing &#x2F; 1 &#x2F;');
  });
});