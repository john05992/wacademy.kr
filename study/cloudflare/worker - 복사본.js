const BLOCK_AT  = 4;
const POLICE_AT = 10;
const SHEETS_URL = "https://script.google.com/macros/s/AKfycbw1zvMoIQiwPWNJAs7zr-46-4nN7bXwPTj0L6zMR5ihi5qQMFKP5zmYdWA0fTAnJwBy/exec";

const TRACKING_JS = `(function(){
  if(window._wac)return;
  window._wac=true;
  var SHEETS='${SHEETS_URL}';
  var enterTime=Date.now(),_qs=location.search,maxScroll=0,clickCount=0,exitSent=false;
  var sid=Date.now().toString(36)+Math.random().toString(36).slice(2,7);
  window.addEventListener('scroll',function(){var total=document.body.scrollHeight-window.innerHeight;if(total<=0)return;var d=Math.round((window.scrollY/total)*100);if(d>maxScroll)maxScroll=d;});
  document.addEventListener('click',function(){clickCount++;});
  function fnv32(str){var h=0x811c9dc5>>>0;for(var i=0;i<str.length;i++){h^=str.charCodeAt(i);h=(((h&0xffff)*0x01000193)+((((h>>>16)*0x01000193)&0xffff)<<16))>>>0;}return h.toString(16).padStart(8,'0');}
  function getCanvas(){try{var c=document.createElement('canvas');c.width=240;c.height=60;var x=c.getContext('2d');x.fillStyle='#f0f';x.fillRect(0,0,240,60);x.fillStyle='rgba(0,255,0,.5)';x.fillRect(10,10,100,30);var g=x.createLinearGradient(0,0,240,0);g.addColorStop(0,'#f00');g.addColorStop(1,'#00f');x.fillStyle=g;x.font='bold 18px Arial';x.fillText('wacademy\u2665',10,42);x.strokeStyle='rgba(255,165,0,.8)';x.beginPath();x.arc(200,30,20,0,Math.PI*2);x.stroke();var dataUrl=c.toDataURL();return crypto.subtle.digest('SHA-256',new TextEncoder().encode(dataUrl)).then(function(buf){return Array.from(new Uint8Array(buf)).map(function(b){return b.toString(16).padStart(2,'0');}).join('').slice(0,32);});}catch(e){return Promise.resolve('err');}}
  function getWebGL(){try{var c=document.createElement('canvas');c.width=16;c.height=16;var gl=c.getContext('webgl')||c.getContext('experimental-webgl');if(!gl)return 'no-webgl';var vs=gl.createShader(gl.VERTEX_SHADER);gl.shaderSource(vs,'attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}');gl.compileShader(vs);var fs=gl.createShader(gl.FRAGMENT_SHADER);gl.shaderSource(fs,'precision mediump float;void main(){gl_FragColor=vec4(.3,.6,.9,1.);}');gl.compileShader(fs);var pr=gl.createProgram();gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);gl.useProgram(pr);var b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);var loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);var px=new Uint8Array(16*16*4);gl.readPixels(0,0,16,16,gl.RGBA,gl.UNSIGNED_BYTE,px);var ext=gl.getExtension('WEBGL_debug_renderer_info');var rdr=ext?(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)||''):'';var s='';for(var i=0;i<px.length;i++)s+=px[i]+',';return fnv32(s+rdr);}catch(e){return 'err';}}
  function getAudio(cb){try{var ac=new(window.OfflineAudioContext||window.webkitOfflineAudioContext)(1,4096,44100);var osc=ac.createOscillator();osc.type='triangle';osc.frequency.value=10000;var cmp=ac.createDynamicsCompressor();cmp.threshold.value=-50;cmp.knee.value=40;cmp.ratio.value=12;cmp.attack.value=0;cmp.release.value=0.25;osc.connect(cmp);cmp.connect(ac.destination);osc.start(0);ac.oncomplete=function(e){try{var b=e.renderedBuffer.getChannelData(0),s=0;for(var i=0;i<b.length;i++)s+=Math.abs(b[i]);cb((Math.floor(s*1e8)>>>0).toString(16).padStart(8,'0'));}catch(ex){cb('err');}};ac.startRendering();}catch(e){cb('no-audio');}}
  function getGPU(){try{var gl=document.createElement('canvas').getContext('webgl');if(!gl)return 'no-webgl';var ext=gl.getExtension('WEBGL_debug_renderer_info');if(!ext)return 'no-ext';return gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)||'unknown';}catch(e){return 'err';}}
  function getAdBlock(){try{var t=document.createElement('div');t.className='adsbox';t.style.cssText='position:absolute;left:-9999px;height:1px';document.body.appendChild(t);var blocked=t.offsetHeight===0;document.body.removeChild(t);return blocked;}catch(e){return false;}}
  function getDNSLeak(cb){try{fetch('/_dns').then(function(r){return r.json();}).then(function(d){cb(d.ip||'');}).catch(function(){cb('');});}catch(e){cb('');}}
  function getWebRTC(cb){try{var pc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'}]});var ips=[],ipv6s=[],done=false;function finish(){if(done)return;done=true;pc.close();cb({v4:ips.join(','),v6:ipv6s.join(',')});}pc.createDataChannel('');pc.createOffer().then(function(o){return pc.setLocalDescription(o);});pc.onicecandidate=function(e){if(!e.candidate){finish();return;}var cand=e.candidate.candidate;var m4=cand.match(/(\\d+\\.\\d+\\.\\d+\\.\\d+)/);if(m4&&ips.indexOf(m4[1])===-1)ips.push(m4[1]);var m6=cand.match(/([0-9a-f]{0,4}(?::[0-9a-f]{0,4}){2,7})/i);if(m6&&m6[1].indexOf(':')!==-1&&ipv6s.indexOf(m6[1])===-1)ipv6s.push(m6[1]);};setTimeout(finish,1500);}catch(e){cb({v4:'err',v6:''});}}
  function parseUA(){var ua=navigator.userAgent,browser='unknown',os='unknown';if(/Chrome\\//.test(ua)&&!/Edg\\//.test(ua))browser='Chrome';else if(/Firefox\\//.test(ua))browser='Firefox';else if(/Edg\\//.test(ua))browser='Edge';else if(/Safari\\//.test(ua)&&!/Chrome/.test(ua))browser='Safari';if(/Windows/.test(ua))os='Windows';else if(/Mac OS/.test(ua))os='Mac';else if(/Android/.test(ua))os='Android';else if(/iPhone|iPad/.test(ua))os='iOS';else if(/Linux/.test(ua))os='Linux';return browser+' / '+os;}
  function getRefQuery(){try{if(!document.referrer)return '';var ref=new URL(document.referrer);if(ref.hostname.indexOf('naver.com')===-1)return '';return ref.searchParams.get('query')||'';}catch(e){return '';}}
  var refQ=getRefQuery();
  var _params=new URLSearchParams(location.search);
  var nQuery=_params.get('n_query')||'\uC5C6\uC74C';
  var nRank=_params.get('n_rank')||'\uC5C6\uC74C';
  if(!_params.get('n_query')&&refQ){document.querySelectorAll('.dyn-kw').forEach(function(el){el.textContent=refQ;});}
  var pts=document.querySelectorAll('h2.planner-title');for(var i=0;i<pts.length;i++){if(pts[i].textContent.indexOf('\uC640\uC640\uD559\uC6D0')!==-1){var now2=new Date();pts[i].innerHTML='\uC77C\uB300\uC77C\uBC18 \uC548\uB0B4<br><em>'+(now2.getMonth()+1)+'/'+now2.getDate()+'\uAE4C\uC9C0 \uBAA8\uC9D1</em>';break;}}
  /* ── SwiftShader(헤드리스 봇) 감지 → 시트 기록 제외 ────────── */
  var _skipSheets=getGPU().indexOf('SwiftShader')!==-1;
  /* ── 캔버스 + CF IP 동시 수집 후 init 행 전송 (~50ms) ─────── */
  var _cfIP='';
  Promise.all([
    getCanvas(),
    fetch('/_ip').then(function(r){return r.json();}).catch(function(){return {ip:''};})
  ]).then(function(res){
    var cv=res[0];
    _cfIP=res[1].ip||'';
    fetch('/_fp',{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({c:cv})})
      .then(function(r){return r.json();})
      .then(function(d){
        document.cookie='_s='+cv+'; path=/; max-age=7776000; samesite=lax; secure';
        if(d.blocked){
          if(!_skipSheets)navigator.sendBeacon(SHEETS,JSON.stringify({type:'canvas_block',sid:sid,ip:_cfIP}));
          window.location.replace(location.href);
        }
      }).catch(function(){});
    if(_skipSheets)return;
    navigator.sendBeacon(SHEETS,JSON.stringify({
      type:'init',sid:sid,refQuery:refQ,nQuery:nQuery,nRank:nRank,
      ip:_cfIP,webrtcIP:'',isp:'',city:'',region:'',country:'',audio:'',
      canvas:cv,webgl:getWebGL(),gpu:getGPU(),
      ua:parseUA(),screen:screen.width+'x'+screen.height,cores:navigator.hardwareConcurrency||'',adBlock:getAdBlock(),
      page:location.pathname,query:_qs||'\uC5C6\uC74C',ref:document.referrer||'\uC5C6\uC74C'
    }));
  });
  /* ── WebRTC/오디오 + ISP정보 수집 후 update_ip 전송 ─────────── */
  var _ispPromise=Promise.race([new Promise(function(resolveIP){function _tryIP(apis){if(!apis.length){resolveIP({});return;}fetch(apis[0]).then(function(r){return r.json();}).then(function(d){if(!d.ip&&!d.query)throw new Error('no ip');resolveIP({org:d.isp||d.org||d.as||'',city:d.city||'',region:d.region||d.regionName||'',country_name:d.country_name||d.country||''});}).catch(function(){_tryIP(apis.slice(1));});}_tryIP(['https://ipapi.co/json/','https://ip-api.com/json/?fields=query,isp,city,regionName,country','https://ipinfo.io/json']);}),new Promise(function(resolve){setTimeout(function(){resolve({});},5000);})]);
  Promise.all([new Promise(function(r){getWebRTC(r);}),_ispPromise,new Promise(function(r){getAudio(r);}),new Promise(function(r){getDNSLeak(r);})]).then(function(res){
    if(_skipSheets)return;
    var rtc=res[0]||{v4:'',v6:''};
    var isp=res[1];
    navigator.sendBeacon(SHEETS,JSON.stringify({
      type:'update_ip',sid:sid,
      ip:_cfIP,dnsLeak:res[3]||'',ipv6:rtc.v6||'',webrtcIP:rtc.v4||'',isp:isp.org||'',city:isp.city||'',region:isp.region||'',country:isp.country_name||'',audio:res[2]||''
    }));
  });
  /* ── 이탈 전송 ──────────────────────────────────────────── */
  function sendExit(){if(exitSent)return;exitSent=true;if(_skipSheets)return;navigator.sendBeacon(SHEETS,JSON.stringify({type:'exit',sid:sid,stayTime:Math.round((Date.now()-enterTime)/1000)+'s',scrollDepth:maxScroll+'%',clickCount:clickCount}));}
  window.addEventListener('pagehide',function(){sendExit();});
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')sendExit();});
})();`;

