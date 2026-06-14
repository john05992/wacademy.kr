const fs = require('fs');

const rawPath = 'C:\\Users\\tlsdy\\AppData\\Local\\Temp\\tracking_raw2.js';
const workerPath = 'worker.js';

const raw = fs.readFileSync(rawPath, 'utf8').trim();
let w = fs.readFileSync(workerPath, 'utf8');

const start = w.indexOf('// \u2500\u2500 \ucd94\uC801 JS \u2500\u2500');
const end   = w.indexOf('// \u2500\u2500 Worker \uBA54\uC778');

if (start === -1 || end === -1) { console.error('마커 못 찾음'); process.exit(1); }

const newSection =
`// \u2500\u2500 \ucd94\uC801 JS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
const TRACKING_JS = \`window.__WS='\${SHEETS}';window.__WF='\${FP_PATH}';\` + ${JSON.stringify(raw)};

`;

w = w.slice(0, start) + newSection + w.slice(end);
fs.writeFileSync(workerPath, w, 'utf8');
console.log('완료. 길이:', w.length);
