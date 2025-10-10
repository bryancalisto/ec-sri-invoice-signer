# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript/JavaScript library for signing Ecuadorian SRI (Servicio de Rentas Internas) electronic invoices (`factura`) and debit notes (`notaDebito`). The library implements XML digital signature generation following XAdES standards without requiring external cryptographic binaries like OpenSSL.

## Architecture

### Core Components

- **`src/signature/signature.ts`**: Main signing logic with `signInvoiceXml()` and `signDebitNoteXml()` functions
- **`src/canonicalization/c14n.ts`**: XML canonicalization implementation (partial W3C spec)
- **`src/utils/cryptography.ts`**: Cryptographic operations using `node-forge`
- **`src/signature/templates/`**: XML template builders for different signature sections
- **`src/utils/xml.ts`**: XML parsing and building utilities using `fast-xml-parser`

### Key Dependencies

- `node-forge`: Pure JavaScript cryptographic operations
- `fast-xml-parser`: XML parsing and building
- `ts-node`: For running TypeScript files directly

## Development Commands

### Building
```bash
cd ec-sri-invoice-signer
npm run build          # Build TypeScript to JavaScript
npm run build:watch    # Build with watch mode
```

### Testing
```bash
cd ec-sri-invoice-signer
npm test              # Run all unit tests
npm run test:coverage # Run tests with coverage
```

### SRI Live Testing
For testing against actual SRI services (requires configuration):
```bash
cd ec-sri-invoice-signer
npm run test:sri:invoice     # Test invoice signing with SRI
npm run test:sri:debit-note  # Test debit note signing with SRI
```

Configuration files for live testing:
- `test/sri-live-test/invoice/invoice-params.json`
- `test/sri-live-test/debit-note/debit-note-params.json`

## Project Structure

```
ec-sri-invoice-signer/
├── src/
│   ├── canonicalization/     # XML canonicalization
│   ├── signature/           # Core signing logic and templates
│   ├── utils/               # Cryptography, XML, constants
│   └── index.ts             # Public API exports
├── test/
│   ├── canonicalization/    # Unit tests for c14n
│   ├── signature/           # Unit tests for signing
│   ├── utils/               # Unit tests for utilities
│   └── sri-live-test/       # Integration tests with SRI
└── dist/                    # Built JavaScript output
```

## Important Notes

- **Working Directory**: All npm commands must be run from the `ec-sri-invoice-signer/` subdirectory
- **Timezone**: Tests depend on America/Guayaquil timezone (set in CI)
- **XML Requirements**: The library expects specific XML structure without namespaces, DOCTYPE, or xml-prefixed attributes
- **PKCS12 Support**: Tested with Uanataca, Security Data, and Lazzate certificates

## Code Patterns

- Uses template pattern for building XML signature sections
- Canonicalization follows W3C XML-C14N spec (partial implementation)
- All cryptographic operations use `node-forge` instead of Node.js crypto module
- XML parsing preserves order and handles special characters
- Error handling uses custom error types from `src/utils/errors.ts`