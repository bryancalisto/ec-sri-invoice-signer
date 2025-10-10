#!/bin/bash

# This script generates a RSA private key and its corresponding x509 certificate,
# and embeds them into a pkcs12 formatted file (.p12), used for testing.
#
# Requirements: openssl
#
# Usage: ./createP12.sh [output_dir]
#   output_dir: Optional. Directory where files will be generated. Defaults to current directory.

set -e  # Exit on error

# Get output directory from argument or use current directory
OUTPUT_DIR="${1:-.}"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

echo "Generating RSA private key and X.509 certificate..."
echo "This will create a 4096-bit RSA key valid for 10 years (3650 days)."
echo ""

# Generate RSA private key and self-signed certificate
# -x509: Output a self-signed certificate instead of a certificate request
# -sha256: Use SHA256 for the certificate signature
# -nodes: Don't encrypt the private key (no password)
# -days 3650: Certificate valid for 10 years
# -newkey rsa:4096: Generate a new 4096-bit RSA key
openssl req -x509 -sha256 -nodes -days 3650 -newkey rsa:4096 \
    -keyout "$OUTPUT_DIR/privateKey.pem" \
    -out "$OUTPUT_DIR/certificate.pem"

echo ""
echo "Creating PKCS12 file..."
echo "You will be prompted to enter an export password (can be left empty for testing)."
echo ""

# Create PKCS12 file from private key and certificate
# -export: Create PKCS12 file
# -out: Output file
# -inkey: Private key file
# -in: Certificate file
openssl pkcs12 -export \
    -out "$OUTPUT_DIR/signature.p12" \
    -inkey "$OUTPUT_DIR/privateKey.pem" \
    -in "$OUTPUT_DIR/certificate.pem"

echo ""
echo "✅ PKCS12 file created successfully!"
echo ""
echo "Generated files:"
echo "  - Private key: $OUTPUT_DIR/privateKey.pem"
echo "  - Certificate: $OUTPUT_DIR/certificate.pem"
echo "  - PKCS12 file: $OUTPUT_DIR/signature.p12"
echo ""
echo "⚠️  Note: This is a self-signed certificate for TESTING ONLY."
echo "    Do not use in production. Use a certificate from an authorized provider."
echo ""

# Make files readable only by owner for security
chmod 600 "$OUTPUT_DIR/privateKey.pem"
chmod 600 "$OUTPUT_DIR/signature.p12"
chmod 644 "$OUTPUT_DIR/certificate.pem"

echo "File permissions set:"
echo "  - privateKey.pem and signature.p12: Read/write by owner only (600)"
echo "  - certificate.pem: Read by everyone (644)"
echo ""
