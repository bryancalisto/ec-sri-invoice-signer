# This generates a RSA private key and it's corresponding x509 certificate, and embedds them into a pkcs12 formated file (.p12),
# used for testing.
openssl req -x509 -sha256 -nodes -days 3650 -newkey rsa:4096 -keyout privateKey.pem -out certificate.pem
openssl pkcs12 -export -out signature.p12 -inkey privateKey.pem -in certificate.pem