function parseCookie(str) {
  const out = {};
  str.split(";").forEach((pair) => {
    const idx = pair.indexOf("=");
    if (idx < 0) return;
    out[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
  });
  return out;
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

async function getCount(env, key) {
  const v = await env.GUARD_KV.get(key);
  return v ? parseInt(v, 10) : 0;
}

async function incrementCount(env, key) {
  const c = (await getCount(env, key)) + 1;
  await env.GUARD_KV.put(key, String(c), { expirationTtl: 60 * 60 * 24 * 90 });
  return c;
}

async function handleFP(request, env) {
  try {
    const cfIP = request.headers.get("CF-Connecting-IP") || "";
    const data = await request.json();
    const fp = data.c || "";
    if (!fp) return new Response(JSON.stringify({ ok: true, count: 0, blocked: false, ip: cfIP }), { status: 200, headers: { "Content-Type": "application/json" } });
    const count = await incrementCount(env, "fp:" + fp);
    const blocked = count >= BLOCK_AT;
    const headers = new Headers({ "Content-Type": "application/json" });
    headers.append("Set-Cookie", `_s=${fp}; Path=/; SameSite=Lax; Max-Age=2592000; Secure`);
    return new Response(JSON.stringify({ ok: true, count, blocked, ip: cfIP }), { status: 200, headers });
  } catch {
    return new Response('{"ok":true,"count":0,"blocked":false,"ip":""}', { status: 200, headers: { "Content-Type": "application/json" } });
  }
}

function blockPage(count, ip = "") {
  const police = count >= POLICE_AT;
  const color  = police ? "#cc0000" : "#ff4714";
  const bg     = police ? "#100808" : "#161616";
  const border = police ? "#3a1a1a" : "#2a2a2a";
  const badge  = police ? "⚠ 수사 진행 중" : "ACCESS BLOCKED";
  const title  = police
    ? "반복 불법 접속으로<br><em>수사기관에 신고</em>되었습니다"
    : "비정상적인 <em>중복 접속</em>이<br>감지되어 차단되었습니다";
  const sub = police
    ? `현재까지 <strong>${count}회</strong>의 비정상 접속이 기록되었습니다.<br>수집된 모든 디지털 증거가 수사기관에 제출된 상태입니다.`
    : `현재까지 <strong>${count}회</strong>의 중복 접속이 기록되었습니다.<br>IP 주소 등 모든 정보가 자동으로 수집·보존되었습니다.`;
  const law = police
    ? `<b>※ 형사 고발 완료</b><br>본 행위는 <b>정보통신망법</b> 제48조 및 <b>형법</b> 제314조(업무방해) 위반으로 현재 <b>사이버수사대에 수사 의뢰</b>가 완료되었습니다.<br><br>접속 IP, 브라우저 지문, 위치 정보, 접속 시각 등 모든 자료가 증거로 보전되어 있으며, 추가 접속 시 <b>혐의 가중</b>의 원인이 됩니다.`
    : `<b>※ 법적 고지</b><br>부정클릭 및 반복 접속 행위는 <b>정보통신망법</b> 및 <b>형법상 업무방해죄</b>에 해당할 수 있으며, 현재 관련 건에 대해 <b>경찰 수사가 진행 중</b>입니다.<br><br>추가 접속 시 수집된 모든 자료를 수사기관에 제출하며, <b>민·형사상 책임</b>을 질 수 있음을 알립니다.`;

  const policeExtra = police ? `
    <div class="ip-reveal">
      <div class="cur-ip">현재 접속 IP &nbsp;<strong>${ip || "수집됨"}</strong></div>
      <p class="lip-notice">위 IP가 아닌 실제 로컬 IP를 귀하의 보안누출로 인해 확보하였습니다.</p>
    </div>
    <div class="info-box">
      <div class="info-title">▣ 확보된 정보</div>
      <div class="info-row"><span class="lbl">로컬 IP</span></div>
      <div class="info-row"><span class="lbl">기기 정보</span></div>
      <div class="info-row"><span class="lbl">위치 정보</span></div>
      <div class="info-row"><span class="lbl">마우스 자동화 곡선패턴</span></div>
    </div>` : "";

  const policeScript = "";

  const policeCSS = police ? `
.ip-reveal{background:#1a0a0a;border:1px solid #3a1a1a;border-radius:8px;padding:16px 20px;margin-bottom:18px;}
.cur-ip{font-size:.95rem;color:#ccc;margin-bottom:6px;}
.cur-ip strong{color:#ff4444;font-size:1.05rem;letter-spacing:.02em;}
.lip-notice{font-size:.82rem;color:#999;line-height:1.5;}
.info-box{background:#150d0d;border:1px solid #3a1a1a;border-radius:8px;padding:18px 20px;margin-bottom:20px;}
.info-title{font-size:.78rem;color:#cc4444;font-weight:700;letter-spacing:.06em;margin-bottom:12px;}
.info-row{display:flex;align-items:flex-start;gap:12px;padding:9px 0;border-bottom:1px solid #220e0e;}
.info-row:last-child{border-bottom:none;}
.lbl{min-width:150px;font-size:.8rem;color:#777;flex-shrink:0;}
.info-row span:last-child{font-size:.8rem;color:#ddd;word-break:break-all;}
.contact{margin-top:20px;font-size:.88rem;color:#cc4444;font-weight:700;text-align:center;padding-top:16px;border-top:1px solid #3a1a1a;}` : "";

  return new Response(`<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>접속 차단</title>
<style>*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',sans-serif;background:#0d0d0d;color:#eee;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px 20px}.card{max-width:560px;width:100%;background:${bg};border:1px solid ${border};border-top:4px solid ${color};border-radius:16px;padding:48px 36px 44px}.badge{display:inline-block;background:${color};color:#fff;font-size:.78rem;font-weight:900;letter-spacing:.06em;padding:5px 14px;border-radius:99px;margin-bottom:28px}h1{font-size:1.55rem;font-weight:900;line-height:1.4;color:#fff;margin-bottom:20px;word-break:keep-all}h1 em{color:${color};font-style:normal}.sub{font-size:.9rem;color:#aaa;margin-bottom:28px;padding-bottom:28px;border-bottom:1px solid ${border};line-height:1.7;word-break:keep-all}.sub strong{color:${color}}.law{background:#1c1c1c;border:1px solid #333;border-left:4px solid ${color};border-radius:8px;padding:22px 24px;font-size:.88rem;line-height:1.9;color:#bbb;word-break:keep-all}.law b{color:#fff}${policeCSS}</style>
</head><body><div class="card">
<span class="badge">${badge}</span>
<h1>${title}</h1>
${policeExtra}
<p class="sub">${sub}</p>
<div class="law">${law}</div>
${police ? '<p class="contact">귀하께 연락드리겠습니다.</p>' : ""}
</div>${policeScript}</body></html>`, {
    status: 200,
    headers: { "Content-Type": "text/html;charset=UTF-8" },
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const ip  = request.headers.get("CF-Connecting-IP") || "unknown";

    if (url.pathname === "/robots.txt") {
      return new Response(
`User-agent: Yeti
Allow:/`,
        { headers: { "Content-Type": "text/plain; charset=UTF-8" } }
      );
    }

    if (url.pathname === "/_t.js") {
      return new Response(TRACKING_JS, {
        headers: { "Content-Type": "application/javascript; charset=UTF-8", "Cache-Control": "no-store" },
      });
    }

    if (url.pathname === "/_ip") {
      return new Response(JSON.stringify({ ip }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    if (url.pathname === "/_dns") {
      return new Response(JSON.stringify({ ip }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    if (url.pathname === "/_fp" && request.method === "POST") {
      return handleFP(request, env);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const BYPASS_KEY = "john0599";
    const cookie = parseCookie(request.headers.get("Cookie") || "");
    if (url.searchParams.get("pw") === BYPASS_KEY || cookie["_adm"] === BYPASS_KEY) {
      const res = await fetch(request);
      const out = new Response(res.body, res);
      out.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
      out.headers.append("Set-Cookie", `_adm=${BYPASS_KEY}; Path=/; SameSite=Lax; Max-Age=2592000; Secure`);
      return out;
    }

    // 네이버 예티만 통과, 나머지 봇/크롤러 차단
    const ua = request.headers.get("User-Agent") || "";
    const isYeti = /Yeti/i.test(ua);
    if (isYeti) {
      const originRes = await fetch(request);
      return originRes;
    }
    const isBot = /Googlebot|bingbot|Naverbot|facebookexternalhit|Twitterbot|LinkedInBot|Slurp|DuckDuckBot|Baiduspider|YandexBot|Sogou|Exabot|ia_archiver|AhrefsBot|SemrushBot|MJ12bot|HeadlessChrome|PhantomJS|Selenium|Puppeteer|python-requests|curl|wget|libwww|scrapy|Go-http-client/i.test(ua);
    if (isBot) {
      return new Response("", { status: 403 });
    }

    const dest = request.headers.get("Sec-Fetch-Dest") || "";
    if (dest === "document") {
      const ipCount = await incrementCount(env, "ip:" + ip);
      if (ipCount >= BLOCK_AT) {
        // IP 차단 시 구글시트에 차단 기록 전송
        const ua = request.headers.get("User-Agent") || "";
        ctx.waitUntil(fetch(SHEETS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "ip_block",
            ip,
            ua,
            page: url.pathname + url.search,
          }),
        }));
        return blockPage(ipCount, ip);
      }
    }

    const fpKey = cookie["_s"];
    if (fpKey) {
      const fpCount = await getCount(env, "fp:" + fpKey);
      if (fpCount >= BLOCK_AT) return blockPage(fpCount, ip);
    }

    const originRes = await fetch(request);
    const ct = originRes.headers.get("Content-Type") || "";
    if (!ct.includes("text/html")) return originRes;

    const newHeaders = new Headers(originRes.headers);
    newHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate");
    newHeaders.set("Pragma", "no-cache");

    let hasTracking = false;
    return new HTMLRewriter()
      .on('script[src="/_t.js"]', { element() { hasTracking = true; } })
      .on("body", {
        element(el) {
          if (!hasTracking) el.prepend('<script src="/_t.js" defer><\/script>', { html: true });
        },
      })
      .transform(new Response(originRes.body, { status: originRes.status, headers: newHeaders }));
  },
};
