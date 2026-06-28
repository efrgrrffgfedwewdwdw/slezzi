/**
 * generate-cert.js
 * Generates a self-signed SSL certificate for local HTTPS development.
 * Run once with:  node generate-cert.js
 *
 * For production use a real cert (e.g. Let's Encrypt / Certbot).
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const sslDir = path.join(__dirname, 'ssl');

if (!fs.existsSync(sslDir)) {
  fs.mkdirSync(sslDir);
  console.log('Created ssl/ directory');
}

const keyPath  = path.join(sslDir, 'key.pem');
const certPath = path.join(sslDir, 'cert.pem');

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  console.log('✔ SSL certs already exist in ssl/');
  console.log('  Delete ssl/key.pem and ssl/cert.pem to regenerate.');
  process.exit(0);
}

console.log('Generating self-signed SSL certificate...');
console.log('(requires OpenSSL to be installed)\n');

try {
  execSync(
    `openssl req -x509 -newkey rsa:4096 -keyout "${keyPath}" -out "${certPath}" ` +
    `-days 365 -nodes -subj "/CN=localhost/O=Slezzi/C=DE"`,
    { stdio: 'inherit' }
  );
  console.log('\n✔ Done! Certificates saved to ssl/');
  console.log('  key.pem  →', keyPath);
  console.log('  cert.pem →', certPath);
  console.log('\nStart the server with:  npm start');
  console.log('Then open:              https://localhost:443');
  console.log('\nNote: Your browser will show a security warning for self-signed certs.');
  console.log('      Click "Advanced" → "Proceed" to continue.');
  console.log('      For production, replace these files with a real Let\'s Encrypt cert.');
} catch (err) {
  console.error('\n✗ OpenSSL not found or failed.');
  console.error('  Install OpenSSL: https://slproweb.com/products/Win32OpenSSL.html');
  console.error('\nAlternatively, the server will run on HTTP (port 3000) without certs.');
}
