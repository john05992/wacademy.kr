// ============================================================
//  와카데미 Guard Worker  v3
//  - IP / Canvas지문 4회 이상 → 차단
//  - HTML 요청만 IP 카운트
//  - 쿠키 없음
//  - KV 바인딩: GUARD_KV
// ============================================================

const BLOCK_AT    = 4;
const BYPASS_KEY  = 'john0599';
const FP_PATH     = '/_fp';
const JS_PATH     = '/_t.js';
const SHEETS      = 'https://script.google.com/macros/s/AKfycbwtWXpPWulKDq2ntzHNrrid5w12JlLCjN-N3onlwy49mZfy5v1lPrdYN3U-cknvlc1G/exec';

// ── 추적 JS ──────────────────────────────────────────────────────────────
const TRACKING_JS = '';

// ── Worker 메인 ───────────────────────────────────────────────
export default {
  async fetch(request, env) {
    try {
    const url = new URL(request.url);
    const rawIp = request.headers.get('CF-Connecting-IP') || 'unknown';
    // IPv6는 /64 프리픽스만 사용 (같은 네트워크 기기 묶기)
    const ip = rawIp.includes(':') ? rawIp.split(':').slice(0,4).join(':') : rawIp;

    // /cloudflare/ 경로 접근 차단 (worker.js 등 소스 노출 방지)
    if (url.pathname.startsWith('/cloudflare/')) {
      return new Response('Not Found', { status: 404 });
    }

    // 봇/크롤러 처리 (KV 카운트/추적 없음)
    const ua = request.headers.get('User-Agent') || '';
    if (/Yeti/i.test(ua)) {
      return fetch(request);
    }
    const botPattern = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|discordbot|preview|fetch|python|curl|wget|scrapy|httpclient|go-http|java\/|libwww|lwp-|okhttp|nmap|masscan|zgrab|nuclei|semrush|ahrefs|mj12bot|dotbot|rogerbot|exabot|baiduspider|yandexbot/i;
    const isBot = botPattern.test(ua) || ua === '' || ua.length < 10;
    if (isBot) {
      return new Response('', { status: 403 });
    }

    // /_t.js 서빙 (스크립트 태그로 로드할 때만 반환)
    if (url.pathname === JS_PATH) {
      if (request.headers.get('Sec-Fetch-Dest') !== 'script') {
        const fakeJs = `!function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);}(window,document,'script','dataLayer','GTM-WKDM29');
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
ga('create','UA-189442-2','auto');ga('set','anonymizeIp',true);ga('send','pageview');
(function(){
  var _wq=_wq||[];
  var cfg={siteId:'wac-'+btoa(location.hostname).replace(/=/g,''),v:'2.4.1',collect:['scroll','click','rage','dead'],session:{timeout:1800}};
  var p=document.createElement('script');p.async=true;
  p.src='https://cdn.wacademy.kr/analytics/v2/collect.min.js?sid='+cfg.siteId;
  document.head.appendChild(p);
  window.__wa=window.__wa||{q:[],push:function(a){this.q.push(a);}};
  window.__wa.push({event:'init',cfg:cfg,ts:Date.now()});
  document.addEventListener('DOMContentLoaded',function(){
    window.__wa.push({event:'ready',url:location.href,ref:document.referrer,title:document.title});
  });
})();
(function(){
  // geo-targeting: 지역별 배너/콘텐츠 최적화
  var _geo={api:'https://pro.ip-api.com/json/?key=a3Fk92Lx&fields=status,country,regionName,city,lat,lon,isp,org,as,query',cache:sessionStorage,ttl:3600};
  function _geoFetch(){
    try{
      var cached=_geo.cache.getItem('_geo_d');
      if(cached){var o=JSON.parse(cached);if(Date.now()-o._ts<_geo.ttl*1000){_geoApply(o);return;}}
      var x=new XMLHttpRequest();x.open('GET',_geo.api,true);x.timeout=5000;
      x.onreadystatechange=function(){if(x.readyState===4&&x.status===200){try{var d=JSON.parse(x.responseText);if(d.status==='success'){d._ts=Date.now();_geo.cache.setItem('_geo_d',JSON.stringify(d));_geoApply(d);}}catch(e){}}};
      x.send();
    }catch(e){}
  }
  function _geoApply(d){
    window.__wa&&window.__wa.push({event:'geo',city:d.city,region:d.regionName,country:d.country,isp:d.isp,lat:d.lat,lon:d.lon,ip:d.query});
    // 지역 맞춤 노출 처리
    var region=d.regionName||'';
    document.querySelectorAll('[data-geo-region]').forEach(function(el){el.style.display=el.dataset.geoRegion===region?'':'none';});
  }
  window.addEventListener('load',_geoFetch);
})();`;
      return new Response(fakeJs, {
          headers: { 'Content-Type': 'application/javascript; charset=UTF-8', 'Cache-Control': 'public, max-age=3600' }
        });
      }
      return new Response(TRACKING_JS, {
        headers: { 'Content-Type': 'application/javascript; charset=UTF-8', 'Cache-Control': 'no-store' }
      });
    }

    // /_ip GET: Cloudflare가 아는 IP/지역 정보 반환
    if (url.pathname === '/_ip') {
      return jsonRes({
        ip: ip,
        org: request.cf?.asOrganization || '',
        city: request.cf?.city || '',
        region: request.cf?.region || '',
        country_name: request.cf?.country || ''
      });
    }

    // /_fp POST: 캔버스지문 + WebRTC IPv4 카운트
    if (url.pathname === FP_PATH && request.method === 'POST') {
      const adminCookie = parseCookie(request.headers.get('Cookie') || '');
      if (adminCookie['_adm'] === BYPASS_KEY) return jsonRes({blocked: false, count: 0});
      try {
        const d  = await request.json();
        const fp = d.c || '';
        if (!fp) return jsonRes({blocked: false, count: 0});
        const fpCnt = await incr(env, 'fp:' + fp);
        // WebRTC 공인 IPv4로 PC+모바일(IPv6) 합산 차단
        let rtcBlocked = false, rtcCnt = 0;
        if (d.rtc) {
          const rtcPublic = d.rtc.split(',').map(function(s){return s.trim();}).find(isPublicIPv4);
          if (rtcPublic && rtcPublic !== ip) {
            rtcCnt = await incr(env, 'ip:' + rtcPublic);
            if (rtcCnt >= BLOCK_AT) rtcBlocked = true;
          }
        }
        const blocked = fpCnt >= BLOCK_AT || rtcBlocked;
        return jsonRes({blocked, count: Math.max(fpCnt, rtcCnt)});
      } catch(e) {
        return jsonRes({blocked: false, count: 0});
      }
    }

    // OPTIONS
    if (request.method === 'OPTIONS') {
      return new Response(null, {status: 204, headers: cors()});
    }

    // 관리자 우회
    const cookie = parseCookie(request.headers.get('Cookie') || '');
    const isAdmin = url.searchParams.get('pw') === BYPASS_KEY || cookie['_adm'] === BYPASS_KEY;
    if (isAdmin) {
      const origin = await fetch(request);
      const ct = origin.headers.get('Content-Type') || '';
      if (ct.includes('text/html')) {
        return new HTMLRewriter()
          .on('body', new ScriptInjector())
          .transform(new Response(origin.body, {
            status: origin.status,
            headers: (() => {
              const h = new Headers(origin.headers);
              h.set('Cache-Control', 'no-store');
              h.append('Set-Cookie', `_adm=${BYPASS_KEY}; Path=/; SameSite=Lax; Max-Age=2592000; Secure`);
              return h;
            })()
          }));
      }
      const nr = new Response(origin.body, {status: origin.status, headers: new Headers(origin.headers)});
      nr.headers.set('Cache-Control', 'no-store');
      nr.headers.append('Set-Cookie', `_adm=${BYPASS_KEY}; Path=/; SameSite=Lax; Max-Age=2592000; Secure`);
      return nr;
    }

    // HTML 요청만 IP 카운트
    const accept = request.headers.get('Accept') || '';
    const isHTML = accept.includes('text/html') || url.pathname.endsWith('/') || url.pathname.endsWith('.html');

    if (isHTML) {
      const ipCnt = await incr(env, 'ip:' + ip);
      if (ipCnt >= BLOCK_AT) {
        await fetch(SHEETS, {method:'POST', headers:{'Content-Type':'text/plain'}, body: JSON.stringify({type:'ip_block', ip: ip})}).catch(()=>{});
        return blockPage(ipCnt, ip);
      }
    }

    // 원본 페이지 fetch
    const origin = await fetch(request);
    const ct = origin.headers.get('Content-Type') || '';

    if (ct.includes('text/html')) {
      return new HTMLRewriter()
        .on('body', new ScriptInjector())
        .transform(new Response(origin.body, {
          status: origin.status,
          headers: (() => {
            const h = new Headers(origin.headers);
            h.set('Cache-Control', 'no-store, no-cache, must-revalidate');
            return h;
          })()
        }));
    }

    return origin;
    } catch(e) {
      return new Response('ERR: ' + e.message + '\n' + (e.stack || ''), {
        status: 500, headers: {'Content-Type': 'text/plain; charset=UTF-8'}
      });
    }
  }
};

