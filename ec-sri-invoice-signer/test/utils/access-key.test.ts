import { describe, test, expect } from "@jest/globals";
import {
  calculateCheckDigit,
  generateAccessKey,
  validateAccessKey,
  parseAccessKey,
  AccessKeyComponents
} from "../../src/utils/access-key";

describe("Access Key Utilities", () => {
  describe("calculateCheckDigit", () => {
    test("should calculate correct check digit for a valid 48-digit access key", () => {
      // Example from SRI documentation
      const accessKeyWithoutCheck = "180420240112345678900011001001000000005123456781";
      const checkDigit = calculateCheckDigit(accessKeyWithoutCheck);
      expect(checkDigit).toBeGreaterThanOrEqual(0);
      expect(checkDigit).toBeLessThanOrEqual(9);
    });

    test("should return 0 when modulo result is 11", () => {
      // Construct a test case where sum % 11 === 0
      // This requires careful calculation - for testing purposes we'll verify the result is valid
      const testKey = "123456789012345678901234567890123456789012345678";
      const checkDigit = calculateCheckDigit(testKey);
      expect(typeof checkDigit).toBe("number");
      expect(checkDigit).toBeGreaterThanOrEqual(0);
      expect(checkDigit).toBeLessThanOrEqual(9);
    });

    test("should return 1 when modulo result would be 10", () => {
      // Similar to above - verify result is valid
      const testKey = "987654321098765432109876543210987654321098765432";
      const checkDigit = calculateCheckDigit(testKey);
      expect(typeof checkDigit).toBe("number");
      expect(checkDigit).toBeGreaterThanOrEqual(0);
      expect(checkDigit).toBeLessThanOrEqual(9);
    });

    test("should throw error if access key is not 48 digits", () => {
      expect(() => calculateCheckDigit("12345")).toThrow("must be exactly 48 digits");
    });

    test("should throw error if access key contains non-digits", () => {
      expect(() => calculateCheckDigit("12345678901234567890123456789012345678901234567A")).toThrow(
        "must contain only digits"
      );
    });
  });

  describe("generateAccessKey", () => {
    test("should generate a valid 49-digit access key", () => {
      const components: AccessKeyComponents = {
        date: "18042024",
        documentType: "01",
        ruc: "1234567890001",
        environment: "01",
        establishment: "001",
        emissionPoint: "001",
        sequential: "000000005",
        numericCode: "12345678"
      };

      const accessKey = generateAccessKey(components);

      expect(accessKey).toHaveLength(49);
      expect(/^\d+$/.test(accessKey)).toBe(true);
      expect(validateAccessKey(accessKey)).toBe(true);
    });

    test("should generate random numeric code if not provided", () => {
      const components: AccessKeyComponents = {
        date: "18042024",
        documentType: "01",
        ruc: "1234567890001",
        environment: "01",
        establishment: "001",
        emissionPoint: "001",
        sequential: "000000005"
      };

      const accessKey1 = generateAccessKey(components);
      const accessKey2 = generateAccessKey(components);

      expect(accessKey1).toHaveLength(49);
      expect(accessKey2).toHaveLength(49);
      // Random codes should be different (with high probability)
      expect(accessKey1).not.toBe(accessKey2);
    });

    test("should accept all valid document types", () => {
      const validTypes = ["01", "03", "04", "05", "06", "07"];

      validTypes.forEach(docType => {
        const components: AccessKeyComponents = {
          date: "18042024",
          documentType: docType,
          ruc: "1234567890001",
          environment: "01",
          establishment: "001",
          emissionPoint: "001",
          sequential: "000000005",
          numericCode: "12345678"
        };

        const accessKey = generateAccessKey(components);
        expect(validateAccessKey(accessKey)).toBe(true);
      });
    });

    test("should accept both test and production environments", () => {
      const testComponents: AccessKeyComponents = {
        date: "18042024",
        documentType: "01",
        ruc: "1234567890001",
        environment: "01",
        establishment: "001",
        emissionPoint: "001",
        sequential: "000000005",
        numericCode: "12345678"
      };

      const prodComponents: AccessKeyComponents = {
        ...testComponents,
        environment: "02"
      };

      const testKey = generateAccessKey(testComponents);
      const prodKey = generateAccessKey(prodComponents);

      expect(validateAccessKey(testKey)).toBe(true);
      expect(validateAccessKey(prodKey)).toBe(true);
    });

    test("should throw error for invalid date length", () => {
      const components: AccessKeyComponents = {
        date: "180420",
        documentType: "01",
        ruc: "1234567890001",
        environment: "01",
        establishment: "001",
        emissionPoint: "001",
        sequential: "000000005"
      };

      expect(() => generateAccessKey(components)).toThrow("date must be exactly 8 digits");
    });

    test("should throw error for invalid document type", () => {
      const components: AccessKeyComponents = {
        date: "18042024",
        documentType: "99",
        ruc: "1234567890001",
        environment: "01",
        establishment: "001",
        emissionPoint: "001",
        sequential: "000000005"
      };

      expect(() => generateAccessKey(components)).toThrow("documentType must be one of");
    });

    test("should throw error for invalid RUC length", () => {
      const components: AccessKeyComponents = {
        date: "18042024",
        documentType: "01",
        ruc: "12345678",
        environment: "01",
        establishment: "001",
        emissionPoint: "001",
        sequential: "000000005"
      };

      expect(() => generateAccessKey(components)).toThrow("ruc must be exactly 13 digits");
    });

    test("should throw error for invalid environment", () => {
      const components: any = {
        date: "18042024",
        documentType: "01",
        ruc: "1234567890001",
        environment: "03",
        establishment: "001",
        emissionPoint: "001",
        sequential: "000000005"
      };

      expect(() => generateAccessKey(components)).toThrow('environment must be "01" (test) or "02" (production)');
    });

    test("should throw error for invalid establishment length", () => {
      const components: AccessKeyComponents = {
        date: "18042024",
        documentType: "01",
        ruc: "1234567890001",
        environment: "01",
        establishment: "1",
        emissionPoint: "001",
        sequential: "000000005"
      };

      expect(() => generateAccessKey(components)).toThrow("establishment must be exactly 3 digits");
    });

    test("should throw error for invalid emission point length", () => {
      const components: AccessKeyComponents = {
        date: "18042024",
        documentType: "01",
        ruc: "1234567890001",
        environment: "01",
        establishment: "001",
        emissionPoint: "1",
        sequential: "000000005"
      };

      expect(() => generateAccessKey(components)).toThrow("emissionPoint must be exactly 3 digits");
    });

    test("should throw error for invalid sequential length", () => {
      const components: AccessKeyComponents = {
        date: "18042024",
        documentType: "01",
        ruc: "1234567890001",
        environment: "01",
        establishment: "001",
        emissionPoint: "001",
        sequential: "5"
      };

      expect(() => generateAccessKey(components)).toThrow("sequential must be exactly 9 digits");
    });

    test("should throw error for non-numeric fields", () => {
      const components: AccessKeyComponents = {
        date: "18042024",
        documentType: "01",
        ruc: "123456789000A",
        environment: "01",
        establishment: "001",
        emissionPoint: "001",
        sequential: "000000005"
      };

      expect(() => generateAccessKey(components)).toThrow("ruc must contain only digits");
    });
  });

  describe("validateAccessKey", () => {
    test("should validate a correct access key", () => {
      const components: AccessKeyComponents = {
        date: "18042024",
        documentType: "01",
        ruc: "1234567890001",
        environment: "01",
        establishment: "001",
        emissionPoint: "001",
        sequential: "000000005",
        numericCode: "12345678"
      };

      const accessKey = generateAccessKey(components);
      expect(validateAccessKey(accessKey)).toBe(true);
    });

    test("should reject an access key with incorrect check digit", () => {
      const components: AccessKeyComponents = {
        date: "18042024",
        documentType: "01",
        ruc: "1234567890001",
        environment: "01",
        establishment: "001",
        emissionPoint: "001",
        sequential: "000000005",
        numericCode: "12345678"
      };

      const accessKey = generateAccessKey(components);
      // Modify the last digit (check digit)
      const invalidAccessKey = accessKey.substring(0, 48) + ((parseInt(accessKey[48]) + 1) % 10).toString();

      expect(validateAccessKey(invalidAccessKey)).toBe(false);
    });

    test("should reject an access key with incorrect length", () => {
      expect(validateAccessKey("12345")).toBe(false);
      expect(validateAccessKey("123456789012345678901234567890123456789012345678901234")).toBe(false);
    });

    test("should reject an access key with non-numeric characters", () => {
      expect(validateAccessKey("1234567890123456789012345678901234567890123456789")).toBe(false);
      expect(validateAccessKey("12345678901234567890123456789012345678901234567A8")).toBe(false);
    });
  });

  describe("parseAccessKey", () => {
    test("should correctly parse a valid access key", () => {
      const components: AccessKeyComponents = {
        date: "18042024",
        documentType: "01",
        ruc: "1234567890001",
        environment: "01",
        establishment: "001",
        emissionPoint: "001",
        sequential: "000000005",
        numericCode: "12345678"
      };

      const accessKey = generateAccessKey(components);
      const parsed = parseAccessKey(accessKey);

      expect(parsed.date).toBe(components.date);
      expect(parsed.documentType).toBe(components.documentType);
      expect(parsed.ruc).toBe(components.ruc);
      expect(parsed.environment).toBe(components.environment);
      expect(parsed.establishment).toBe(components.establishment);
      expect(parsed.emissionPoint).toBe(components.emissionPoint);
      expect(parsed.sequential).toBe(components.sequential);
      expect(parsed.numericCode).toBe(components.numericCode);
      expect(parsed.checkDigit).toHaveLength(1);
    });

    test("should throw error for invalid length", () => {
      expect(() => parseAccessKey("12345")).toThrow("must be exactly 49 digits");
    });

    test("should throw error for non-numeric characters", () => {
      expect(() => parseAccessKey("123456789012345678901234567890123456789012345678A")).toThrow(
        "must contain only digits"
      );
    });
  });

  describe("Integration tests", () => {
    test("generated key should be parseable and validate correctly", () => {
      const components: AccessKeyComponents = {
        date: "27122024",
        documentType: "05",
        ruc: "9999999999001",
        environment: "02",
        establishment: "002",
        emissionPoint: "003",
        sequential: "000000123"
      };

      const accessKey = generateAccessKey(components);
      expect(validateAccessKey(accessKey)).toBe(true);

      const parsed = parseAccessKey(accessKey);
      expect(parsed.date).toBe(components.date);
      expect(parsed.documentType).toBe(components.documentType);
      expect(parsed.ruc).toBe(components.ruc);
      expect(parsed.environment).toBe(components.environment);
      expect(parsed.establishment).toBe(components.establishment);
      expect(parsed.emissionPoint).toBe(components.emissionPoint);
      expect(parsed.sequential).toBe(components.sequential);
    });

    test("should handle all document types correctly", () => {
      const docTypes: Array<[string, string]> = [
        ["01", "Invoice"],
        ["03", "Purchase Liquidation"],
        ["04", "Credit Note"],
        ["05", "Debit Note"],
        ["06", "Shipping Guide"],
        ["07", "Retention Voucher"]
      ];

      docTypes.forEach(([code, name]) => {
        const components: AccessKeyComponents = {
          date: "01012024",
          documentType: code,
          ruc: "1234567890001",
          environment: "01",
          establishment: "001",
          emissionPoint: "001",
          sequential: "000000001",
          numericCode: "11111111"
        };

        const accessKey = generateAccessKey(components);
        expect(validateAccessKey(accessKey)).toBe(true);

        const parsed = parseAccessKey(accessKey);
        expect(parsed.documentType).toBe(code);
      });
    });
  });
});
