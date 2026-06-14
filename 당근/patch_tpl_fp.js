const fs = require('fs');
const path = require('path');

const dangunDir = 'C:/Users/tlsdy/OneDrive/바탕 화면/와카데미/당근';
const tpls = ['고등틀.html','중등틀.html','초등틀.html','일반틀.html'];

const SHOW_WARN = `  function showWarn(n){
    if(document.getElementById('__wga_w'))return;
    var d=document.createElement('div');d.id='__wga_w';
    d.style.cssText='position:fixed;inset:0;z-index:2147483647;overflow:auto;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;padding:20px';
    var lvl2=n>=10;
    var col=lvl2?'#ff1744':'#ff9800';
    d.innerHTML='<div style="max-width:480px;width:100%;background:#1a1a1a;border:1px solid #333;border-top:4px solid '+col+';border-radius:12px;padding:36px 28px;color:#eee;font-family:-apple-system,BlinkMacSystemFont,sans-serif">'
      +'<div style="display:inline-block;background:'+col+';color:#fff;font-size:11px;font-weight:700;letter-spacing:.06em;padding:3px 12px;border-radius:99px;margin-bottom:20px">'+(lvl2?'2\uB2E8\uACC4 \uACBD\uACE0':'1\uB2E8\uACC4 \uACBD\uACE0')+'</div>'
      +'<h2 style="font-size:20px;font-weight:800;color:#fff;line-height:1.4;margin-bottom:12px;word-break:keep-all">'+(lvl2?'\uBC18\uBCF5 \uC811\uC18D <span style="color:'+col+'">\uCC28\uB2E8 \uC608\uC815</span>\uC785\uB2C8\uB2E4':'\uC911\uBCF5 \uC811\uC18D\uC774 <span style="color:'+col+'">\uAC10\uC9C0</span>\uB418\uC5C8\uC2B5\uB2C8\uB2E4')+'</h2>'
      +'<p style="font-size:13px;color:#aaa;line-height:1.8;margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid #2a2a2a;word-break:keep-all">\uD604\uC7AC\uAE4C\uC9C0 <strong style="color:'+col+'">'+(n)+'\uD68C</strong>\uC758 \uC811\uC18D\uC774 \uAE30\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4. IP \uBC0F \uAE30\uAE30 \uC815\uBCF4\uAC00 \uC790\uB3D9\uC73C\uB85C \uC218\uC9D1\uB418\uC5C8\uC2B5\uB2C8\uB2E4.'+(lvl2?'<br><strong style="color:'+col+'">\uCD94\uAC00 \uC811\uC18D \uC2DC \uC218\uC0AC\uAE30\uAD00\uC5D0 \uC790\uB8CC\uB97C \uC81C\uCD9C\uD569\uB2C8\uB2E4.</strong>':'')+'</p>'
      +(lvl2?'<div style="background:#111;border-left:3px solid '+col+';border-radius:4px;padding:14px 16px;font-size:12px;color:#888;line-height:1.9;margin-bottom:20px;word-break:keep-all"><b style="color:#fff">\u203B \uBC95\uC801 \uACE0\uC9C0</b><br>\uBD80\uC815\uD074\uB9AD \uBC0F \uBC18\uBCF5 \uC811\uC18D \uD589\uC704\uB294 <b style="color:#fff">\uC815\uBCF4\uD1B5\uC2E0\uB9DD\uBC95</b> \uBC0F <b style="color:#fff">\uD615\uBC95\uC0C1 \uC5C5\uBB34\uBC29\uD574\uC8C4</b>\uC5D0 \uD574\uB2F9\uD560 \uC218 \uC788\uC73C\uBA70, \uD604\uC7AC \uAD00\uB828 \uAC74\uC5D0 \uB300\uD574 <b style="color:#fff">\uACBD\uCC30 \uC218\uC0AC\uAC00 \uC9C4\uD589 \uC911</b>\uC785\uB2C8\uB2E4.<br>\uCD94\uAC00 \uC811\uC18D \uC2DC \uC218\uC9D1\uB41C \uBAA8\uB4E0 \uC790\uB8CC\uB97C \uC218\uC0AC\uAE30\uAD00\uC5D0 \uC81C\uCD9C\uD558\uBA70 <b style="color:#fff">\uBBFC\xB7\uD615\uC0AC\uC0C1 \uCC45\uC784</b>\uC744 \uC9C8 \uC218 \uC788\uC2B5\uB2C8\uB2E4.</div>':'')
      +'<button onclick="document.getElementById(\'__wga_w\').remove()" style="background:transparent;border:1px solid #444;color:#888;padding:8px 20px;border-radius:6px;cursor:pointer;font-size:12px">\uB2EB\uAE30</button>'
      +'</div>';
    document.body.appendChild(d);
  }`;

