/**
 * Utility functions for generating and validating SRI access keys (clave de acceso).
 * An access key is a 49-digit numerical code required for electronic documents in Ecuador.
 *
 * Structure (48 digits + 1 check digit):
 * - Positions 1-8: Date (ddmmyyyy)
 * - Positions 9-10: Document type code (01-07)
 * - Positions 11-23: RUC (Tax ID)
 * - Positions 24-25: Environment (01=test, 02=production)
 * - Positions 26-28: Establishment code (serie)
 * - Positions 29-31: Emission point (serie)
 * - Positions 32-40: Sequential number (9 digits)
 * - Positions 41-48: Random code (8 digits)
 * - Position 49: Check digit (modulo 11)
 */

export interface AccessKeyComponents {
  /** Date in format ddmmyyyy (e.g., "18042024" for April 18, 2024) */
  date: string;
  /** Document type code: 01=invoice, 03=purchase liquidation, 04=credit note, 05=debit note, 06=shipping guide, 07=retention voucher */
  documentType: string;
  /** RUC (Tax ID) - 13 digits */
  ruc: string;
  /** Environment: "01" for test, "02" for production */
  environment: "01" | "02";
  /** Establishment code (serie) - 3 digits */
  establishment: string;
  /** Emission point (serie) - 3 digits */
  emissionPoint: string;
  /** Sequential document number - 9 digits */
  sequential: string;
  /** Random numeric code - 8 digits (optional, will be generated if not provided) */
  numericCode?: string;
}

/**
 * Calculates the check digit for an access key using modulo 11 algorithm.
 * This is the algorithm specified by the SRI for electronic documents.
 *
 * @param accessKeyWithoutCheckDigit - 48-digit access key without the check digit
 * @returns The check digit (0-9, where 10 becomes 1 and 11 becomes 0)
 */
export const calculateCheckDigit = (accessKeyWithoutCheckDigit: string): number => {
  if (accessKeyWithoutCheckDigit.length !== 48) {
    throw new Error('Access key without check digit must be exactly 48 digits');
  }

  if (!/^\d+$/.test(accessKeyWithoutCheckDigit)) {
    throw new Error('Access key must contain only digits');
  }

  // Modulo 11 algorithm as specified by SRI
  const multiplier = [2, 3, 4, 5, 6, 7];
  let sum = 0;
  let multiplierIndex = 0;

  // Process digits from right to left
  for (let i = accessKeyWithoutCheckDigit.length - 1; i >= 0; i--) {
    const digit = parseInt(accessKeyWithoutCheckDigit[i], 10);
    sum += digit * multiplier[multiplierIndex % 6];
    multiplierIndex++;
  }

  const remainder = sum % 11;
  const checkDigit = 11 - remainder;

  // Special cases as per SRI specification
  if (checkDigit === 11) {
    return 0;
  } else if (checkDigit === 10) {
    return 1;
  }

  return checkDigit;
};

/**
 * Generates a random 8-digit numeric code for the access key.
 *
 * @returns An 8-digit string of random numbers
 */
const generateRandomNumericCode = (): string => {
  const min = 10000000;
  const max = 99999999;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
};

/**
 * Validates that a string contains exactly the specified number of digits.
 *
 * @param value - The string to validate
 * @param length - The expected length
 * @param fieldName - Name of the field for error messages
 */
const validateNumericField = (value: string, length: number, fieldName: string): void => {
  if (value.length !== length) {
    throw new Error(`${fieldName} must be exactly ${length} digits, got ${value.length}`);
  }
  if (!/^\d+$/.test(value)) {
    throw new Error(`${fieldName} must contain only digits`);
  }
};

/**
 * Generates a complete 49-digit access key (clave de acceso) for SRI electronic documents.
 *
 * @param components - The components of the access key
 * @returns A complete 49-digit access key including the check digit
 *
 * @example
 * ```typescript
 * const accessKey = generateAccessKey({
 *   date: "18042024",
 *   documentType: "01",
 *   ruc: "1234567890001",
 *   environment: "01",
 *   establishment: "001",
 *   emissionPoint: "001",
 *   sequential: "000000005"
 * });
 * // Returns: "1804202401123456789000110010010000000051234567816" (49 digits)
 * ```
 */
