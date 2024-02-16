import { expect } from "chai";
import { encodeSpecialCharactersInAttribute } from "../../src/canonicalization/utils";

describe('encodeSpecialCharactersInAttribute', () => {
  it('Capitalizes lowercase chars in hex entities', () => {
    expect(encodeSpecialCharactersInAttribute('Thing &#xf3; 1')).to.equal('Thing &#xF3; 1');
    expect(encodeSpecialCharactersInAttribute('Thing &#x1f3; 1')).to.equal('Thing &#x1F3; 1');
    expect(encodeSpecialCharactersInAttribute('Thing &#x1fA; 1')).to.equal('Thing &#x1FA; 1');
  });

  it('Converts decimal entities to hex ones', () => {
    expect(encodeSpecialCharactersInAttribute('Thing &#09; 1')).to.equal('Thing &#x9; 1');
    expect(encodeSpecialCharactersInAttribute('Thing &#012; 1')).to.equal('Thing &#xC; 1');
    expect(encodeSpecialCharactersInAttribute('Thing &#47; 1')).to.equal('Thing &#x2F; 1');
  });
});