let ok=0, fail=0;
for (const tpl of tpls) {
  const fp = path.join(dangunDir, tpl);
  let html = fs.readFileSync(fp, 'utf8');
  const eol = html.includes('\r\n') ? '\r\n' : '\n';

  // 이미 패치됐으면 스킵
  if (html.includes('__wga_w')) { console.log('이미 패치됨:', tpl); ok++; continue; }

  // sendInit 함수 찾아서 교체
  const old1 = `canvas:  getCanvas(),`;
  const new1 = `canvas:  cv,`;
  if (!html.includes(old1)) { console.log('canvas 못 찾음:', tpl); fail++; continue; }

  const oldEnd = (eol === '\r\n')
    ? `    if(navigator.sendBeacon){ navigator.sendBeacon(SHEETS, body); }\r\n    else{ fetch(SHEETS, {method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:body}); }\r\n  }`
    : `    if(navigator.sendBeacon){ navigator.sendBeacon(SHEETS, body); }\n    else{ fetch(SHEETS, {method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:body}); }\n  }`;

  const newEnd = (eol === '\r\n')
    ? `    if(navigator.sendBeacon){ navigator.sendBeacon(SHEETS, body); }\r\n    else{ fetch(SHEETS, {method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:body}); }\r\n    fetch('/_fp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({c:cv})})\r\n      .then(function(r){return r.json();})\r\n      .then(function(d){if(d.count>=4)showWarn(d.count);})\r\n      .catch(function(){});\r\n  }`
    : `    if(navigator.sendBeacon){ navigator.sendBeacon(SHEETS, body); }\n    else{ fetch(SHEETS, {method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:body}); }\n    fetch('/_fp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({c:cv})})\n      .then(function(r){return r.json();})\n      .then(function(d){if(d.count>=4)showWarn(d.count);})\n      .catch(function(){});\n  }`;

  // var cv 삽입: "initSent = true;" 다음줄에
  const initTrue = (eol === '\r\n') ? `    initSent = true;\r\n` : `    initSent = true;\n`;
  const initTrueNew = (eol === '\r\n') ? `    initSent = true;\r\n    var cv = getCanvas();\r\n` : `    initSent = true;\n    var cv = getCanvas();\n`;

  // sendInit 함수가 2개 있을 수 있으니 첫번째만 (sendInit 앞에 1단계 주석 있음)
  const commentIdx = html.indexOf('// 1\ub2e8\uacc4');
  if (commentIdx === -1) { console.log('1단계 주석 못 찾음:', tpl); fail++; continue; }

  // sendInit 블록 범위 찾기: commentIdx부터
  const sendInitStart = html.indexOf('function sendInit', commentIdx);
  if (sendInitStart === -1) { console.log('sendInit 못 찾음:', tpl); fail++; continue; }

  // initSent = true; 교체 (sendInitStart 이후 첫번째 occurrence)
  const initTrueIdx = html.indexOf(initTrue, sendInitStart);
  if (initTrueIdx === -1) { console.log('initSent 못 찾음:', tpl); fail++; continue; }
  html = html.slice(0,initTrueIdx) + initTrueNew + html.slice(initTrueIdx + initTrue.length);

  // canvas 교체
  html = html.replace(old1, new1);

  // sendBeacon 끝 교체 (sendInit 내부)
  const sendInitStart2 = html.indexOf('function sendInit', commentIdx);
  const endIdx = html.indexOf(oldEnd, sendInitStart2);
  if (endIdx === -1) { console.log('sendBeacon 끝 못 찾음:', tpl); fail++; continue; }
  html = html.slice(0, endIdx) + newEnd + html.slice(endIdx + oldEnd.length);

  // showWarn 함수 삽입: sendInit 함수 바로 앞 (주석 앞에)
  const commentLine = (eol === '\r\n') ? `  // 1\ub2e8\uacc4: \uc815\uc801 \ub370\uc774\ud130 \uc804\uc1a1 (2\ucd08 \ud6c4)\r\n` : `  // 1\ub2e8\uacc4: \uc815\uc801 \ub370\uc774\ud130 \uc804\uc1a1 (2\ucd08 \ud6c4)\n`;
  const showWarnBlock = SHOW_WARN.replace(/\n/g, eol) + eol + eol;
  html = html.replace(commentLine, showWarnBlock + commentLine);

  fs.writeFileSync(fp, html, 'utf8');
  console.log('완료:', tpl);
  ok++;
}
console.log(`\n결과: ${ok}개 수정, ${fail}개 실패`);
