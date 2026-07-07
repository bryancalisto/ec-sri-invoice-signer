import { describe, it, expect } from '@jest/globals';
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

    expect(result).toEqual(expected);
  });

  it('should replace whitespace between attributes with a single space (0x20)', () => {
    const input = `<e1   a='one'

    b  = 'two'  />`;

    const expected = `<e1 a="one" b="two"></e1>`;

    const result = c14nCanonicalize(input);
    expect(result).toEqual(expected);
  });

  it('should remove whitespace between the final double quotes in a start tag and the closing ">" and all whitespace in the closing tag', () => {
    const input = '<e3  d= "foo"  >bar</e3   >';
    const expected = '<e3 d="foo">bar</e3>'

    const result = c14nCanonicalize(input);
    expect(result).toEqual(expected);
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

    expect(result).toEqual(expected);
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

    expect(result).toEqual(expected);
  });

  it('should render an inherited prefixed namespace on the fragment apex only, not on descendants that reuse it', () => {
    const input = '<ds:SignedInfo Id="x"><ds:Reference URI="#a"></ds:Reference></ds:SignedInfo>';
    const expected = '<ds:SignedInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#" Id="x"><ds:Reference URI="#a"></ds:Reference></ds:SignedInfo>';

    const result = c14nCanonicalize(input, {
      inheritedNamespaces: [
        { prefix: 'ds', uri: 'http://www.w3.org/2000/09/xmldsig#' }
      ]
    });

    expect(result).toEqual(expected);
  });

  it('should render multiple inherited namespaces on the apex sorted by prefix', () => {
    const input = '<xades:SignedProperties Id="sp"><ds:DigestValue>abc</ds:DigestValue></xades:SignedProperties>';
    const expected = '<xades:SignedProperties xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:xades="http://uri.etsi.org/01903/v1.3.2#" Id="sp"><ds:DigestValue>abc</ds:DigestValue></xades:SignedProperties>';

    const result = c14nCanonicalize(input, {
      inheritedNamespaces: [
        { prefix: 'xades', uri: 'http://uri.etsi.org/01903/v1.3.2#' },
        { prefix: 'ds', uri: 'http://www.w3.org/2000/09/xmldsig#' }
      ]
    });

    expect(result).toEqual(expected);
  });

  it('should let a child redeclare a default namespace that differs from the inherited one', () => {
    const input = '<Doc Id="P"><child xmlns="http://other">v</child></Doc>';
    const expected = '<Doc xmlns="http://www.example.com" Id="P"><child xmlns="http://other">v</child></Doc>';

    const result = c14nCanonicalize(input, {
      inheritedNamespaces: [
        { prefix: undefined, uri: 'http://www.example.com' }
      ]
    });

    expect(result).toEqual(expected);
  });

  it('should expand empty/self-closing elements to explicit start and end tags', () => {
    const input = '<a><b/></a>';
    const expected = '<a><b></b></a>';

    const result = c14nCanonicalize(input);
    expect(result).toEqual(expected);
  });

  it('should preserve line feeds in text but escape carriage returns as character references', () => {
    const input = '<a>line1&#13;\nline2</a>';
    const expected = '<a>line1&#xD;\nline2</a>';

    const result = c14nCanonicalize(input);
    expect(result).toEqual(expected);
  });

  it('should escape whitespace character references inside attribute values', () => {
    const input = '<a b="x&#9;y"/>';
    const expected = '<a b="x&#x9;y"></a>';

    const result = c14nCanonicalize(input);
    expect(result).toEqual(expected);
  });

  it('should keep the trailing carriage return entity found in real SRI document text', () => {
    const input = '<factura id="comprobante"><dir>Quito Sur  &#013; </dir></factura>';
    const expected = '<factura id="comprobante"><dir>Quito Sur  &#xD; </dir></factura>';

    const result = c14nCanonicalize(input);
    expect(result).toEqual(expected);
  });

  it('should process entities in elements and attributes', () => {
    const input = `<doc>
  <text>First line&#x0d;&#10;Second line</text>
  <value>&#x32;</value>
  <compute><![CDATA[value>"0" && value<"10" ?"valid":"error"]]></compute>
  <compute expr='value>"0" &amp;&amp; value&lt;"10" ?"valid":"error"'>valid</compute>
  <norm attr=' &apos;   &#x20;&#13;&#xa;&#9;   &apos; '/>
</doc>`;

    const expected = `<doc>
  <text>First line&#xD;
Second line</text>
  <value>2</value>
  <compute>value&gt;"0" &amp;&amp; value&lt;"10" ?"valid":"error"</compute>
  <compute expr="value>&quot;0&quot; &amp;&amp; value&lt;&quot;10&quot; ?&quot;valid&quot;:&quot;error&quot;">valid</compute>
  <norm attr=" '    &#xD;&#xA;&#x9;   ' "></norm>
</doc>`;

    const result = c14nCanonicalize(input);
    expect(result).toEqual(expected);
  });
});
