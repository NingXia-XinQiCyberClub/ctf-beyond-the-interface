const fs = require('fs');
const {PNG} = require('./qa-tools/node_modules/pngjs');
const jsQR = require('./qa-tools/node_modules/jsqr');
const path = process.argv[2];
const png = PNG.sync.read(fs.readFileSync(path));
const result = jsQR(new Uint8ClampedArray(png.data), png.width, png.height, {inversionAttempts: 'dontInvert'});
if (!result) throw new Error('QR code could not be decoded from frame');
if (result.data !== 'https://github.com/NingXia-XinQiCyberClub') throw new Error('Unexpected QR destination');
console.log('QR decoded correctly: ' + result.data);
