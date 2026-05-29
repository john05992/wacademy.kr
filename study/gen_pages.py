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
html = html.replace('/images_m/위치사진/사동.webp', '/images_m/위치사진/{{위치이미지}}.webp')
html = html.replace('/images/위치사진/사동.webp', '/images/위치사진/{{위치이미지}}.webp')

# ── 8. dyn-kw 동적 교체 지점 지정 ───────────────────────────────────
html = html.replace(
    '<h1><em>{{지역명}} {{메인키워드}}</em>',
    '<h1><em><span class="dyn-kw">{{지역명}} {{메인키워드}}</span></em>'
)
html = html.replace(
    '<h2 class="fact-title">{{지역명}} {{메인키워드}}</h2>',
    '<h2 class="fact-title">지금까지 학원</h2>'
)
html = html.replace(
    '<h2 class="fact-title"><span class="simple-underline">제대로 고르는 법</span></h2>',
    '<h2 class="fact-title"><span class="simple-underline">이거 체크하셨나요?</span></h2>'
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
html = html.replace(
    '<h2 class="planner-title">국영수 전문지도<br><em>학생만 보는 와와학원</em></h2>',
    '<h2 class="planner-title">학생에게 모든걸 맞춘<br><em>우리동네 와와학원</em></h2>'
)

# ── 9. GIF 섹션 삽입 (hook-section 이후, brand-section 이전) ────────
gif_css = """
    /* hook-section 하단 여백 축소 */
    .hook-section { padding-bottom: 40px !important; }
    .hook-or { filter: drop-shadow(0 0 14px rgba(255,80,20,0.55)); }
    /* 와와/wawa 쿼리 최상단 상담카드 */
    .consult-section--top { background:#0a0a0a !important; padding:72px 20px 80px !important; }
    /* result 이미지 PC 크기 제한 */
    @media(min-width:768px){
      .result-viewport { max-height:280px; }
      .result-track img { max-height:280px; width:auto; }
    }
    /* consult phone link */
    @keyframes phone-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,.4)} 50%{box-shadow:0 0 0 14px rgba(255,255,255,0)} }
    a.consult-num {
      text-decoration:none; display:inline-block;
      background:rgba(255,255,255,.15); border:2px solid rgba(255,255,255,.5);
      border-radius:99px; padding:10px 36px; margin:4px 0;
      transition:background .2s, transform .2s;
      animation:phone-pulse 2s infinite;
    }
    a.consult-num::before { content:'📞 '; font-size:.75em; }
    a.consult-num:hover { background:rgba(255,255,255,.25); transform:scale(1.04); }
    a.consult-num:active { transform:scale(.97); }
    .consult-avail { font-size:clamp(1.1rem,3.5vw,1.5rem); font-weight:700; color:#fff176; letter-spacing:-.01em; margin-bottom:0; }
    .consult-notice {
      font-size:clamp(1rem,3vw,1.25rem); font-weight:700; color:#fff;
      line-height:1.65; margin-top:20px; padding:16px 20px;
      background:rgba(0,0,0,.25); border-radius:12px;
      border-left:4px solid #fff176;
    }

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
    .student-review-section { background:#fff; padding:64px 20px 80px; }
    .sr-inner { max-width:980px; margin:0 auto; }
    .sr-eyebrow { font-size:.72rem; font-weight:900; color:#FF4714; letter-spacing:.14em; text-align:center; margin-bottom:10px; text-transform:uppercase; }
    .sr-title { font-size:clamp(1.55rem,4vw,2.1rem); font-weight:900; color:#111; text-align:center; letter-spacing:-.04em; margin-bottom:48px; }
    .sr-cards { display:flex; flex-direction:column; gap:32px; }
    @media(min-width:768px){ .sr-cards{ flex-direction:row; align-items:flex-start; gap:22px; } .sr-card{ flex:1; } }
    .sr-card { background:#fff; border-radius:20px; overflow:hidden; box-shadow:0 4px 28px rgba(0,0,0,0.09); border:1px solid #f0f0f0; }
    .sr-grade { background:linear-gradient(135deg,#1a1a1a,#333); color:#fff; font-size:clamp(1.05rem,3vw,1.35rem); font-weight:900; padding:18px 20px; letter-spacing:-.02em; text-align:center; }
    .sr-grade-arrow { background:linear-gradient(90deg,#FF4714,#f5af19); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; font-weight:900; margin:0 5px; }
    .sr-img { width:100%; display:block; object-fit:cover; max-height:200px; }
    @media(min-width:768px){ .sr-img { max-height:130px; } }
    .sr-body { padding:22px 20px 24px; display:flex; flex-direction:column; gap:0; }
    /* 학생 후기 블록 */
    .sr-review-block { padding-bottom:18px; border-bottom:1px solid #f0f0f0; margin-bottom:18px; }
    .sr-section-label { font-size:.78rem; font-weight:900; letter-spacing:.08em; text-transform:uppercase; margin-bottom:6px; display:flex; align-items:center; gap:6px; }
    .sr-section-label--review { color:#888; }
    .sr-section-label--fb { color:#FF4714; }
    .sr-section-label-dot { width:6px; height:6px; border-radius:50%; display:inline-block; flex-shrink:0; }
    .sr-section-label--review .sr-section-label-dot { background:#ccc; }
    .sr-section-label--fb .sr-section-label-dot { background:#FF4714; }
    .sr-student-name { font-size:.8rem; font-weight:700; color:#aaa; margin-bottom:10px; letter-spacing:.02em; }
    .sr-review-text { font-size:.84rem; font-weight:400; color:#666; line-height:1.85; }
    /* 선생님 피드백 블록 */
    .sr-feedback-block { background:#fafafa; border-radius:12px; padding:14px 16px; }
    .sr-feedback-text { font-size:.92rem; font-weight:700; color:#222; line-height:1.75; margin-top:8px; }
    .sr-hl { background:linear-gradient(90deg,#FF4714,#f5af19); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; font-style:normal; font-weight:900; }
"""

rec_css = """
    /* ── RECOMMEND ── */
    .rec-section { background:#fff; padding:72px 20px 80px; }
    .rec-inner { max-width:900px; margin:0 auto; }
    .rec-eyebrow { font-size:.72rem; font-weight:900; color:#FF4714; letter-spacing:.14em; text-align:center; margin-bottom:12px; text-transform:uppercase; }
    .rec-title { font-size:clamp(1.6rem,4vw,2.2rem); font-weight:900; color:#111; text-align:center; letter-spacing:-.04em; margin-bottom:48px; line-height:1.35; }
    .rec-cards { display:flex; flex-direction:column; gap:16px; }
    @media(min-width:640px){ .rec-cards{ flex-direction:row; gap:18px; } .rec-card{ flex:1; } }
    .rec-card { border-radius:20px; padding:28px 24px 26px; background:#fafafa; border:1px solid #f0f0f0; display:flex; flex-direction:column; gap:14px; position:relative; overflow:hidden; }
    .rec-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#FF4714,#f5af19); }
    .rec-num { font-size:2.6rem; font-weight:900; background:linear-gradient(135deg,#FF4714,#f5af19); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; line-height:1; letter-spacing:-.05em; }
    .rec-card-title { font-size:1.08rem; font-weight:900; color:#111; line-height:1.45; letter-spacing:-.02em; }
    .rec-card-desc { font-size:.83rem; color:#888; font-weight:400; line-height:1.75; flex:1; }
    .rec-check { font-size:.82rem; color:#444; font-weight:700; display:flex; align-items:center; gap:7px; background:#fff5f2; border-radius:8px; padding:8px 12px; }
    .rec-check::before { content:'✓'; color:#FF4714; font-weight:900; font-size:.9rem; flex-shrink:0; }
    .rec-footer { margin-top:44px; text-align:center; background:linear-gradient(135deg,#fff7f4,#fffdf0); border-radius:16px; padding:28px 24px; border:1px solid #fde8df; }
    .rec-footer-text { font-size:clamp(1rem,3vw,1.18rem); font-weight:700; color:#111; line-height:1.7; }
    .rec-footer-hl { background:linear-gradient(90deg,#FF4714,#f5af19); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; font-weight:900; }
"""

gif_css_combined = gif_css + sr_css + rec_css
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
    <h2 class="sr-title">중하위권 학생의<br>성적상승 비밀은?</h2>
    <div class="sr-cards">

      <div class="sr-card">
        <div class="sr-grade">5등급 <span class="sr-grade-arrow">→</span> 서울대 합격</div>
        <img src="/images/성적향상1.webp" alt="성적향상 사례1" class="sr-img" loading="lazy">
        <div class="sr-body">
          <div class="sr-review-block">
            <p class="sr-section-label sr-section-label--review"><span class="sr-section-label-dot"></span>학생 후기</p>
            <p class="sr-student-name">— 김O경 학생</p>
            <p class="sr-review-text"><em class="sr-hl">저만의 부족한 부분</em>을 정확히 짚어주시고<br>코칭해 주신 덕분에 5등급에서<br>고2 영어 내신 96~100점대로 유지했고,<br>수학도 90점을 넘겨 1등급을 여러번 받았어요<br>무엇보다 <em class="sr-hl">공부의 태도</em>가 달라졌어요</p>
          </div>
          <div class="sr-feedback-block">
            <p class="sr-section-label sr-section-label--fb"><span class="sr-section-label-dot"></span>선생님 피드백</p>
            <p class="sr-feedback-text">어휘가 부족해 <em class="sr-hl">독해법을 체계적 지도</em><br>수학은 <em class="sr-hl">고등 예습 + 중등 개념</em> 병행하며<br>암기보단 원리를 이해</p>
          </div>
        </div>
      </div>

      <div class="sr-card">
        <div class="sr-grade">영어 6등급 <span class="sr-grade-arrow">→</span> 1등급</div>
        <img src="/images/성적향상2.webp" alt="성적향상 사례2" class="sr-img" loading="lazy">
        <div class="sr-body">
          <div class="sr-review-block">
            <p class="sr-section-label sr-section-label--review"><span class="sr-section-label-dot"></span>학생 후기</p>
            <p class="sr-student-name">— 조O석 학생</p>
            <p class="sr-review-text">이전 시험은 6등급이였으나 1등급 받은<br>이번 시험으로 공부 자신감이 생겼어요!<br><em class="sr-hl">저에게 맞는 부분만</em> 건들여 주셔서 좋았어요.</p>
          </div>
          <div class="sr-feedback-block">
            <p class="sr-section-label sr-section-label--fb"><span class="sr-section-label-dot"></span>선생님 피드백</p>
            <p class="sr-feedback-text">문법 및 기본기 정리 후<br>내신·모고 <em class="sr-hl">선행비율을 5대5</em> 조정<br><em class="sr-hl">시험 2주전</em> 학교 기출 문제 집중 풀이</p>
          </div>
        </div>
      </div>

      <div class="sr-card">
        <div class="sr-grade">수학 28점 <span class="sr-grade-arrow">→</span> 43점 <span class="sr-grade-arrow">→</span> 80점</div>
        <img src="/images/성적향상3.webp" alt="성적향상 사례3" class="sr-img" loading="lazy">
        <div class="sr-body">
          <div class="sr-review-block">
            <p class="sr-section-label sr-section-label--review"><span class="sr-section-label-dot"></span>학생 후기</p>
            <p class="sr-student-name">— 이O현 학생</p>
            <p class="sr-review-text">이전에는 수학이 너무 막연하게 느껴졌는데<br><em class="sr-hl">일대일 지도</em>로 이해하기 쉽게 설명해주시고<br><em class="sr-hl">수행평가 관리</em>까지 해주셔서 점수가 올랐어요!<br>이제 문제가 풀리니까 재미도 있고<br>수학이 훨씬 쉽게 느껴집니다.</p>
          </div>
          <div class="sr-feedback-block">
            <p class="sr-section-label sr-section-label--fb"><span class="sr-section-label-dot"></span>선생님 피드백</p>
            <p class="sr-feedback-text"><em class="sr-hl">학생 수준에 맞는 진도 관리</em> 병행<br>수업일지로 <em class="sr-hl">전체적인 진도 계획</em> 수립 후<br>설명·과제 관리로 취약 부분 보완<br><em class="sr-hl">오답 분석 후 재평가</em> 실시</p>
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

# ── 과목별 커리큘럼 섹션 삽입 (COACHING CERTIFICATE 이후) ──────────
cur_css = """
    /* ── CURRICULUM ── */
    .cur-section { background:#111; padding:60px 20px 72px; }
    .cur-inner { max-width:900px; margin:0 auto; }
    .cur-eyebrow { font-size:.72rem; font-weight:900; color:#FF4714; letter-spacing:.14em; text-align:center; margin-bottom:12px; }
    .cur-title { font-size:clamp(1.4rem,3.5vw,1.9rem); font-weight:900; color:#fff; text-align:center; letter-spacing:-.04em; margin-bottom:36px; line-height:1.4; }
    .cur-title-sub { display:block; font-size:clamp(.9rem,2.5vw,1rem); font-weight:700; color:#bbb; letter-spacing:.04em; margin-bottom:8px; }
    .cur-title-main { display:block; background:linear-gradient(90deg,#FF4714,#f5af19); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
    .cur-tabs-wrap { margin-bottom:28px; }
    .cur-tabs { display:flex; gap:8px; justify-content:center; flex-wrap:wrap; padding:4px 0; }
    .cur-tab { background:transparent; border:1px solid #333; color:#888; font-size:.88rem; font-weight:700; padding:9px 28px; border-radius:99px; cursor:pointer; font-family:inherit; transition:all .2s; white-space:nowrap; }
    .cur-tab:hover { border-color:#555; color:#ccc; }
    .cur-tab.active { background:linear-gradient(90deg,#FF4714,#f5af19); border-color:transparent; color:#fff; }
    .cur-panel { display:none; }
    .cur-panel.active { display:grid; grid-template-columns:1fr; gap:14px; }
    @media(min-width:640px){ .cur-panel.active{ grid-template-columns:repeat(3,1fr); } }
    .cur-level { background:#1a1a1a; border-radius:14px; padding:18px 16px; border:1px solid #2a2a2a; }
    .cur-level-badge { display:inline-block; font-size:.68rem; font-weight:900; letter-spacing:.06em; padding:4px 12px; border-radius:99px; margin-bottom:14px; }
    .cur-level-badge--el { background:rgba(255,71,20,.15); color:#FF7A45; }
    .cur-level-badge--mid { background:rgba(245,175,25,.15); color:#f5af19; }
    .cur-level-badge--hi { background:rgba(255,255,255,.1); color:#ddd; }
    .cur-items { display:flex; flex-direction:column; gap:8px; }
    .cur-item { display:flex; gap:8px; align-items:flex-start; font-size:.83rem; line-height:1.55; color:#bbb; }
    .cur-item::before { content:'·'; color:#FF4714; font-weight:900; flex-shrink:0; margin-top:1px; }
    .cur-item strong { color:#fff; font-weight:700; }
"""

cur_html = """
<section class="cur-section">
  <div class="cur-inner">
    <p class="cur-eyebrow">CURRICULUM</p>
    <h2 class="cur-title">
      <span class="cur-title-sub">수준에 맞춰 변하는</span>
      <span class="cur-title-main">과목별 커리큘럼</span>
    </h2>
    <div class="cur-tabs-wrap"><div class="cur-tabs">
      <button class="cur-tab active" onclick="curSwitch(this,'cur-math')">수학</button>
      <button class="cur-tab" onclick="curSwitch(this,'cur-eng')">영어</button>
      <button class="cur-tab" onclick="curSwitch(this,'cur-kor')">국어</button>
      <button class="cur-tab" onclick="curSwitch(this,'cur-soc')">사회</button>
      <button class="cur-tab" onclick="curSwitch(this,'cur-sci')">과학</button>
    </div></div>
    <div class="cur-panels">

      <div class="cur-panel active" id="cur-math">
        <div class="cur-level">
          <span class="cur-level-badge cur-level-badge--el">초등</span>
          <div class="cur-items">
            <p class="cur-item">사칙연산 기초 ~ <strong>분수·소수 완전 이해</strong></p>
            <p class="cur-item">도형·측정 개념 정리 + <strong>문장제 풀이 훈련</strong></p>
            <p class="cur-item">수학적 사고력을 기르는 <strong>문제 해결 습관</strong> 구축</p>
          </div>
        </div>
        <div class="cur-level">
          <span class="cur-level-badge cur-level-badge--mid">중등</span>
          <div class="cur-items">
            <p class="cur-item">방정식·부등식·함수·통계 <strong>개념 이해 중심</strong> 진도</p>
            <p class="cur-item">기초 → 심화 단계별 설계, <strong>오답 패턴 반복 교정</strong></p>
            <p class="cur-item">내신 <strong>서술형 답안 구성법</strong> 집중 훈련</p>
          </div>
        </div>
        <div class="cur-level">
          <span class="cur-level-badge cur-level-badge--hi">고등</span>
          <div class="cur-items">
            <p class="cur-item">수Ⅰ·Ⅱ·미적분·확통 <strong>체계적 선행 + 심화</strong></p>
            <p class="cur-item">수능 기출 유형별 분석, <strong>고난도 풀이 전략</strong></p>
            <p class="cur-item">시험 2주 전 <strong>학교별 기출 집중</strong> + 서술형 대비</p>
          </div>
        </div>
      </div>

      <div class="cur-panel" id="cur-eng">
        <div class="cur-level">
          <span class="cur-level-badge cur-level-badge--el">초등</span>
          <div class="cur-items">
            <p class="cur-item">파닉스 → 기초 문법 → <strong>독해 흥미 유발</strong></p>
            <p class="cur-item"><strong>어휘 누적 암기 루틴</strong> 구축</p>
            <p class="cur-item">듣기·말하기 <strong>기초 감각 형성</strong></p>
          </div>
        </div>
        <div class="cur-level">
          <span class="cur-level-badge cur-level-badge--mid">중등</span>
          <div class="cur-items">
            <p class="cur-item">시제·관계사·수동태 등 <strong>문법 체계 완전 정리</strong></p>
            <p class="cur-item">내신 <strong>서술형·빈칸·어법</strong> 유형별 대비</p>
            <p class="cur-item">학교별 기출 분석 + <strong>어휘 전략 설계</strong></p>
          </div>
        </div>
        <div class="cur-level">
          <span class="cur-level-badge cur-level-badge--hi">고등</span>
          <div class="cur-items">
            <p class="cur-item">수능 독해 <strong>빈칸·순서·삽입 유형</strong> 집중 훈련</p>
            <p class="cur-item">모의고사 기출 + <strong>오답 패턴 분석·교정</strong></p>
            <p class="cur-item">내신·모고 <strong>선행비율 5대5</strong> 탄력 조정</p>
          </div>
        </div>
      </div>

      <div class="cur-panel" id="cur-kor">
        <div class="cur-level">
          <span class="cur-level-badge cur-level-badge--el">초등</span>
          <div class="cur-items">
            <p class="cur-item">받아쓰기·맞춤법 + <strong>문단 구조 이해</strong></p>
            <p class="cur-item">독서 습관 형성 + <strong>글쓰기 기초</strong> 훈련</p>
            <p class="cur-item"><strong>어휘력 확장</strong> 루틴 구축</p>
          </div>
        </div>
        <div class="cur-level">
          <span class="cur-level-badge cur-level-badge--mid">중등</span>
          <div class="cur-items">
            <p class="cur-item">문학(시·소설·수필) <strong>감상·분석 체계화</strong></p>
            <p class="cur-item">비문학 독해 + <strong>서술형 답안 작성법</strong></p>
            <p class="cur-item">학교별 <strong>국어 내신 기출 패턴</strong> 분석</p>
          </div>
        </div>
        <div class="cur-level">
          <span class="cur-level-badge cur-level-badge--hi">고등</span>
          <div class="cur-items">
            <p class="cur-item">화법·작문·언어·매체 <strong>파트별 전략</strong></p>
            <p class="cur-item">문학·독서 <strong>고빈도 개념 + 수능 기출</strong></p>
            <p class="cur-item"><strong>서술형·논술 답안</strong> 구조화 훈련</p>
          </div>
        </div>
      </div>

      <div class="cur-panel" id="cur-soc">
        <div class="cur-level">
          <span class="cur-level-badge cur-level-badge--el">초등</span>
          <div class="cur-items">
            <p class="cur-item">지역사회·역사 기초 <strong>이야기식 이해</strong></p>
            <p class="cur-item">지도·지형 기초 읽기 + <strong>핵심 개념 정리</strong></p>
            <p class="cur-item">생활 속 사회 개념 <strong>연결 훈련</strong></p>
          </div>
        </div>
        <div class="cur-level">
          <span class="cur-level-badge cur-level-badge--mid">중등</span>
          <div class="cur-items">
            <p class="cur-item">지리·역사·일반사회 <strong>단원별 핵심 정리</strong></p>
            <p class="cur-item">연표·개념도 활용 <strong>암기 전략</strong></p>
            <p class="cur-item">서술형 대비 <strong>핵심 키워드 추출법</strong></p>
          </div>
        </div>
        <div class="cur-level">
          <span class="cur-level-badge cur-level-badge--hi">고등</span>
          <div class="cur-items">
            <p class="cur-item">한국사·통합사회 <strong>체계적 개념 완성</strong></p>
            <p class="cur-item">수능 선택과목 <strong>기출 분석 + 반복</strong></p>
            <p class="cur-item"><strong>자료 해석 훈련</strong> + 암기 전략 설계</p>
          </div>
        </div>
      </div>

      <div class="cur-panel" id="cur-sci">
        <div class="cur-level">
          <span class="cur-level-badge cur-level-badge--el">초등</span>
          <div class="cur-items">
            <p class="cur-item">실험·관찰 개념 <strong>이야기식 이해</strong></p>
            <p class="cur-item">탐구 과정·관찰 기록 <strong>습관 훈련</strong></p>
            <p class="cur-item">생활 속 과학 원리 <strong>연결 학습</strong></p>
          </div>
        </div>
        <div class="cur-level">
          <span class="cur-level-badge cur-level-badge--mid">중등</span>
          <div class="cur-items">
            <p class="cur-item">물리·화학·생물·지구과학 <strong>단원 개념 완성</strong></p>
            <p class="cur-item"><strong>탐구 문제·실험 설계</strong> 유형 대비</p>
            <p class="cur-item">계산형 + 서술형 <strong>문제 유형 분리</strong> 훈련</p>
          </div>
        </div>
        <div class="cur-level">
          <span class="cur-level-badge cur-level-badge--hi">고등</span>
          <div class="cur-items">
            <p class="cur-item">선택과목 <strong>개념 + 문제풀이</strong> 체계 완성</p>
            <p class="cur-item">수능 기출 <strong>유형 분석 + 고난도 대비</strong></p>
            <p class="cur-item">암기 개념 vs 이해 개념 <strong>분리 학습 전략</strong></p>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>
<script>
function curSwitch(btn, id) {
  var tabs = btn.closest('.cur-inner').querySelectorAll('.cur-tab');
  var panels = btn.closest('.cur-inner').querySelectorAll('.cur-panel');
  tabs.forEach(function(t){ t.classList.remove('active'); });
  panels.forEach(function(p){ p.classList.remove('active'); });
  btn.classList.add('active');
  document.getElementById(id).classList.add('active');
}
</script>

"""

rec_html = """
<section class="rec-section">
  <div class="rec-inner">
    <p class="rec-eyebrow">FOR YOU</p>
    <h2 class="rec-title">이런 학생에게<br>추천해요</h2>
    <div class="rec-cards">

      <div class="rec-card">
        <p class="rec-num">01</p>
        <p class="rec-card-title">진도를 못<br>따라가는 학생</p>
        <p class="rec-card-desc">개념이 빠진 채로 진도를 나가면 결국 구멍이 쌓여 성적을 막습니다. 학생 수준에 맞게 다시 잡아드립니다.</p>
        <p class="rec-check">수준에 맞춘 개념 재정비</p>
      </div>

      <div class="rec-card">
        <p class="rec-num">02</p>
        <p class="rec-card-title">질문하기<br>어려웠던 학생</p>
        <p class="rec-card-desc">단체 수업에서는 모르는 걸 물어보기 어렵죠. 눈치 보며 넘어간 개념이 점수를 낮춥니다.</p>
        <p class="rec-check">언제든 편하게 질문할 수 있어요</p>
      </div>

      <div class="rec-card">
        <p class="rec-num">03</p>
        <p class="rec-card-title">공부방법을<br>모르는 학생</p>
        <p class="rec-card-desc">열심히 하는데 성적이 안 오른다면 방법이 잘못된 겁니다. 습관과 방법론부터 함께 바꿔드립니다.</p>
        <p class="rec-check">공부 방법 · 습관 코칭 병행</p>
      </div>

    </div>
    <div class="rec-footer">
      <p class="rec-footer-text">어떤 학생이든 <span class="rec-footer-hl">하나하나 꼼꼼히</span> 알려드려요</p>
    </div>
  </div>
</section>

"""

consult_html = """<section class="consult-section" id="consult">
  <div class="consult-box">
    <p class="consult-label">상담번호</p>
    <div class="consult-label-line"></div>
    <a href="tel:01039525815" class="consult-num">010-3952-5815</a>
    <div class="consult-divider"></div>
    <p class="consult-avail">문자·전화 24시 연중무휴 가능</p>
    <p class="consult-notice">전화 없이 방문하시면 상담이 어려울 수 있습니다</p>
  </div>
</section>"""

html = re.sub(
    r'<section class="consult-section" id="consult">.*?</section>',
    consult_html,
    html,
    flags=re.DOTALL
)

html = html.replace('</style>', cur_css + '\n  </style>')
html = html.replace(
    '\n\n<section class="planner-section">\n  <div class="planner-inner">\n    <p class="planner-eyebrow">ACADEMY LOCATION</p>',
    '\n\n' + cur_html + rec_html + '<section class="planner-section">\n  <div class="planner-inner">\n    <p class="planner-eyebrow">ACADEMY LOCATION</p>'
)

# ── 10. 학원목록.txt 파싱 → 폴더명 리스트 + 위치이미지 매핑 ────────
list_path = r"C:\Users\tlsdy\OneDrive\바탕 화면\와카데미\study\학원목록.txt"
with open(list_path, 'r', encoding='utf-8') as f:
    raw = f.readlines()

folders = []
folder_img = {}   # folder → col3 이미지명
current_img = ''
for line in raw:
    line = line.rstrip('\n')
    parts = line.split('\t')
    col2 = parts[1].strip() if len(parts) > 1 else ''
    col3 = parts[2].strip() if len(parts) > 2 else ''
    if col3:
        current_img = col3
    if col2:
        folders.append(col2)
        folder_img[col2] = current_img

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
  if (/와와|wawa/i.test(q)) {{
    var orig = document.getElementById('consult');
    if (orig) {{
      var clone = orig.cloneNode(true);
      clone.removeAttribute('id');
      clone.classList.add('consult-section--top');
      document.body.insertBefore(clone, document.body.firstChild);
    }}
  }}
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
    content = content.replace('{{위치이미지}}', folder_img.get(folder, ''))

    index_path = os.path.join(folder_path, 'index.html')
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(content)
    created += 1

print(f"완료: {created}개 index.html 생성")
