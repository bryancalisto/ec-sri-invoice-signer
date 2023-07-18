import { signInvoiceXml } from './signature/signature';

export {
  signInvoiceXml
};

/**
 * TODO:
 * - Check signature correctness: Use a real p12, sign an invoice and compare the result with the already verified signature.
 * - Finish test of signInvoice function.
 * - Make sure the package can be used in other apps (exported correctly).
 * - Make sure the types are working fine on client code.
 * - Add jsdocs to functions.
 */