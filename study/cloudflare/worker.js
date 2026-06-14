var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker.js
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var BLOCK_AT = 4;
var FP_ENDPOINT = "/_fp";
var JS_ENDPOINT = "/_t.js";
var TRACKING_JS = `(function(){
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
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    if (url.pathname === JS_ENDPOINT) {
      return new Response(TRACKING_JS, {
        headers: {
          "Content-Type": "application/javascript; charset=UTF-8",
          "Cache-Control": "no-store"
        }
      });
    }
    if (url.pathname === "/_ip") {
      return new Response(JSON.stringify({ ip }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
    if (url.pathname === FP_ENDPOINT && request.method === "POST") {
      return handleFP(request, env, ip);
    }
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }
    const fetchDest = request.headers.get("Sec-Fetch-Dest") || "";
    if (fetchDest === "empty") {
      return fetch(request);
    }
    const BYPASS_KEY = "john0599";
    const cookie = parseCookie(request.headers.get("Cookie") || "");
    if (url.searchParams.get("pw") === BYPASS_KEY || cookie["_adm"] === BYPASS_KEY) {
      const res = await fetch(request);
      const newRes = new Response(res.body, res);
      newRes.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
      newRes.headers.append("Set-Cookie", `_adm=${BYPASS_KEY}; Path=/; SameSite=Lax; Max-Age=2592000; Secure`);
      return newRes;
    }
    const ipCount = await incrementCount(env, "ip:" + ip);
    if (ipCount >= BLOCK_AT) return blockPage(ipCount);
    const fpKey = cookie["_s"];
    if (fpKey) {
      const fpCount = await getCount(env, "fp:" + fpKey);
      if (fpCount >= BLOCK_AT) return blockPage(fpCount);
    }
    const originRes = await fetch(request);
    const contentType = originRes.headers.get("Content-Type") || "";
    if (contentType.includes("text/html")) {
      const makeHeaders = (base) => {
        const h = new Headers(base);
        h.set("Cache-Control", "no-store, no-cache, must-revalidate");
        h.set("Pragma", "no-cache");
        return h;
      };
      if (url.searchParams.get("n_query")) {
        return new Response(originRes.body, { status: originRes.status, headers: makeHeaders(originRes.headers) });
      }
      return new HTMLRewriter().on("body", new ScriptInjector()).transform(new Response(originRes.body, {
        status: originRes.status,
        headers: makeHeaders(originRes.headers)
      }));
    }
    return originRes;
  }
};
var ScriptInjector = class {
  static {
    __name(this, "ScriptInjector");
  }
  static {
    __name2(this, "ScriptInjector");
  }
  element(el) {
    el.before('<script src="/_t.js" defer><\/script>', { html: true });
  }
};
async function handleFP(request, env, ip) {
  try {
    const data = await request.json();
    const fp = data.c || "";
    if (!fp) return new Response(JSON.stringify({count:0}), { status: 200, headers: { ...corsHeaders(), "Content-Type": "application/json" } });
    const count = await incrementCount(env, "fp:" + fp);
    const h = new Headers(corsHeaders());
    h.set("Content-Type", "application/json");
    h.append("Set-Cookie", `_s=${fp}; Path=/; SameSite=Lax; Max-Age=2592000; Secure`);
    return new Response(JSON.stringify({count}), { status: 200, headers: h });
  } catch (e) {
    return new Response("ok", { status: 200, headers: corsHeaders() });
  }
}
__name(handleFP, "handleFP");
__name2(handleFP, "handleFP");
async function getCount(env, key) {
  const v = await env.GUARD_KV.get(key);
  return v ? parseInt(v, 10) : 0;
}
__name(getCount, "getCount");
__name2(getCount, "getCount");
async function incrementCount(env, key) {
  const c = await getCount(env, key) + 1;
  await env.GUARD_KV.put(key, String(c), { expirationTtl: 60 * 60 * 24 * 90 });
  return c;
}
__name(incrementCount, "incrementCount");
__name2(incrementCount, "incrementCount");
function parseCookie(str) {
  const out = {};
  str.split(";").forEach((pair) => {
    const idx = pair.indexOf("=");
    if (idx < 0) return;
    out[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
  });
  return out;
}
__name(parseCookie, "parseCookie");
__name2(parseCookie, "parseCookie");
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}
__name(corsHeaders, "corsHeaders");
__name2(corsHeaders, "corsHeaders");
function blockPage(count) {
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\uC811\uC18D \uCC28\uB2E8 \uC548\uB0B4</title>
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
    <h1>\uBE44\uC815\uC0C1\uC801\uC778 <em>\uC911\uBCF5 \uC811\uC18D</em>\uC774<br>\uAC10\uC9C0\uB418\uC5B4 \uCC28\uB2E8\uB418\uC5C8\uC2B5\uB2C8\uB2E4</h1>
    <p class="count-line">
      \uD604\uC7AC\uAE4C\uC9C0 <strong>${count}\uD68C</strong>\uC758 \uC911\uBCF5 \uC811\uC18D\uC774 \uAE30\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4.<br>
      IP \uC8FC\uC18C \uB4F1 \uBAA8\uB4E0 \uC815\uBCF4\uAC00 \uC790\uB3D9\uC73C\uB85C \uC218\uC9D1\xB7\uBCF4\uC874\uB418\uC5C8\uC2B5\uB2C8\uB2E4.
    </p>
    <div class="law-box">
      <b>\u203B \uBC95\uC801 \uACE0\uC9C0</b><br>
      \uBD80\uC815\uD074\uB9AD \uBC0F \uBC18\uBCF5 \uC811\uC18D \uD589\uC704\uB294 <b>\uC815\uBCF4\uD1B5\uC2E0\uB9DD\uBC95</b> \uBC0F <b>\uD615\uBC95\uC0C1 \uC5C5\uBB34\uBC29\uD574\uC8C4</b>\uC5D0
      \uD574\uB2F9\uD560 \uC218 \uC788\uC73C\uBA70, \uD604\uC7AC \uAD00\uB828 \uAC74\uC5D0 \uB300\uD574 <b>\uACBD\uCC30 \uC218\uC0AC\uAC00 \uC9C4\uD589 \uC911</b>\uC785\uB2C8\uB2E4.<br><br>
      \uCD94\uAC00 \uC811\uC18D \uC2DC \uC218\uC9D1\uB41C \uBAA8\uB4E0 \uC790\uB8CC(\uC811\uC18D \uB85C\uADF8, \uC704\uCE58 \uC815\uBCF4 \uB4F1)\uB97C
      \uC218\uC0AC\uAE30\uAD00\uC5D0 \uC81C\uCD9C\uD558\uBA70, <b>\uBBFC\xB7\uD615\uC0AC\uC0C1 \uCC45\uC784</b>\uC744 \uC9C8 \uC218 \uC788\uC74C\uC744 \uC54C\uB9BD\uB2C8\uB2E4.
    </div>
    <p class="footer">\uBCF8 \uD398\uC774\uC9C0\uB294 \uC790\uB3D9\uC73C\uB85C \uC0DD\uC131\uB41C \uBCF4\uC548 \uC548\uB0B4\uBB38\uC785\uB2C8\uB2E4.</p>
  </div>
</body>
</html>`;
  return new Response(html, {
    status: 200,
    // 403 쓰면 차단된 티 남 — 200으로 속이기
    headers: { "Content-Type": "text/html;charset=UTF-8" }
  });
}
__name(blockPage, "blockPage");
__name2(blockPage, "blockPage");
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
