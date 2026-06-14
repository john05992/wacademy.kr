const fs = require('fs');
let w = fs.readFileSync('worker.js', 'utf8');

// 1. blockPage 함수 교체 (git 버전은 return new Response(html, 로 끝남)
const start = w.indexOf('function blockPage(');
const htmlIdx = w.indexOf('return new Response(html,', start);
const end = w.indexOf('\n}', htmlIdx) + 2;
if (start === -1 || htmlIdx === -1 || end < 2) { console.error('blockPage 못 찾음'); process.exit(1); }

const newFn = `function blockPage(n, ip) {
  // IP 기반 참조번호 생성 (FNV-32)
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < ip.length; i++) { h ^= ip.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  const ref = 'WGA-' + h.toString(16).toUpperCase().padStart(8, '0');

  const base = \`*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Apple SD Gothic Neo","Malgun Gothic",sans-serif;background:#070707;color:#999;min-height:100vh}.bar{height:4px}.wrap{max-width:600px;margin:0 auto;padding:72px 36px 96px}.brand{font-size:12px;letter-spacing:.28em;color:#2a2a2a;text-transform:uppercase;margin-bottom:56px}.sig{display:flex;align-items:center;gap:10px;margin-bottom:32px}.dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}.slbl{font-size:13px;letter-spacing:.18em;font-weight:700;text-transform:uppercase}.big-num{font-size:88px;font-weight:900;line-height:1;letter-spacing:-5px;margin-bottom:8px}.big-label{font-size:13px;letter-spacing:.1em;color:#2e2e2e;margin-bottom:40px}h1{font-size:24px;font-weight:800;color:#efefef;line-height:1.6;word-break:keep-all;letter-spacing:-.02em;margin-bottom:36px}.rule{border:none;border-top:1px solid #111;margin:30px 0}.grid{display:grid;grid-template-columns:auto 1fr;gap:13px 36px;margin-bottom:6px}.lbl{font-size:14px;color:#323232;white-space:nowrap}.val{font-size:14px;color:#777}.body{font-size:16px;line-height:2;color:#5a5a5a;word-break:keep-all}.body b{color:#8c8c8c}.body em{font-style:normal}.ref{margin-top:48px;font-size:10px;color:#1e1e1e;letter-spacing:.08em}@keyframes blink{0%,100%{opacity:1}50%{opacity:.12}}.ip-wrap{background:#0c0c0c;border:1px solid #181818;border-left:3px solid #c42020;padding:20px 24px;margin:24px 0 34px}.ip-label{font-size:11px;letter-spacing:.22em;color:#3a1a1a;text-transform:uppercase;margin-bottom:10px}.ip-val{font-size:24px;font-weight:700;color:#e03030;font-family:"Courier New",monospace;letter-spacing:.04em;word-break:break-all}.leak{border-left:2px solid #5a1010;padding:16px 22px;margin:26px 0;background:rgba(80,14,14,.07)}.leak p{font-size:16px;font-weight:600;color:#a03535;line-height:1.7;word-break:keep-all}.leak small{display:block;margin-top:8px;font-size:14px;color:#5e2a2a}.contact{margin-top:16px;font-size:14px;color:#3d3d3d}.tag{display:inline-block;margin-top:18px;font-size:12px;color:#6e2020;border:1px solid #331010;padding:5px 16px;letter-spacing:.06em}@media(max-width:520px){.wrap{padding:48px 24px 72px}.big-num{font-size:64px}.big-label{margin-bottom:28px}h1{font-size:20px;margin-bottom:28px}.body{font-size:15px}.grid{gap:12px 24px}.ip-val{font-size:20px}}\`;

  if (n < 10) {
    return new Response(
      \`<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>접속 차단</title><style>\${base}.bar{background:#b85010}.dot{background:#c85c14}.slbl{color:#c85c14}.big-num{color:#c85c14}.big-label{color:#3a2010}.body em{color:#c85c14}</style></head><body><div class="bar"></div><div class="wrap"><p class="brand">WACADEMY &middot; Security</p><div class="sig"><div class="dot"></div><span class="slbl">Access Blocked</span></div><div class="big-num">\${n}</div><div class="big-label">회 중복 접속 감지</div><h1>비정상적인 중복 접속이 감지되어<br>차단되었습니다</h1><hr class="rule"><div class="grid"><span class="lbl">접속 횟수</span><span class="val">\${n}회 감지</span><span class="lbl">수집 상태</span><span class="val">접속 로그 · 위치 정보 보존 완료</span><span class="lbl">조치 현황</span><span class="val">수사기관 자료 제출 준비 중</span></div><hr class="rule"><div class="body">현재까지 <b>\${n}회</b>의 중복 접속이 기록되었습니다. 접속 IP 주소, 위치 정보 등 모든 정보가 자동으로 수집·보존되고 있습니다. 지속적인 접속 시 <em>즉시 수사기관에 고발</em>됩니다.<br><br>부정클릭 및 반복 접속 행위는 <b>정보통신망법</b> 및 <b>형법상 업무방해죄</b>에 해당하며, 현재 관련 건에 대해 <em>경찰 수사가 진행 중</em>입니다. 추가 접속이 감지될 경우 수집된 모든 자료(접속 로그, 실시간 위치 정보 포함)를 즉각 수사기관에 제출하며, <b>민·형사상 모든 책임</b>을 묻겠습니다.</div><div class="ref">\${ref}</div></div></body></html>\`,
      {status: 200, headers: {'Content-Type': 'text/html;charset=UTF-8'}}
    );
  } else {
    const blocked = n - BLOCK_AT;
    return new Response(
      \`<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>수사 진행 안내</title><style>\${base}.bar{background:#8a1010}.dot{background:#ff3030;box-shadow:0 0 12px rgba(255,48,48,.55);animation:blink 1.2s ease-in-out infinite}.slbl{color:#ff3535}.big-num{color:#e02020}.big-label{color:#3a1010}.body em{color:#ff4040}</style></head><body><div class="bar"></div><div class="wrap"><p class="brand">WACADEMY &middot; 수사 진행 중</p><div class="sig"><div class="dot"></div><span class="slbl">Critical &mdash; 법적 조치 진행 중</span></div><div class="big-num">\${n}</div><div class="big-label">회 접속 시도 &mdash; 차단 후 \${blocked}회 재시도</div><h1>우회하신 VPN·프록시 기업체명 및<br>로컬 정보 유출 총 3건 감지됨</h1><hr class="rule"><div class="ip-wrap"><div class="ip-label">감지된 접속 IP</div><div class="ip-val">\${ip}</div></div><div class="grid"><span class="lbl">수집 상태</span><span class="val">접속 로그 · 위치 정보 수집 완료</span><span class="lbl">마우스 패턴</span><span class="val" style="color:#963030">자동화 감지 — OS 단위 실제 입력 없음</span></div><hr class="rule"><div class="body">본 페이지가 차단된 이후에도 <b>\${blocked}회</b>의 추가 접속 시도가 기록되었습니다. 해당 행위는 고의적 반복 접속으로 판단되며, 현재 <em>법적 조치가 진행 중</em>입니다.<br><br>귀하는 명시적 차단 경고를 인지한 상태에서 지속적으로 접속을 시도하였습니다. 이는 <b>정보통신망법 제48조 위반</b> 및 <b>형법상 업무방해죄</b>에 해당하며, 단순 과실이 아닌 <b>고의적 불법 행위</b>로 간주됩니다.</div><div class="leak"><p>귀하가 사용한 우회 수단의 오류로 인해 실제 로컬 네트워크 정보가 외부 유출되었습니다</p><small>귀하의 실수로 인한 것이며, 해당 정보는 이미 수집 완료되었습니다.</small></div><div class="body">수집된 모든 자료는 현재 수사기관에 제출 준비 중이며, <b>민·형사상 책임</b>을 피할 수 없습니다.</div><span class="tag">VPN·프록시 외 3건 감지됨</span><p class="contact">귀하께 연락드리겠습니다. 감사합니다.</p><div class="ref">\${ref}</div></div></body></html>\`,
      {status: 200, headers: {'Content-Type': 'text/html;charset=UTF-8'}}
    );
  }
}`;

w = w.slice(0, start) + newFn + w.slice(end);

// 2. call site 업데이트: blockPage(ipCount) → blockPage(ipCount, ip)
w = w.replace(/return blockPage\(ipCount\)/g, 'return blockPage(ipCount, ip)');
w = w.replace(/return blockPage\(fpCount\)/g, 'return blockPage(fpCount, ip)');

fs.writeFileSync('worker.js', w, 'utf8');
console.log('완료');
