// ============================================================
//  와카데미 Guard Worker
//  - IP / Canvas지문 4회 이상 접속 시 경고 페이지
//  - KV 바인딩 이름: GUARD_KV
//  - 실제 GitHub Pages 주소로 ORIGIN 수정 필요
// ============================================================

const ORIGIN      = 'https://john05992.github.io'; // GitHub Pages origin
const BLOCK_AT    = 4;
const FP_ENDPOINT = '/_fp';
const JS_ENDPOINT = '/_t.js';

// ── 추적 스크립트 (HTML 소스에서 제거됨, Worker가 주입) ──────
const TRACKING_JS = `(function(){
  var SHEETS='https://script.google.com/macros/s/AKfycbzcQl5lq14yCzMa6kVHZheW5naX_9LgoR0BB3EiFLKjmQZ0zoBSDQtkZMq9Nm-5vvQ/exec';
  var enterTime=Date.now(),_qs=location.search,maxScroll=0,clickCount=0,initSent=false,exitSent=false;
  var sid=Date.now().toString(36)+Math.random().toString(36).slice(2,7);
  window.addEventListener('scroll',function(){var total=document.body.scrollHeight-window.innerHeight;if(total<=0)return;var d=Math.round((window.scrollY/total)*100);if(d>maxScroll)maxScroll=d;});
  document.addEventListener('click',function(){clickCount++;});
  function fnv32(str){var h=0x811c9dc5>>>0;for(var i=0;i<str.length;i++){h^=str.charCodeAt(i);h=(((h&0xffff)*0x01000193)+((((h>>>16)*0x01000193)&0xffff)<<16))>>>0;}return h.toString(16).padStart(8,'0');}
  function getCanvas(){try{var c=document.createElement('canvas');c.width=240;c.height=60;var x=c.getContext('2d');x.fillStyle='#f0f';x.fillRect(0,0,240,60);x.fillStyle='rgba(0,255,0,.5)';x.fillRect(10,10,100,30);var g=x.createLinearGradient(0,0,240,0);g.addColorStop(0,'#f00');g.addColorStop(1,'#00f');x.fillStyle=g;x.font='bold 18px Arial';x.fillText('wacademy\u2665',10,42);x.strokeStyle='rgba(255,165,0,.8)';x.beginPath();x.arc(200,30,20,0,Math.PI*2);x.stroke();return fnv32(c.toDataURL());}catch(e){return 'err';}}
  function getWebGL(){try{var c=document.createElement('canvas');c.width=16;c.height=16;var gl=c.getContext('webgl')||c.getContext('experimental-webgl');if(!gl)return 'no-webgl';var vs=gl.createShader(gl.VERTEX_SHADER);gl.shaderSource(vs,'attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}');gl.compileShader(vs);var fs=gl.createShader(gl.FRAGMENT_SHADER);gl.shaderSource(fs,'precision mediump float;void main(){gl_FragColor=vec4(.3,.6,.9,1.);}');gl.compileShader(fs);var pr=gl.createProgram();gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);gl.useProgram(pr);var b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);var loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);var px=new Uint8Array(16*16*4);gl.readPixels(0,0,16,16,gl.RGBA,gl.UNSIGNED_BYTE,px);var ext=gl.getExtension('WEBGL_debug_renderer_info');var rdr=ext?(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)||''):'';var s='';for(var i=0;i<px.length;i++)s+=px[i]+',';return fnv32(s+rdr);}catch(e){return 'err';}}
  function getAudio(cb){try{var ac=new(window.OfflineAudioContext||window.webkitOfflineAudioContext)(1,4096,44100);var osc=ac.createOscillator();osc.type='triangle';osc.frequency.value=10000;var cmp=ac.createDynamicsCompressor();cmp.threshold.value=-50;cmp.knee.value=40;cmp.ratio.value=12;cmp.attack.value=0;cmp.release.value=0.25;osc.connect(cmp);cmp.connect(ac.destination);osc.start(0);ac.oncomplete=function(e){try{var b=e.renderedBuffer.getChannelData(0),s=0;for(var i=0;i<b.length;i++)s+=Math.abs(b[i]);cb((Math.floor(s*1e8)>>>0).toString(16).padStart(8,'0'));}catch(ex){cb('err');}};ac.startRendering();}catch(e){cb('no-audio');}}
  function getGPU(){try{var gl=document.createElement('canvas').getContext('webgl');if(!gl)return 'no-webgl';var ext=gl.getExtension('WEBGL_debug_renderer_info');if(!ext)return 'no-ext';return gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)||'unknown';}catch(e){return 'err';}}
  function getAdBlock(){try{var t=document.createElement('div');t.className='adsbox';t.style.cssText='position:absolute;left:-9999px;height:1px';document.body.appendChild(t);var blocked=t.offsetHeight===0;document.body.removeChild(t);return blocked;}catch(e){return false;}}
  function getWebRTC(cb){try{var pc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'}]});var ips=[],done=false;function finish(){if(done)return;done=true;pc.close();cb(ips.join(','));}pc.createDataChannel('');pc.createOffer().then(function(o){return pc.setLocalDescription(o);});pc.onicecandidate=function(e){if(!e.candidate){finish();return;}var m=e.candidate.candidate.match(/(\\d+\\.\\d+\\.\\d+\\.\\d+)/);if(m&&ips.indexOf(m[1])===-1)ips.push(m[1]);};setTimeout(finish,1500);}catch(e){cb('err');}}
  function parseUA(){var ua=navigator.userAgent,browser='unknown',os='unknown';if(/Chrome\\//.test(ua)&&!/Edg\\//.test(ua))browser='Chrome';else if(/Firefox\\//.test(ua))browser='Firefox';else if(/Edg\\//.test(ua))browser='Edge';else if(/Safari\\//.test(ua)&&!/Chrome/.test(ua))browser='Safari';if(/Windows/.test(ua))os='Windows';else if(/Mac OS/.test(ua))os='Mac';else if(/Android/.test(ua))os='Android';else if(/iPhone|iPad/.test(ua))os='iOS';else if(/Linux/.test(ua))os='Linux';return browser+' / '+os;}
  function getRefQuery(){try{if(!document.referrer)return '';var ref=new URL(document.referrer);if(ref.hostname.indexOf('naver.com')===-1)return '';return ref.searchParams.get('query')||'';}catch(e){return '';}}
  var cachedIP={};
  var _ipPromise=Promise.race([new Promise(function(resolveIP){function _tryIP(apis){if(!apis.length){resolveIP({});return;}fetch(apis[0]).then(function(r){return r.json();}).then(function(d){if(!d.ip&&!d.query)throw new Error('no ip');resolveIP({ip:d.ip||d.query||'',org:d.org||d.isp||'',city:d.city||'',region:d.region||d.regionName||'',country_name:d.country_name||d.country||''});}).catch(function(){_tryIP(apis.slice(1));});}_tryIP(['https://ipv4.ipapi.co/json/','https://ipapi.co/json/','https://ip-api.com/json/?fields=query,org,city,region,country','https://ipinfo.io/json','https://api.ipify.org?format=json']);}),new Promise(function(resolve){setTimeout(function(){resolve({});},15000);})]);
  if(!new URLSearchParams(location.search).get('n_query')){var refQ=getRefQuery();if(refQ){document.querySelectorAll('.dyn-kw').forEach(function(el){el.textContent=refQ;});}}
  function sendInit(webrtcIP,audioFP){if(initSent)return;initSent=true;var cv=getCanvas();var data={type:'init',sid:sid,ip:cachedIP.ip||'',webrtcIP:webrtcIP||'',isp:cachedIP.org||'',city:cachedIP.city||'',region:cachedIP.region||'',country:cachedIP.country_name||'',canvas:cv,webgl:getWebGL(),audio:audioFP||'',gpu:getGPU(),ua:parseUA(),screen:screen.width+'x'+screen.height,cores:navigator.hardwareConcurrency||'',adBlock:getAdBlock(),page:location.pathname,query:_qs||'\uC5C6\uC74C',ref:document.referrer||'\uC5C6\uC74C'};var body=JSON.stringify(data);if(navigator.sendBeacon){navigator.sendBeacon(SHEETS,body);}else{fetch(SHEETS,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:body});}navigator.sendBeacon('/_fp',JSON.stringify({c:cv}));}
  function sendExit(){if(exitSent)return;exitSent=true;var data={type:'exit',sid:sid,stayTime:Math.round((Date.now()-enterTime)/1000)+'s',scrollDepth:maxScroll+'%',clickCount:clickCount};var body=JSON.stringify(data);if(navigator.sendBeacon){navigator.sendBeacon(SHEETS,body);}else{fetch(SHEETS,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:body});}}
  var pts=document.querySelectorAll('h2.planner-title');for(var i=0;i<pts.length;i++){if(pts[i].textContent.indexOf('\uC640\uC640\uD559\uC6D0')!==-1){var now2=new Date();pts[i].innerHTML='\uC77C\uB300\uC77C\uBC18 \uC548\uB0B4<br><em>'+(now2.getMonth()+1)+'/'+now2.getDate()+'\uAE4C\uC9C0 \uBAA8\uC9D1</em>';break;}}
  Promise.all([new Promise(function(resolve){getWebRTC(resolve);}),_ipPromise,new Promise(function(resolve){getAudio(resolve);})]).then(function(res){cachedIP=res[1];sendInit(res[0],res[2]);});
  window.addEventListener('pagehide',function(){if(!initSent)sendInit('');sendExit();});
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')sendExit();});
})();`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const ip  = request.headers.get('CF-Connecting-IP') || 'unknown';

    // ── 추적 JS 서빙 ────────────────────────────────────────
    if (url.pathname === JS_ENDPOINT) {
      return new Response(TRACKING_JS, {
        headers: {
          'Content-Type': 'application/javascript; charset=UTF-8',
          'Cache-Control': 'no-store',
        },
      });
    }

    // ── FP 제출 엔드포인트 ──────────────────────────────────
    if (url.pathname === FP_ENDPOINT && request.method === 'POST') {
      return handleFP(request, env, ip);
    }

    // OPTIONS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    // ── 관리자 우회 ──────────────────────────────────────────
    const BYPASS_KEY = 'john0599';
    const cookie = parseCookie(request.headers.get('Cookie') || '');
    if (url.searchParams.get('pw') === BYPASS_KEY || cookie['_adm'] === BYPASS_KEY) {
      const res = await fetch(request);
      const newRes = new Response(res.body, res);
      newRes.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      // 우회 쿠키 30일 유지
      newRes.headers.append('Set-Cookie', `_adm=${BYPASS_KEY}; Path=/; SameSite=Lax; Max-Age=2592000; Secure`);
      return newRes;
    }

    // ── IP 카운트 증가 + 체크 ────────────────────────────────
    const ipCount = await incrementCount(env, 'ip:' + ip);
    if (ipCount >= BLOCK_AT) return blockPage(ipCount);

    // ── 쿠키 FP 체크 ────────────────────────────────────────
    const fpKey  = cookie['_s'];
    if (fpKey) {
      const fpCount = await getCount(env, 'fp:' + fpKey);
      if (fpCount >= BLOCK_AT) return blockPage(fpCount);
    }

    // ── 정상: 원본 요청 그대로 통과 (GitHub Pages로)  ────────
    const originRes = await fetch(request);

    // HTML 페이지: 캐시 방지 + 추적 스크립트 주입
    const contentType = originRes.headers.get('Content-Type') || '';
    if (contentType.includes('text/html')) {
      return new HTMLRewriter()
        .on('body', new ScriptInjector())
        .transform(new Response(originRes.body, {
          status: originRes.status,
          headers: (() => {
            const h = new Headers(originRes.headers);
            h.set('Cache-Control', 'no-store, no-cache, must-revalidate');
            h.set('Pragma', 'no-cache');
            return h;
          })(),
        }));
    }

    return originRes;
  }
};