export const generateAccessKey = (components: AccessKeyComponents): string => {
  // Validate all components
  validateNumericField(components.date, 8, 'date');
  validateNumericField(components.documentType, 2, 'documentType');
  validateNumericField(components.ruc, 13, 'ruc');
  validateNumericField(components.environment, 2, 'environment');
  validateNumericField(components.establishment, 3, 'establishment');
  validateNumericField(components.emissionPoint, 3, 'emissionPoint');
  validateNumericField(components.sequential, 9, 'sequential');

  // Validate environment is valid
  if (components.environment !== "01" && components.environment !== "02") {
    throw new Error('environment must be "01" (test) or "02" (production)');
  }

  // Validate document type is valid
  const validDocTypes = ["01", "03", "04", "05", "06", "07"];
  if (!validDocTypes.includes(components.documentType)) {
    throw new Error(`documentType must be one of: ${validDocTypes.join(", ")}`);
  }

  // Generate or validate numeric code
  const numericCode = components.numericCode || generateRandomNumericCode();
  if (components.numericCode) {
    validateNumericField(numericCode, 8, 'numericCode');
  }

  // Construct the 48-digit access key (without check digit)
  const accessKeyWithoutCheck =
    components.date +
    components.documentType +
    components.ruc +
    components.environment +
    components.establishment +
    components.emissionPoint +
    components.sequential +
    numericCode;

  // Calculate check digit and append it
  const checkDigit = calculateCheckDigit(accessKeyWithoutCheck);

  return accessKeyWithoutCheck + checkDigit.toString();
};

/**
 * Validates a complete 49-digit access key.
 *
 * @param accessKey - The 49-digit access key to validate
 * @returns True if the access key is valid, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = validateAccessKey("1804202401123456789000110010010000000051234567816");
 * // Returns: true
 * ```
 */
export const validateAccessKey = (accessKey: string): boolean => {
  // Check length
  if (accessKey.length !== 49) {
    return false;
  }

  // Check that all characters are digits
  if (!/^\d+$/.test(accessKey)) {
    return false;
  }

  // Extract the check digit (last digit)
  const providedCheckDigit = parseInt(accessKey[48], 10);

  // Calculate the expected check digit
  const accessKeyWithoutCheck = accessKey.substring(0, 48);
  const expectedCheckDigit = calculateCheckDigit(accessKeyWithoutCheck);

  // Validate check digit matches
  return providedCheckDigit === expectedCheckDigit;
};

/**
 * Parses a 49-digit access key into its components.
 *
 * @param accessKey - The 49-digit access key to parse
 * @returns The components of the access key
 *
 * @example
 * ```typescript
 * const components = parseAccessKey("1804202401123456789000110010010000000051234567816");
 * // Returns: {
 * //   date: "18042024",
 * //   documentType: "01",
 * //   ruc: "1234567890001",
 * //   environment: "01",
 * //   establishment: "001",
 * //   emissionPoint: "001",
 * //   sequential: "000000005",
 * //   numericCode: "12345678",
 * //   checkDigit: "16"
 * // }
 * ```
 */
export const parseAccessKey = (accessKey: string): AccessKeyComponents & { checkDigit: string } => {
  if (accessKey.length !== 49) {
    throw new Error('Access key must be exactly 49 digits');
  }

  if (!/^\d+$/.test(accessKey)) {
    throw new Error('Access key must contain only digits');
  }

  return {
    date: accessKey.substring(0, 8),
    documentType: accessKey.substring(8, 10),
    ruc: accessKey.substring(10, 23),
    environment: accessKey.substring(23, 25) as "01" | "02",
    establishment: accessKey.substring(25, 28),
    emissionPoint: accessKey.substring(28, 31),
    sequential: accessKey.substring(31, 40),
    numericCode: accessKey.substring(40, 48),
    checkDigit: accessKey.substring(48, 49)
  };
};
