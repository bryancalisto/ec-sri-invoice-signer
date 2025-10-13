# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript/JavaScript library for signing Ecuadorian SRI (Servicio de Rentas Internas) electronic documents. The library implements XML digital signature generation following XAdES standards without requiring external cryptographic binaries like OpenSSL.

### Supported Document Types

The library supports all major SRI document types with automatic detection:
- **`factura`** - Electronic invoices
- **`notaDebito`** - Debit notes
- **`notaCredito`** - Credit notes
- **`comprobanteRetencion`** - Retention vouchers
- **`guiaRemision`** - Shipping guides

## Architecture

### Core Components

- **`src/signature/signature.ts`**: Main signing logic with document-specific signing functions and generic `signDocumentXml()`
- **`src/canonicalization/c14n.ts`**: XML canonicalization implementation (partial W3C spec)
- **`src/utils/cryptography.ts`**: Cryptographic operations using `node-forge`
- **`src/utils/xml-validator.ts`**: XML validation with comprehensive error handling and document type detection
- **`src/utils/errors.ts`**: Custom error types for different failure scenarios
- **`src/signature/templates/`**: XML template builders for different signature sections
- **`src/utils/xml.ts`**: XML parsing and building utilities using `fast-xml-parser`

### Key Dependencies

- `node-forge`: Pure JavaScript cryptographic operations
- `fast-xml-parser`: XML parsing and building
- `jest`: Testing framework with TypeScript support via `ts-jest`
- `typescript`: TypeScript compiler and type definitions

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
│   ├── canonicalization/        # XML canonicalization
│   ├── signature/              # Core signing logic and templates
│   ├── utils/                  # Cryptography, XML, validation, constants
│   └── index.ts                # Public API exports
├── test/
│   ├── canonicalization/       # Unit tests for c14n
│   ├── signature/              # Unit tests for signing (including new document types)
│   ├── utils/                  # Unit tests for utilities
│   ├── test-utils/             # Test utilities and mocks
│   └── sri-live-test/          # Integration tests with SRI
├── dist/                       # Built JavaScript output
├── package.json                # Project configuration and scripts
├── tsconfig.json               # TypeScript configuration
├── jest.config.js              # Jest testing configuration
└── README.md                   # Project documentation
```

## Public API

### Document-Specific Functions
```typescript
import {
  signInvoiceXml,
  signDebitNoteXml,
  signCreditNoteXml,
  signRetentionVoucherXml,
  signShippingGuideXml
} from 'ec-sri-invoice-signer';
```

### Generic Function with Auto-Detection
```typescript
import { signDocumentXml } from 'ec-sri-invoice-signer';
// Automatically detects document type from XML structure
```

## Important Notes

- **Working Directory**: All npm commands must be run from the `ec-sri-invoice-signer/` subdirectory
- **Timezone**: Tests depend on America/Guayaquil timezone (set in CI)
- **XML Requirements**: The library expects specific XML structure without namespaces, DOCTYPE, or xml-prefixed attributes
- **PKCS12 Support**: Tested with Uanataca, Security Data, and Lazzate certificates
- **Document Type Detection**: The library automatically detects document types from XML root element and validates structure
- **Error Handling**: Comprehensive validation with descriptive error messages for XML structure issues

## Code Patterns

- Uses template pattern for building XML signature sections
- Canonicalization follows W3C XML-C14N spec (partial implementation)
- All cryptographic operations use `node-forge` instead of Node.js crypto module
- XML parsing preserves order and handles special characters
- Error handling uses custom error types from `src/utils/errors.ts`
- Document type validation happens before any signing operations
- Jest mocking for cryptographic operations in unit tests