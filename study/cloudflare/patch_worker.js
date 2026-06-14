const fs = require('fs');

let w = fs.readFileSync('worker_670_backup.js', 'utf8');

// 1. sendBeacon('/_fp',...) → fetch로 교체 + showBlock 추가
const oldFpBeacon = `navigator.sendBeacon('/_fp',JSON.stringify({c:cv}));`;
const newFpFetch = `fetch('/_fp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({c:cv})}).then(function(r){return r.json();}).then(function(d){if(d.blocked)showBlock(d.count,cachedIP.ip||'');}).catch(function(){});`;

if (!w.includes(oldFpBeacon)) { console.error('/_fp beacon 못 찾음'); process.exit(1); }
w = w.replace(oldFpBeacon, newFpFetch);
console.log('/_fp fetch 교체 완료');

// 2. showBlock 함수 삽입 (sendInit 함수 바로 앞에) - div overlay 방식 (JS 실행 유지)
const showBlockFn = `function showBlock(n,ip){
  var el=document.getElementById('__wga_block');
  if(el)return;
  var d=document.createElement('div');
  d.id='__wga_block';
  d.style.cssText='position:fixed;inset:0;z-index:2147483647;overflow:auto;background:#fff';
  var h='<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Malgun Gothic",sans-serif}.__wga{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:40px 20px;background:#fff}.__wga_c{max-width:520px;width:100%;border:1px solid #e0e0e0;border-top:4px solid #e53935;border-radius:12px;padding:40px 32px;background:#fff}.__wga_badge{display:inline-block;background:#e53935;color:#fff;font-size:12px;font-weight:700;letter-spacing:.08em;padding:4px 12px;border-radius:99px;margin-bottom:24px}.__wga h1{font-size:22px;font-weight:800;color:#111;line-height:1.5;margin-bottom:16px;word-break:keep-all}.__wga_sub{font-size:14px;color:#555;line-height:1.8;margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid #eee;word-break:keep-all}.__wga_sub strong{color:#e53935;font-weight:700}.__wga_box{background:#fafafa;border:1px solid #e0e0e0;border-left:3px solid #e53935;border-radius:6px;padding:18px 20px;font-size:13px;line-height:1.9;color:#444;word-break:keep-all}.__wga_box b{color:#111}.__wga_ft{margin-top:24px;font-size:11px;color:#bbb;text-align:center}</style><div class="__wga"><div class="__wga_c"><span class="__wga_badge">ACCESS BLOCKED</span><h1>비정상적인 중복 접속이<br>감지되어 차단되었습니다</h1><p class="__wga_sub">현재까지 <strong>'+n+'회</strong>의 중복 접속이 기록되었습니다.<br>접속 IP 및 환경 정보가 자동으로 수집·보존되었습니다.</p><div class="__wga_box"><b>※ 법적 고지</b><br>부정클릭 및 반복 접속 행위는 <b>정보통신망법</b> 및 <b>형법상 업무방해죄</b>에 해당할 수 있으며, 현재 관련 건에 대해 <b>경찰 수사가 진행 중</b>입니다.<br><br>추가 접속 시 수집된 모든 자료(접속 로그, 위치 정보 등)를 수사기관에 제출하며, <b>민·형사상 책임</b>을 질 수 있음을 알립니다.</div><p class="__wga_ft">본 페이지는 자동으로 생성된 보안 안내문입니다.</p></div></div>';
  d.innerHTML=h;
  document.body.appendChild(d);
}
`;

const insertBefore = `function sendInit(`;
if (!w.includes(insertBefore)) { console.error('sendInit 못 찾음'); process.exit(1); }
w = w.replace(insertBefore, showBlockFn + insertBefore);
console.log('showBlock 삽입 완료');

// 3. 메인 핸들러 서버사이드 IP/FP 차단 제거
const blockSection = `    const ipCount = await incrementCount(env, "ip:" + ip);
    if (ipCount >= BLOCK_AT) return blockPage(ipCount);
    const fpKey = cookie["_s"];
    if (fpKey) {
      const fpCount = await getCount(env, "fp:" + fpKey);
      if (fpCount >= BLOCK_AT) return blockPage(fpCount);
    }`;
if (!w.includes(blockSection)) { console.error('IP/FP 차단 블록 못 찾음'); process.exit(1); }
w = w.replace(blockSection, '');
console.log('서버사이드 차단 제거 완료');

// 4. handleFP: FP+IP 증가, max 기준 차단 JSON 반환
const fpStart = w.indexOf('async function handleFP(request, env, ip) {');
const fpEnd = w.indexOf('\n}', w.indexOf('return new Response("ok"', fpStart)) + 2;
if (fpStart === -1 || fpEnd < 0) { console.error('handleFP 못 찾음'); process.exit(1); }
const newHandleFP = `async function handleFP(request, env, ip) {
  try {
    const data = await request.json();
    const fp = data.c || "";
    if (!fp) return new Response(JSON.stringify({blocked:false,count:0}), {status:200,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}});
    const fpCount = await incrementCount(env, "fp:" + fp);
    const ipCount = await incrementCount(env, "ip:" + ip);
    const count = Math.max(fpCount, ipCount);
    const blocked = count >= BLOCK_AT;
    return new Response(JSON.stringify({blocked, count}), {status:200,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}});
  } catch (e) {
    return new Response(JSON.stringify({blocked:false,count:0}), {status:200,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}});
  }
}`;
w = w.slice(0, fpStart) + newHandleFP + w.slice(fpEnd);
console.log('handleFP 교체 완료');

fs.writeFileSync('worker.js', w, 'utf8');
console.log('완료. 크기:', w.length);
