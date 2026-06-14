const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');

const rawPath = 'C:\\Users\\tlsdy\\AppData\\Local\\Temp\\tracking_raw2.js';
const obfPath = 'C:\\Users\\tlsdy\\AppData\\Local\\Temp\\tracking_obf3.js';
const workerPath = 'worker.js';

// 1. 난독화
const raw = fs.readFileSync(rawPath, 'utf8');
const result = JavaScriptObfuscator.obfuscate(raw, {
  compact: true,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  debugProtection: false,
  disableConsoleOutput: false,
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: false,
  renameGlobals: false,
  selfDefending: false,
  simplify: true,
  splitStrings: false,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayEncoding: ['rc4'],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 2,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 4,
  stringArrayWrappersType: 'function',
  stringArrayThreshold: 0.75,
  transformObjectKeys: true,
  unicodeEscapeSequence: false
});

const obf = result.getObfuscatedCode();
fs.writeFileSync(obfPath, obf, 'utf8');
console.log('난독화 완료. 크기:', obf.length, 'bytes');

// 2. worker.js에 주입
let w = fs.readFileSync(workerPath, 'utf8');
const start = w.indexOf('// \u2500\u2500 \ucd94\uC801 JS \u2500\u2500');
const end   = w.indexOf('// \u2500\u2500 Worker \uBA54\uC778');
if (start === -1 || end === -1) { console.error('마커 못 찾음'); process.exit(1); }

const newSection =
`// \u2500\u2500 \ucd94\uC801 JS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const TRACKING_JS = \`window.__WS='\${SHEETS}';window.__WF='\${FP_PATH}';\` + ${JSON.stringify(obf)};

`;

w = w.slice(0, start) + newSection + w.slice(end);
fs.writeFileSync(workerPath, w, 'utf8');
console.log('주입 완료. worker.js 크기:', w.length, 'bytes');
