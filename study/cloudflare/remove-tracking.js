// 모든 HTML 파일에서 추적 스크립트 블록 제거
// 실행: node cloudflare/remove-tracking.js

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

let count = 0;

// CRLF/LF 둘 다 처리하는 정규식
const PATTERN = /<script>\r?\n\(function\(\)\{\r?\n\s*var SHEETS\s*=[\s\S]*?\}\)\(\);\r?\n<\/script>/;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'cloudflare' || entry.name === '.git') continue;
      walk(full);
    } else if (entry.name === 'index.html') {
      let html = fs.readFileSync(full, 'utf8');
      if (!PATTERN.test(html)) continue;
      html = html.replace(PATTERN, '');
      fs.writeFileSync(full, html, 'utf8');
      count++;
      console.log('✓', path.relative(ROOT, full));
    }
  }
}

walk(ROOT);
console.log(`\n완료: ${count}개 파일에서 추적 스크립트 제거됨`);