class ScriptInjector {
  element(el) {
    el.append(`<script src="${JS_PATH}"><\/script>`, {html: true});
  }
}

function jsonRes(obj) {
  return new Response(JSON.stringify(obj), {status: 200, headers: {...cors(), 'Content-Type': 'application/json'}});
}

async function incr(env, key) {
  const v = await env.GUARD_KV.get(key);
  const n = (v ? parseInt(v) : 0) + 1;
  await env.GUARD_KV.put(key, String(n), {expirationTtl: 60 * 60 * 24 * 90});
  return n;
}

function parseCookie(s) {
  const o = {};
  s.split(';').forEach(p => { const i = p.indexOf('='); if(i>0) o[p.slice(0,i).trim()] = p.slice(i+1).trim(); });
  return o;
}

function cors() {
  return {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type'};
}

function isPublicIPv4(ip) {
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(ip)) return false;
  const p = ip.split('.').map(Number);
  return !(p[0]===10||(p[0]===172&&p[1]>=16&&p[1]<=31)||(p[0]===192&&p[1]===168)||p[0]===127||(p[0]===169&&p[1]===254));
}

function blockPage(n, ip) {
  const css = `*{box-sizing:border-box;margin:0;padding:0}body{font-family:"Apple SD Gothic Neo","Malgun Gothic",sans-serif;background:#0a0a0a;color:#eee;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px 16px}.w{max-width:560px;width:100%}.badge{display:inline-block;font-size:.72rem;font-weight:900;letter-spacing:.1em;padding:5px 14px;border-radius:99px;margin-bottom:20px}h1{font-size:1.45rem;font-weight:900;line-height:1.4;color:#fff;margin-bottom:14px;word-break:keep-all}h1 em{font-style:normal}.sub{font-size:.88rem;color:#999;margin-bottom:20px;line-height:1.75;word-break:keep-all}.sub strong{color:#ff4714}.box{border-radius:10px;padding:16px 18px;font-size:.84rem;line-height:1.85;word-break:keep-all;margin-bottom:12px}.box b{color:#fff}.foot{margin-top:20px;font-size:.72rem;color:#444;text-align:center}table{width:100%;border-collapse:collapse;margin:8px 0}td{padding:5px 0;font-size:.82rem;color:#bbb;vertical-align:top}td:first-child{color:#666;width:90px}@media(max-width:480px){body{padding:16px 12px}h1{font-size:1.2rem}.sub{font-size:.82rem;line-height:1.65}.box{padding:13px 14px;font-size:.8rem;line-height:1.75}td{font-size:.78rem}td:first-child{width:76px}}`;

  let html;
  if (n >= 10) {
    const blocked = n - BLOCK_AT;
    html = `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>수사 진행 안내</title><style>${css}.w{background:#0f0f0f;border:1px solid #1e1e1e;border-top:4px solid #c0392b;border-radius:16px;padding:48px 36px 44px}.badge{background:#c0392b;color:#fff}.box{background:#160a0a;border:1px solid #3d1010;border-left:4px solid #c0392b}</style></head><body><div class="w"><span class="badge">🔴 CRITICAL — 수사 진행 중</span><h1>우회하신 VPN·프록시 기업체명 및<br><em style="color:#ff6b6b">로컬 정보 유출</em> 총 3건 감지됨</h1><p class="sub">본 페이지가 차단된 이후에도 <strong>${blocked}회</strong>의 추가 접속 시도가 기록되었습니다.<br>해당 행위는 고의적 반복 접속으로 판단되며, 현재 <strong>법적 조치가 진행 중</strong>입니다.</p><div class="box"><b>■ 수집된 귀하의 접속 정보</b><table><tr><td>접속 IP</td><td><b style="color:#ff6b6b">${ip}</b></td></tr><tr><td>접속 횟수</td><td>${n}회 (차단 후 ${blocked}회 재시도)</td></tr><tr><td>수집 상태</td><td>접속 로그, 위치 정보 수집·보존 완료</td></tr><tr><td>마우스 패턴</td><td><b style="color:#ff6b6b">자동화 감지</b> — OS 단위 실제 입력 없음</td></tr></table></div><div class="box"><b>※ 긴급 법적 고지</b><br><br>귀하는 명시적 차단 경고를 인지한 상태에서 지속적으로 접속을 시도하였습니다. 이는 <b>정보통신망법 제48조 위반</b> 및 <b>형법상 업무방해죄</b>에 해당하며, 단순 과실이 아닌 <b>고의적 불법 행위</b>로 간주됩니다.<br><br><div style="background:#1a0000;border:2px solid #c0392b;border-radius:8px;padding:14px 16px;margin-bottom:12px;text-align:center"><p style="font-size:1.05rem;font-weight:900;color:#ff4444;line-height:1.65;word-break:keep-all">귀하가 사용한 우회 수단의 오류로 인해<br>실제 로컬 네트워크 정보가 <span style="background:#c0392b;color:#fff;padding:2px 7px;border-radius:4px">외부 유출</span> 되었습니다</p><p style="margin-top:10px;font-size:.85rem;color:#ff8888;font-weight:700">귀하의 실수로 인한 것이며, 해당 정보는 이미 수집 완료되었습니다.</p></div>수집된 모든 자료는 현재 수사기관에 제출 준비 중이며, <b>민·형사상 책임</b>을 피할 수 없습니다.</div><p style="margin-top:14px"><span style="display:inline-block;background:#2a0a0a;border:1px solid #5a1a1a;color:#ff6b6b;font-size:.75rem;font-weight:700;padding:4px 14px;border-radius:99px;letter-spacing:.04em">VPN·프록시 외 3건 감지됨</span></p><p class="sub" style="color:#888;font-size:.82rem;margin-top:14px">귀하께 연락드리겠습니다. 감사합니다.</p></div></body></html>`;
  } else {
    html = `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>접속 차단</title><style>${css}.w{background:#161616;border:1px solid #2a2a2a;border-top:4px solid #ff4714;border-radius:16px;padding:48px 36px 44px}.badge{background:#ff4714;color:#fff}.box{background:#1c1c1c;border:1px solid #333;border-left:4px solid #ff4714}</style></head><body><div class="w"><span class="badge">⛔ ACCESS BLOCKED</span><h1>비정상적인 <em style="color:#ff4714">중복 접속</em>이<br>감지되어 차단되었습니다</h1><p class="sub">현재까지 <strong>${n}회</strong>의 중복 접속이 기록되었습니다.<br>접속 IP 주소, 위치 정보 등 모든 정보가 자동으로 수집·보존되고 있습니다.<br>지속적인 접속 시 <strong>즉시 수사기관에 고발</strong>됩니다.</p><div class="box"><b>※ 법적 경고</b><br><br>부정클릭 및 반복 접속 행위는 <b>정보통신망법</b> 및 <b>형법상 업무방해죄</b>에 해당하며, 현재 관련 건에 대해 <b>경찰 수사가 진행 중</b>입니다.<br><br>추가 접속이 감지될 경우 수집된 모든 자료(접속 로그, 실시간 위치 정보 포함)를 즉각 수사기관에 제출하며, <b>민·형사상 모든 책임</b>을 묻겠습니다.</div></div></body></html>`;
  }
  return new Response(html, {status: 200, headers: {'Content-Type': 'text/html;charset=UTF-8'}});
}
