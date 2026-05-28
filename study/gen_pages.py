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
sr_css = """
    /* ── STUDENT REVIEWS ── */
    .student-review-section { background: #fff; padding: 60px 24px 72px; }
    .sr-inner { max-width: 960px; margin: 0 auto; }
    .sr-eyebrow { font-size:.75rem; font-weight:700; color:#FF4714; letter-spacing:.1em; text-align:center; margin-bottom:8px; }
    .sr-title { font-size:clamp(1.5rem,4vw,2rem); font-weight:900; color:#111; text-align:center; letter-spacing:-.03em; margin-bottom:40px; }
    .sr-cards { display:flex; flex-direction:column; gap:28px; }
    @media(min-width:768px){ .sr-cards{ flex-direction:row; align-items:flex-start; gap:20px; } .sr-card{ flex:1; } }
    .sr-card { background:#f8f8f8; border-radius:16px; overflow:hidden; box-shadow:0 2px 18px rgba(0,0,0,0.07); }
    .sr-grade { background:#111; color:#fff; font-size:clamp(.88rem,2.2vw,1rem); font-weight:900; padding:14px 18px; letter-spacing:-.02em; text-align:center; }
    .sr-grade-arrow { background:linear-gradient(90deg,#FF4714,#f5af19); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; font-weight:900; margin:0 4px; }
    .sr-img { width:100%; display:block; object-fit:cover; max-height:190px; }
    .sr-body { padding:18px 16px; display:flex; flex-direction:column; gap:14px; }
    .sr-tag { display:inline-block; font-size:.67rem; font-weight:700; letter-spacing:.06em; border-radius:99px; padding:3px 10px; margin-bottom:7px; color:#999; border:1px solid #ddd; }
    .sr-tag--fb { color:#FF4714; border-color:rgba(255,71,20,.4); }
    .sr-review-text { font-size:.82rem; font-weight:300; color:#666; line-height:1.75; }
    .sr-feedback-text { font-size:.93rem; font-weight:700; color:#111; line-height:1.65; }
    .sr-hl { background:linear-gradient(90deg,#FF4714,#f5af19); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; font-style:normal; font-weight:700; }
"""

gif_css_combined = gif_css + sr_css
html = html.replace('</style>', gif_css_combined + '\n  </style>')

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

sr_html = """
<section class="student-review-section">
  <div class="sr-inner">
    <p class="sr-eyebrow">REAL RESULT</p>
    <h2 class="sr-title">실제 학생 성과</h2>
    <div class="sr-cards">

      <div class="sr-card">
        <div class="sr-grade">5등급 <span class="sr-grade-arrow">→</span> 서울대 합격</div>
        <img src="/images/성적향상1.jpg" alt="성적향상 사례1" class="sr-img" loading="lazy">
        <div class="sr-body">
          <div>
            <span class="sr-tag">학생 후기</span>
            <p class="sr-review-text">와와 다니기 전 5등급였지만 선생님들께서 <em class="sr-hl">저만의 부족한 부분</em>을 정확히 짚어주시고, 코칭해 주신 덕분에 성적이 점차 오르기 시작했습니다. 고2 때부터는 영어 내신을 96~100점대로 유지했고, 모의고사도 2등급까지 올릴 수 있었습니다. 수학도 90점을 넘기며 1등급을 여러 차례 받을 수 있었습니다. 무엇보다 좋았던 점은 단순히 성적만 오른 것이 아니라 <em class="sr-hl">공부를 대하는 태도 자체</em>가 달라졌다는 것입니다.</p>
          </div>
          <div>
            <span class="sr-tag sr-tag--fb">선생님 피드백</span>
            <p class="sr-feedback-text">영어는 어휘가 부족해 <em class="sr-hl">독해 방법을 체계적</em>으로 지도했고 수학은 고등 예습과 함께 중등 개념을 병행하면서, 공식암기 보단 <em class="sr-hl">원리를 이해하는 방식</em>으로 지도</p>
          </div>
        </div>
      </div>

      <div class="sr-card">
        <div class="sr-grade">영어 6등급 <span class="sr-grade-arrow">→</span> 1등급</div>
        <img src="/images/성적향상2.jpg" alt="성적향상 사례2" class="sr-img" loading="lazy">
        <div class="sr-body">
          <div>
            <span class="sr-tag">학생 후기</span>
            <p class="sr-review-text">이전 시험은 6등급이였으나 이번 시험으로 내신이나 모의고사에서도 자신감이 생겼습니다! <em class="sr-hl">저에게 맞는 부분만</em> 건들여 주셔서 좋았어요. 사회만 2등급이고 전 과목 1등급을 받아 더욱 자부심이 생긴 것 같습니다.</p>
          </div>
          <div>
            <span class="sr-tag sr-tag--fb">선생님 피드백</span>
            <p class="sr-feedback-text"><em class="sr-hl">문법과 모의고사</em>로 기본기 정리 및 내신과 모고 <em class="sr-hl">선행비율을 5대5</em> 조정하여 <em class="sr-hl">시험 2주전</em>부터는 학교의 기출 문제를 많이 풀게 했음</p>
          </div>
        </div>
      </div>

      <div class="sr-card">
        <div class="sr-grade">수학 28점 <span class="sr-grade-arrow">→</span> 43점 <span class="sr-grade-arrow">→</span> 80점</div>
        <img src="/images/성적향상3.jpg" alt="성적향상 사례3" class="sr-img" loading="lazy">
        <div class="sr-body">
          <div>
            <span class="sr-tag">학생 후기</span>
            <p class="sr-review-text">이전에는 수학이 너무 막연하게만 느껴졌는데, <em class="sr-hl">일대일 지도</em>로 선생님이 이해하기 쉽게 설명해주시고, <em class="sr-hl">수행평가 관리</em>까지 해주셔서 점수가 오른 것 같아요! 이제 문제가 풀리니까 재미도 있고, 이전에 비해 수학이 훨씬 쉽게 느껴집니다.</p>
          </div>
          <div>
            <span class="sr-tag sr-tag--fb">선생님 피드백</span>
            <p class="sr-feedback-text">꼼꼼한 관리 및 <em class="sr-hl">수준에 맞는 진도 관리</em>를 병행함. 수업일지로 <em class="sr-hl">전체적인 진도 계획</em>을 설정 후 설명과 과제 관리로 취약 부분을 보완했고 <em class="sr-hl">오답 분석 후 재평가</em>를 실시</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

"""
html = html.replace(
    '\n\n<section class="result-section">',
    '\n\n' + sr_html + '<section class="result-section">'
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
