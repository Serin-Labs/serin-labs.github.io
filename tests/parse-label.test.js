// Run: node tests/parse-label.test.js
const assert = require('assert');
const { parseLabelPayload } = require('../assets/js/qr-scan.js');

// Real payloads decoded from Mitsubishi nameplate QR codes
assert.strictEqual(parseLabelPayload('MSZ-FH12NA            8906672 T'), 'MSZ-FH12NA');
assert.strictEqual(parseLabelPayload('MSZ-GL09NA-U1         18E18169 '), 'MSZ-GL09NA-U1');

// Normalization: case + stray whitespace
assert.strictEqual(parseLabelPayload('  msz-gl06na  1234567 '), 'MSZ-GL06NA');

// Rejections: not model-shaped
assert.strictEqual(parseLabelPayload(''), null);
assert.strictEqual(parseLabelPayload('   '), null);
assert.strictEqual(parseLabelPayload(null), null);
assert.strictEqual(parseLabelPayload('8906672 T'), null);                 // serial-first payload
assert.strictEqual(parseLabelPayload('18E18169'), null);                  // digit-led serial
assert.strictEqual(parseLabelPayload('https://example.com/x?y=1'), null); // URL payload
assert.strictEqual(parseLabelPayload('PET'), null);                       // too short, no digit
assert.strictEqual(parseLabelPayload('MITSUBISHI'), null);                // letters only, no digit

// Parser → checker integration: QR payloads (including the trim suffix the
// printed label abbreviates) must land on the expected checker verdicts.
const { checkModel } = require('../assets/js/model-checker.js');
assert.strictEqual(checkModel(parseLabelPayload('MSZ-GL09NA-U1         18E18169 ')).tone, 'success');
assert.strictEqual(checkModel(parseLabelPayload('MSZ-FH12NA            8906672 T')).id, 'wall-confirmed');

console.log('parse-label: all assertions passed');