// ── HTMLRewriter: </body> 직전에 추적 스크립트 주입 ───────────
class ScriptInjector {
  element(el) {
    el.before('<script src="/_t.js" defer><\/script>', { html: true });
  }
}

// ── FP 수신 처리 ─────────────────────────────────────────────
async function handleFP(request, env, ip) {
  try {
    const data = await request.json();
    const fp   = data.c || '';   // canvas hash
    if (!fp) return new Response('ok', { status: 200, headers: corsHeaders() });

    // FP 카운트 증가 (IP는 페이지 요청마다 이미 증가됨)
    await incrementCount(env, 'fp:' + fp);

    // 쿠키 심기 (30일)
    const res = new Response('ok', { status: 200, headers: corsHeaders() });
    res.headers.append('Set-Cookie',
      `_s=${fp}; Path=/; SameSite=Lax; Max-Age=2592000; Secure`
    );
    return res;
  } catch (e) {
    return new Response('ok', { status: 200, headers: corsHeaders() });
  }
}

// ── KV 헬퍼 ─────────────────────────────────────────────────
async function getCount(env, key) {
  const v = await env.GUARD_KV.get(key);
  return v ? parseInt(v, 10) : 0;
}

async function incrementCount(env, key) {
  const c = (await getCount(env, key)) + 1;
  // 90일 TTL
  await env.GUARD_KV.put(key, String(c), { expirationTtl: 60 * 60 * 24 * 90 });
  return c;
}

