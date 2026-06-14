const fs = require('fs');
const path = require('path');

const studyDir  = 'C:/Users/tlsdy/OneDrive/바탕 화면/와카데미/study';
const dangunDir = 'C:/Users/tlsdy/OneDrive/바탕 화면/와카데미/당근';
const tplDir    = path.join(studyDir, 'templates');

// 1. templates 폴더 생성 + 4개 틀 복사
if (!fs.existsSync(tplDir)) fs.mkdirSync(tplDir);
for (const tpl of ['고등틀.html','중등틀.html','초등틀.html','일반틀.html']) {
  fs.copyFileSync(path.join(dangunDir, tpl), path.join(tplDir, tpl));
}
console.log('템플릿 복사 완료 →', tplDir);

// 2. 각 study HTML에 디스패처 삽입
function walk(dir) {
  let r = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) r = r.concat(walk(full));
    else if (f === 'index.html') r.push(full);
  }
  return r;
}

const HIDE_TAG   = '<style id="__wga_hide">html{visibility:hidden}</style>';
const DISPATCHER = `<script>
(function(){
  var s=document.getElementById('__wga_hide');
  var q=new URLSearchParams(location.search).get('n_query');
  if(!q){if(s)s.remove();return;}
  var kw=decodeURIComponent(q);
  var tpl;
  if(/와와/.test(kw))tpl='일반틀';
  else if(/고등|고1|고2|고3|고등학생/.test(kw))tpl='고등틀';
  else if(/중학생|중등|중1|중2|중3/.test(kw))tpl='중등틀';
  else if(/초등|초등학생|초1|초2|초3|초4|초5|초6/.test(kw))tpl='초등틀';
  else tpl='일반틀';
  fetch('/study/templates/'+tpl+'.html')
    .then(function(r){return r.text();})
    .then(function(html){
      var loc='__LOC__';var photo='__PHOTO__';var m1='['+'\\uC9C0\\uC5ED\\uD0A4\\uC6CC\\uB4DC'+']';var m2='['+'\\uC704\\uCE58\\uC0AC\\uC9C4\\uBA85'+']';html=html.split(m1).join(loc).split(m2).join(photo);
      if(/와와/.test(kw)){var cm=html.match(/<section[^>]*id="consult"[^>]*>[\\s\\S]*?<\\/section>/);if(cm){var ch='<div id="wawa-hero"><style>#wawa-hero{padding:100px 20px 56px;text-align:center}#wawa-hero .c3-section{background:transparent!important;padding:0}#wawa-hero .c3-img{display:none}#wawa-hero .c3-num{color:#fff!important}#wawa-ttl{font-size:26px;font-weight:800;color:#fff;margin:0 0 20px;line-height:1.4}</style><p id="wawa-ttl">'+loc+' 와와학원</p>'+cm[0]+'</div>';html=html.replace(/<body[^>]*>/,function(m){return m+ch;});}}
      document.open();document.write(html);document.close();
    })
    .catch(function(){if(s)s.remove();});
})();
</script>`;

const ANCHOR = '<meta charset="UTF-8">';
const files = walk(studyDir).filter(f => !f.includes('/templates/'));
let changed = 0, skip = 0;

for (const f of files) {
  const loc   = path.basename(path.dirname(f)); // 폴더명 = 지역키워드
  let content = fs.readFileSync(f, 'utf8');

  // 이미 삽입된 경우 → 기존 블록 전부 제거 후 재삽입 (style+script 또는 script 단독 모두 제거)
  let prev;
  do {
    prev = content;
    content = content.replace(/<style id="__wga_hide">[\s\S]*?<\/script>\n?/, '');
    content = content.replace(/<script>[\s\S]*?getElementById\('__wga_hide'\)[\s\S]*?<\/script>\n?/, '');
  } while (content !== prev);

  // 위치사진명 추출
  const photoMatch = content.match(/\/images\/위치사진\/([^"']+)\.webp/);
  const photo = photoMatch ? photoMatch[1] : loc;

  // 디스패처 문자열에 loc/photo 실제값 치환
  const dispatcher = DISPATCHER
    .replace('__LOC__', loc.replace(/'/g, "\\'"))
    .replace('__PHOTO__', photo.replace(/'/g, "\\'"));

  // charset 태그 바로 뒤에 삽입
  const newContent = content.replace(
    ANCHOR,
    ANCHOR + '\n' + HIDE_TAG + '\n' + dispatcher
  );

  if (newContent !== content) {
    fs.writeFileSync(f, newContent, 'utf8');
    changed++;
  }
}

console.log(`완료: ${changed}개 수정, ${skip}개 이미 삽입됨`);
