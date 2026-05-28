import os
import re
import json

# ── 1. 템플릿 읽기 ──────────────────────────────────────────────────
template_path = r"C:\Users\tlsdy\OneDrive\바탕 화면\와카데미\경상북도\경산시\경산사동\개별지도학원\index.html"
with open(template_path, 'r', encoding='utf-8') as f:
    html = f.read()

# ── 2. JSON-LD 전체 제거 ────────────────────────────────────────────
html = re.sub(
    r'\s*<script type="application/ld\+json">.*?</script>',
    '',
    html,
    flags=re.DOTALL
)

# ── 3. OG 메타태그 제거 ─────────────────────────────────────────────
html = re.sub(r'\s*<meta property="og:[^"]*"[^>]*/?>[ \t]*', '', html)

# ── 4. breadcrumb 제거 ──────────────────────────────────────────────
html = re.sub(r'\n?<nav class="breadcrumb"[^>]*>.*?</nav>', '', html, flags=re.DOTALL)

# ── 5. 섹션 제거: id="s1" 시작 ~ rv-section 닫는 </section> 까지 ───
start_marker = '<section class="sec sec-light" id="s1">'
end_marker   = '<section class="bottom-cta-section">'
s = html.find(start_marker)
e = html.find(end_marker)
if s != -1 and e != -1:
    html = html[:s] + html[e:]

# ── 6. 제목 <p> → <h2> 변환 ────────────────────────────────────────
title_classes = [
    'result-title', 'brand-name', 'brand-title',
    'fact-title',   'promise-title', 'hook-heading',
    'planner-title','comp-title',
]
for cls in title_classes:
    html = re.sub(
        rf'<p class="{cls}">(.*?)</p>',
        rf'<h2 class="{cls}">\1</h2>',
        html,
        flags=re.DOTALL
    )

# ── 7. 텍스트 플레이스홀더 치환 ─────────────────────────────────────
html = html.replace('경산사동', '{{지역명}}')
html = html.replace('개별지도학원', '{{메인키워드}}')
html = html.replace('WAWA COACHING ACADEMY', 'WAWA ACADEMY')

# ── 8. dyn-kw 동적 교체 지점 지정 ───────────────────────────────────
html = html.replace(
    '<h1><em>{{지역명}} {{메인키워드}}</em>',
    '<h1><em><span class="dyn-kw">{{지역명}} {{메인키워드}}</span></em>'
)
html = html.replace(
    '<h2 class="fact-title">{{지역명}} {{메인키워드}}</h2>',
    '<h2 class="fact-title"><span class="dyn-kw">{{지역명}} {{메인키워드}}</span></h2>'
)
html = re.sub(
    r'<h2 class="promise-title">{{지역명}} {{메인키워드}}<br><span>[^<]*</span></h2>',
    '<h2 class="promise-title">학원 고민이라면<br><span>이 세가지 확인해요</span></h2>',
    html
)
html = html.replace(
    '<p class="bot-heading"><em>{{지역명}} {{메인키워드}}</em>',
    '<p class="bot-heading"><em><span class="dyn-kw">{{지역명}} {{메인키워드}}</span></em>'
)

# ── 9. GIF 섹션 삽입 (hook-section 이후, brand-section 이전) ────────
gif_css = """
    /* hook-section 하단 여백 축소 */
    .hook-section { padding-bottom: 40px !important; }

    /* ── GIF BRIDGE ── */
    .gif-bridge-section {
      background: #fff;
      padding: 0 24px 48px;
      text-align: center;
    }
    .gif-bridge-inner {
      max-width: 440px;
      margin: 0 auto;
    }
    .gif-bridge-img {
      width: 100%;
      max-width: 440px;
      display: block;
      margin: 0 auto;
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.14);
    }
    @media (min-width: 768px) {
      .gif-bridge-inner { max-width: 660px; }
      .gif-bridge-img { max-width: 660px; }
    }
    .gif-bridge-caption {
      font-size: clamp(1.5rem, 5.5vw, 2rem);
      font-weight: 900;
      background: linear-gradient(90deg, #FF4714, #f5af19);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -.04em;
      margin-top: 28px;
      line-height: 1.35;
      position: relative;
      display: inline-block;
    }
    .gif-bridge-caption::after {
      content: '';
      display: block;
      width: 48px;
      height: 4px;
      background: #FF4714;
      border-radius: 2px;
      margin: 10px auto 0;
    }
"""
html = html.replace('</style>', gif_css + '\n  </style>')

gif_html = """
<section class="gif-bridge-section">
  <div class="gif-bridge-inner">
    <img src="/images/공부.gif" alt="공부 이미지" class="gif-bridge-img" loading="lazy">
    <p class="gif-bridge-caption">세가지를 모두 갖춘 학원</p>
  </div>
</section>

"""
html = html.replace(
    '\n\n<section class="brand-section">',
    '\n\n' + gif_html + '<section class="brand-section">'
)

# ── 10. 학원목록.txt 파싱 → 폴더명 리스트 ─────────────────────────
list_path = r"C:\Users\tlsdy\OneDrive\바탕 화면\와카데미\study\학원목록.txt"
with open(list_path, 'r', encoding='utf-8') as f:
    raw = f.readlines()

folders = []
for line in raw:
    line = line.rstrip('\n')
    if '\t' in line:
        col2 = line.split('\t', 1)[1].strip()
    else:
        col2 = ''
    if col2:
        folders.append(col2)

print(f"폴더 수: {len(folders)}")

# ── 11. 지역 키워드 리스트 (길이 내림차순) ─────────────────────────
unique_keywords = sorted(set(folders), key=lambda x: len(x), reverse=True)
kw_json = json.dumps(unique_keywords, ensure_ascii=False)

# ── 12. n_query JS 스크립트 삽입 ───────────────────────────────────
dyn_script = f"""
<script>
(function(){{
  var kws = {kw_json};
  var q = new URLSearchParams(location.search).get('n_query');
  if (!q) return;
  for (var i = 0; i < kws.length; i++) {{
    var kw = kws[i];
    if (q.length > kw.length && q.indexOf(kw) === 0) {{
      q = kw + ' ' + q.slice(kw.length);
      break;
    }}
  }}
  document.querySelectorAll('.dyn-kw').forEach(function(el){{
    el.textContent = q;
  }});
}})();
</script>
"""
html = html.replace('</body>', dyn_script + '</body>')

# ── 13. 442개 폴더 + index.html 생성 ──────────────────────────────
study_dir = r"C:\Users\tlsdy\OneDrive\바탕 화면\와카데미\study"
created = 0
for folder in folders:
    folder_path = os.path.join(study_dir, folder)
    os.makedirs(folder_path, exist_ok=True)

    content = html.replace('{{지역명}}', folder)
    content = content.replace('{{메인키워드}}', '개별지도학원')

    index_path = os.path.join(folder_path, 'index.html')
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(content)
    created += 1

print(f"완료: {created}개 index.html 생성")
