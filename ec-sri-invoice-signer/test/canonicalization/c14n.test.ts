import { expect } from "chai";
import { c14nCanonicalize } from "../../src/canonicalization/c14n";

describe('Given the c14nCanonicalize function', () => {
  it('Removes doc declaration, comments, sorts attributes and namespaces and trims document leading and trailing whitespace', () => {
    const input = `<?xml version="1.0" encoding="UTF-8"?>
        <doc>
  <e1   />


  <e2   ></e2>
  <e3   name = 'elem3'   id='elem3'   />
  <e4   name='elem4'   id='elem4'   ></e4>
  <e5 a:attr="out" b:attr="sorted" attr2="all" attr="I'm"
    xmlns:b="http://www.ietf.org"
    xmlns:a="http://www.w3.org"
    xmlns="http://example.org"/>
  <e6 xmlns:c="http://www.w3.org">
    <e7 xmlns="http://www.ietf.org">
      <e8 xmlns:d="http://www.w3.org">
        <e9 xmlns:e="http://www.ietf.org"/>
      </e8>
    </e7>
    <!-- Comment 2 -->

  </e6>

    <!-- Comment 3 -->

</doc>`;

    const expected = `\
<doc>
  <e1></e1>


  <e2></e2>
  <e3 id="elem3" name="elem3"></e3>
  <e4 id="elem4" name="elem4"></e4>
  <e5 xmlns="http://example.org" xmlns:a="http://www.w3.org" xmlns:b="http://www.ietf.org" attr="I'm" attr2="all" b:attr="sorted" a:attr="out"></e5>
  <e6 xmlns:c="http://www.w3.org">
    <e7 xmlns="http://www.ietf.org">
      <e8 xmlns:d="http://www.w3.org">
        <e9 xmlns:e="http://www.ietf.org"></e9>
      </e8>
    </e7>
    

  </e6>

    

</doc>`;

    const result = c14nCanonicalize(input);

    expect(result).to.equal(expected);
  });

  it('should replace whitespace between attributes with a single space (0x20)', () => {
    const input = `<e1   a='one'
    
    b  = 'two'  >`;

    const expected = `<e1 a="one" b="two"></e1>`;

    const result = c14nCanonicalize(input);
    expect(result).to.equal(expected);
  });

  it('should replace CR (0x0d), LF (0x0a), TAB (0x09) within attribute values with a single space (0x20)', () => {
    const input = `<e2 C=' letter


	A ' >`;

    const expected = `<e2 C=" letter    A "></e2>`;

    const result = c14nCanonicalize(input);
    expect(result).to.equal(expected);
  });

  it('should remove whitespace between the final double quotes in a start tag and the closing \'>\' and all whitespace in the closing tag', () => {
    const input = '<e3  d= "foo"  >bar</e3   >';
    const expected = '<e3 d="foo">bar</e3>'

    const result = c14nCanonicalize(input);
    expect(result).to.equal(expected);
  });

  it('should set inherited namespaces into the root canonicalization target subset', () => {
    const input = `<Doc Id="P666">
    <child>123</child>
    <child>456</child>
    <child>789</child>
    </Doc>`;
    const expected = `<Doc xmlns="http://www.example.com" xmlns:ab="http://www.ab.com" Id="P666">
    <child>123</child>
    <child>456</child>
    <child>789</child>
    </Doc>`;

    const result = c14nCanonicalize(input, {
      inheritedNamespaces: [
        {
          prefix: undefined,
          uri: 'http://www.example.com',
        },
        {
          prefix: 'ab',
          uri: 'http://www.ab.com'
        }
      ]
    });

    expect(result).to.equal(expected);
  });

  it('should override parent namespace URI with the child namespace URI', () => {
    const input = `<Doc Id="P666">
    <child>123</child>
    <child>456</child>
    <child>789</child>
    </Doc>`;
    const expected = `<Doc xmlns="http://www.example.com" xmlns:ab="http://www.ab.com" Id="P666">
    <child>123</child>
    <child>456</child>
    <child>789</child>
    </Doc>`;

    const result = c14nCanonicalize(input, {
      inheritedNamespaces: [
        {
          prefix: undefined,
          uri: 'http://www.example.com',
        },
        {
          prefix: 'ab',
          uri: 'http://www.ab.com'
        }
      ]
    });

    expect(result).to.equal(expected);
  });

  it('should process entities in element content', () => {
    const input = `<a>'>&&apos;>foo="bar">&apos;&&apoz;&quot;</a>`;

    const expected = `<a>'&gt;&amp;'&gt;foo="bar"&gt;'&amp;&amp;apoz;"</a>`;

    const result = c14nCanonicalize(input);
    expect(result).to.equal(expected);
  });

  it.only('should process entities in elements and attributes', () => {
    const input = `<doc>
  <text>First line&#x0d;&#10;Second line</text>
  <value>&#x32;</value>
  <compute><![CDATA[value>"0" && value<"10" ?"valid":"error"]]></compute>
  <compute expr='value>"0" &amp;&amp; value&lt;"10" ?"valid":"error"'>valid</compute>
  <norm attr=' &apos;   &#x20;&#13;&#xa;&#9;   &apos; '/>
  <normNames attr='   A   &#x20;&#13;&#xa;&#9;   B   '/>
</doc>`;

    const expected = `<doc>
  <text>First line&#xD;
Second line</text>
  <value>2</value>
  <compute>value&gt;"0" &amp;&amp; value&lt;"10" ?"valid":"error"</compute>
  <compute expr="value>&quot;0&quot; &amp;&amp; value&lt;&quot;10&quot; ?&quot;valid&quot;:&quot;error&quot;">valid</compute>
  <norm attr=" '    &#xD;&#xA;&#x9;   ' "></norm>
  <normNames attr="A &#xD;&#xA;&#x9; B"></normNames>
</doc>`;

    const result = c14nCanonicalize(input);
    expect(result).to.equal(expected);
  });
});