// ── 쿠키 파서 ───────────────────────────────────────────────
function parseCookie(str) {
  const out = {};
  str.split(';').forEach(pair => {
    const idx = pair.indexOf('=');
    if (idx < 0) return;
    out[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
  });
  return out;
}

// ── CORS 헤더 ────────────────────────────────────────────────
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

// ── 차단 페이지 ──────────────────────────────────────────────
function blockPage(count) {
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>접속 차단 안내</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif;
      background: #0d0d0d;
      color: #eee;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 20px;
    }
    .card {
      max-width: 540px;
      width: 100%;
      background: #161616;
      border: 1px solid #2a2a2a;
      border-top: 4px solid #ff4714;
      border-radius: 16px;
      padding: 48px 36px 44px;
    }
    .badge {
      display: inline-block;
      background: #ff4714;
      color: #fff;
      font-size: .78rem;
      font-weight: 900;
      letter-spacing: .06em;
      padding: 5px 14px;
      border-radius: 99px;
      margin-bottom: 28px;
    }
    h1 {
      font-size: 1.55rem;
      font-weight: 900;
      line-height: 1.4;
      color: #fff;
      margin-bottom: 20px;
      word-break: keep-all;
    }
    h1 em { color: #ff4714; font-style: normal; }
    .count-line {
      font-size: .9rem;
      color: #aaa;
      margin-bottom: 28px;
      padding-bottom: 28px;
      border-bottom: 1px solid #2a2a2a;
      word-break: keep-all;
      line-height: 1.7;
    }
    .count-line strong { color: #ff4714; }
    .law-box {
      background: #1c1c1c;
      border: 1px solid #333;
      border-left: 4px solid #ff4714;
      border-radius: 8px;
      padding: 22px 24px;
      font-size: .88rem;
      line-height: 1.9;
      color: #bbb;
      word-break: keep-all;
    }
    .law-box b { color: #fff; }
    .footer {
      margin-top: 32px;
      font-size: .75rem;
      color: #444;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">ACCESS BLOCKED</span>
    <h1>비정상적인 <em>중복 접속</em>이<br>감지되어 차단되었습니다</h1>
    <p class="count-line">
      현재까지 <strong>${count}회</strong>의 중복 접속이 기록되었습니다.<br>
      IP 주소 등 모든 정보가 자동으로 수집·보존되었습니다.
    </p>
    <div class="law-box">
      <b>※ 법적 고지</b><br>
      부정클릭 및 반복 접속 행위는 <b>정보통신망법</b> 및 <b>형법상 업무방해죄</b>에
      해당할 수 있으며, 현재 관련 건에 대해 <b>경찰 수사가 진행 중</b>입니다.<br><br>
      추가 접속 시 수집된 모든 자료(접속 로그, 위치 정보 등)를
      수사기관에 제출하며, <b>민·형사상 책임</b>을 질 수 있음을 알립니다.
    </div>
    <p class="footer">본 페이지는 자동으로 생성된 보안 안내문입니다.</p>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 200,   // 403 쓰면 차단된 티 남 — 200으로 속이기
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
}
