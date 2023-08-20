const XmlProperties = {
  namespaces: {
    ds: 'http://www.w3.org/2000/09/xmldsig#',
    etsi: 'http://uri.etsi.org/01903/v1.3.2#'
  },
  algorithms: {
    canonicalization: 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
    digest: 'http://www.w3.org/2000/09/xmldsig#sha1',
    signature: 'http://www.w3.org/2000/09/xmldsig#rsa-sha1',
    transform: 'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
  },
  types: {
    signedProperties: 'http://uri.etsi.org/01903#SignedProperties'
  }
};

export {
  XmlProperties
}