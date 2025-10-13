import {
  signInvoiceXml,
  signDebitNoteXml,
  signCreditNoteXml,
  signRetentionVoucherXml,
  signShippingGuideXml,
  signPurchaseLiquidationXml
} from './signature/signature';

import {
  generateAccessKey,
  validateAccessKey,
  calculateCheckDigit,
  parseAccessKey,
  type AccessKeyComponents
} from './utils/access-key';

export {
  // Document signing functions
  signInvoiceXml,
  signDebitNoteXml,
  signCreditNoteXml,
  signRetentionVoucherXml,
  signShippingGuideXml,
  signPurchaseLiquidationXml,
  // Access key utilities
  generateAccessKey,
  validateAccessKey,
  calculateCheckDigit,
  parseAccessKey,
  type AccessKeyComponents,
};
