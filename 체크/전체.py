# -*- coding: utf-8 -*-
"""
전체.py
=======
학원목록.txt + 메인학원키워드.txt 기반으로 레벨1~4 index.html 전체 생성

레벨 구조:
  레벨1: 와카데미/{도}/index.html
         지역키워드=도, 메인키워드=학원
         result: 본문뽑기/아카데미/{도}/학원/result.html

  레벨2: 와카데미/{도}/{시구}/index.html
         지역키워드=시구, 메인키워드=학원
         result: 본문뽑기/아카데미/{도}/{시구}/학원/result.html

  레벨3: 와카데미/{도}/{시구}/{동}/index.html
         지역키워드=동, 메인키워드=학원
         result: 본문뽑기/아카데미/{도}/{시구}/{동}/학원/result.html

  레벨4: 와카데미/{도}/{시구}/{동}/{메인}/index.html
         지역키워드=동, 메인키워드=각 키워드
         result: 본문뽑기/아카데미/{도}/{시구}/{동}/{메인}/result.html

사용법:
  python 전체.py              # 전체 생성
  python 전체.py --dry-run    # 경로만 출력, 파일 생성 안 함
"""

import os, sys, json, random, argparse

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR     = os.path.dirname(os.path.abspath(__file__))   # 체크/
WACADEMY_DIR = os.path.dirname(BASE_DIR)                    # 와카데미/
BONMUN_DIR   = os.path.join(os.path.dirname(WACADEMY_DIR), '본문뽑기')

TEMPLATE     = os.path.join(BASE_DIR, '틀.html')
ACADEMY_LIST = os.path.join(WACADEMY_DIR, '학원목록.txt')
KEYWORD_LIST = os.path.join(WACADEMY_DIR, '메인학원키워드.txt')
REVIEW_BASE  = os.path.join(BONMUN_DIR, '아카데미', '리뷰')
RESULT_BASE  = os.path.join(BONMUN_DIR, '아카데미')

MAIN_FIXED   = '학원'  # 레벨1~3 고정 메인키워드

# ── 키워드 분류 ──────────────────────────────────────────────────────────
GRADE_GROUPS = [
    ('고등학생', ['고등']),
    ('중학생',   ['중등', '중학생']),
    ('초등학생', ['초등', '초등학생']),
]

def classify_keywords(keywords):
    groups = {'학원성격': [], '고등학생': [], '중학생': [], '초등학생': []}
    for kw in keywords:
        matched = None
        for group_name, words in GRADE_GROUPS:
            if any(w in kw for w in words):
                matched = group_name
                break
        groups[matched or '학원성격'].append(kw)
    return groups


# ── 데이터 로드 ─────────────────────────────────────────────────────────

def load_dong_map():
    """학원목록.txt → {동명: (도, 시구, 지점명, 위치사진)}"""
    dong_map = {}
    cur_do = cur_si = cur_branch = cur_photo = ''
    with open(ACADEMY_LIST, encoding='utf-8') as f:
        for line in f:
            parts = line.rstrip('\n').split('\t')
            if parts[0].strip():
                cur_do     = parts[0].strip()
                cur_si     = parts[1].strip() if len(parts) > 1 else ''
                cur_branch = parts[2].strip() if len(parts) > 2 else ''
                cur_photo  = parts[4].strip() if len(parts) > 4 else ''
            dong     = parts[3].strip() if len(parts) > 3 else ''
            위치사진 = parts[4].strip() if len(parts) > 4 else cur_photo
            if dong:
                dong_map[dong] = (cur_do, cur_si, cur_branch, 위치사진)
    return dong_map


def load_keywords():
    with open(KEYWORD_LIST, encoding='utf-8') as f:
        return [l.strip() for l in f if l.strip()]


def review_stream():
    """리뷰 폴더를 순서대로 열어 한 줄씩 yield"""
    if not os.path.isdir(REVIEW_BASE):
        return
    folders = sorted(
        [d for d in os.listdir(REVIEW_BASE)
         if os.path.isdir(os.path.join(REVIEW_BASE, d)) and d.isdigit()],
        key=int
    )
    for folder in folders:
        folder_path = os.path.join(REVIEW_BASE, folder)
        files = sorted(
            [f for f in os.listdir(folder_path) if f.endswith('.txt')],
            key=lambda x: int(x.replace('.txt', ''))
        )
        for fname in files:
            with open(os.path.join(folder_path, fname), encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line:
                        yield line


def next_reviews(stream, n=6):
    """스트림에서 n개 가져옴. 부족하면 빈 문자열로 채움"""
    result = []
    for _ in range(n):
        try:
            result.append(next(stream))
        except StopIteration:
            result.append('')
    return result


def load_json(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def safe(val):
    return val if val else ''


# ── 브레드크럼 빌더 ─────────────────────────────────────────────────────

def build_breadcrumb(items):
    """
    items: [('홈', '/'), ('경기도', '/경기도/'), ('하남시', None)]
    마지막 항목은 링크 없이 current로 표시
    """
    ld_items = []
    for i, (name, url) in enumerate(items, 1):
        entry = {'@type': 'ListItem', 'position': i, 'name': name}
        if url:
            entry['item'] = {'@type': 'Thing', '@id': f'https://wacademy.kr{url}'}
        ld_items.append(entry)
    jsonld = f'<script type="application/ld+json">{{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":{__import__("json").dumps(ld_items, ensure_ascii=False)}}}</script>'

    parts = []
    for i, (name, url) in enumerate(items):
        if i < len(items) - 1:
            parts.append(f'<a href="{url}" class="breadcrumb-link">{name}</a><span class="breadcrumb-sep">/</span>')
        else:
            parts.append(f'<span class="breadcrumb-current">{name}</span>')
    nav = f'<nav class="breadcrumb" aria-label="breadcrumb">{"".join(parts)}</nav>'

    return jsonld, nav


# ── 링크 섹션 빌더 ──────────────────────────────────────────────────────

def build_link_section_lv1(do_nm, si_list):
    """레벨1: 도 → 시구 링크"""
    items = ''.join(
        f'<a href="/{do_nm}/{si}/" class="lk-item">{si}</a>'
        for si in si_list
    )
    return f'''
<nav class="lk-section" aria-label="지역별 정보">
  <div class="sec-inner">
    <span class="lk-eyebrow">지역별 정보</span>
    <h2>{do_nm} 상세정보</h2>
    <div class="lk-group">
      <div class="lk-grid">{items}</div>
    </div>
  </div>
</nav>'''


def build_link_section_lv2(do_nm, si_nm, dong_list):
    """레벨2: 시구 → 동 링크"""
    items = ''.join(
        f'<a href="/{do_nm}/{si_nm}/{dong}/" class="lk-item">{dong}</a>'
        for dong in dong_list
    )
    return f'''
<nav class="lk-section" aria-label="동별 정보">
  <div class="sec-inner">
    <span class="lk-eyebrow">동별 정보</span>
    <h2>{si_nm} 상세정보</h2>
    <div class="lk-group">
      <div class="lk-grid">{items}</div>
    </div>
  </div>
</nav>'''


def build_link_section_lv3(do_nm, si_nm, dong, keywords):
    """레벨3: 동 → 키워드 그룹별 링크 (result.html 있는 것만)"""
    groups = classify_keywords(keywords)
    group_order = ['학원성격', '고등학생', '중학생', '초등학생']
    group_label = {
        '학원성격': '학원 성격',
        '고등학생': '고등학생',
        '중학생':   '중학생',
        '초등학생': '초등학생',
    }

    group_blocks = ''
    for g in group_order:
        kws = groups.get(g, [])
        if not kws:
            continue
        valid = [
            kw for kw in kws
            if os.path.exists(os.path.join(RESULT_BASE, do_nm, si_nm, dong, kw, 'result.html'))
        ]
        if not valid:
            continue
        items = ''.join(
            f'<a href="/{do_nm}/{si_nm}/{dong}/{kw}/" class="lk-item">{kw}</a>'
            for kw in valid
        )
        group_blocks += f'''
    <div class="lk-group">
      <p class="lk-h3">{group_label[g]}</p>
      <div class="lk-grid">{items}</div>
    </div>'''

    if not group_blocks:
        return ''

    return f'''
<nav class="lk-section" aria-label="유형별 정보">
  <div class="sec-inner">
    <span class="lk-eyebrow">유형별 정보</span>
    <h2>{dong} 상세정보</h2>
    {group_blocks}
  </div>
</nav>'''


# ── 치환 ────────────────────────────────────────────────────────────────

def build_page(template, data, reviews, 지역, 메인, 위치사진='', 링크섹션='', 상위링크='/', breadcrumb_jsonld='', breadcrumb_nav=''):
    html = template

    html = html.replace('{{breadcrumb_jsonld}}', breadcrumb_jsonld)
    html = html.replace('{{breadcrumb_nav}}',    breadcrumb_nav)
    html = html.replace('{{링크섹션}}',    링크섹션)
    html = html.replace('{{상위링크}}',    상위링크)
    html = html.replace('{{위치사진_enc}}', 위치사진.replace(' ', '%20'))
    html = html.replace('{{위치사진}}',     위치사진)
    html = html.replace('{{지역키워드}}',   지역)
    html = html.replace('{{메인키워드}}',   메인)
    html = html.replace('{{meta}}',         safe(data.get('meta')))

    s1 = data.get('section1', {})
    html = html.replace('{{section1_h2}}', safe(s1.get('h2')))
    html = html.replace('{{section1_p}}',  safe(s1.get('p')))

    s2 = data.get('section2', {})
    html = html.replace('{{section2_h2}}', safe(s2.get('h2')))
    html = html.replace('{{section2_p}}',  safe(s2.get('p')))
    for i, item in enumerate(s2.get('list', [])):
        html = html.replace(f'{{{{section2_list_{i}}}}}', safe(item))

    s3 = data.get('section3', {})
    html = html.replace('{{section3_h2}}', safe(s3.get('h2')))
    html = html.replace('{{section3_p}}',  safe(s3.get('p')))
    for i, item in enumerate(s3.get('list', [])):
        html = html.replace(f'{{{{section3_list_{i}}}}}', safe(item))
    for i, row in enumerate(s3.get('table', [])):
        html = html.replace(f'{{{{section3_table_{i}_항목}}}}', safe(row.get('항목')))
        html = html.replace(f'{{{{section3_table_{i}_내용}}}}', safe(row.get('내용')))

    s4 = data.get('section4', {})
    html = html.replace('{{section4_h2}}', safe(s4.get('h2')))
    html = html.replace('{{section4_p}}',  safe(s4.get('p')))
    for i, item in enumerate(s4.get('list', [])):
        html = html.replace(f'{{{{section4_list_{i}}}}}', safe(item))

    s5 = data.get('section5', {})
    html = html.replace('{{section5_h2}}', safe(s5.get('h2')))
    html = html.replace('{{section5_p}}',  safe(s5.get('p')))
    for i, row in enumerate(s5.get('table', [])):
        html = html.replace(f'{{{{section5_table_{i}_구분}}}}', safe(row.get('구분')))
        html = html.replace(f'{{{{section5_table_{i}_대상}}}}', safe(row.get('대상')))
        html = html.replace(f'{{{{section5_table_{i}_내용}}}}', safe(row.get('내용')))

    s6 = data.get('section6', {})
    html = html.replace('{{section6_h2}}', safe(s6.get('h2')))
    html = html.replace('{{section6_p}}',  safe(s6.get('p')))

    s7 = data.get('section7', {})
    html = html.replace('{{section7_h2}}', safe(s7.get('h2')))
    html = html.replace('{{section7_p}}',  safe(s7.get('p')))
    for i, item in enumerate(s7.get('list', [])):
        html = html.replace(f'{{{{section7_list_{i}}}}}', safe(item))

    for i, faq in enumerate(data.get('section8', {}).get('faq', [])):
        html = html.replace(f'{{{{section8_faq_{i}_q}}}}', safe(faq.get('q')))
        html = html.replace(f'{{{{section8_faq_{i}_a}}}}', safe(faq.get('a')))

    for i, rv in enumerate(reviews):
        html = html.replace(f'{{{{rv_{i}}}}}', rv)

    html = html.replace('>학원명<', '>기관명<')

    return html


# ── 생성 핵심 함수 ───────────────────────────────────────────────────────

def generate(지역, 메인, result_path, out_dir, template, 위치사진='', 링크섹션='', 상위링크='/', reviews=None, bc_items=None, dry_run=False):
    """
    result.html 존재 시 index.html 생성. 없으면 스킵(False 반환).
    """
    if not os.path.exists(result_path):
        return False

    out_path = os.path.join(out_dir, 'index.html')

    if dry_run:
        print(f'[DRY] {out_path}')
        print(f'       ← {result_path}')
        return True

    os.makedirs(out_dir, exist_ok=True)
    data = load_json(result_path)
    bc_jsonld, bc_nav = build_breadcrumb(bc_items or [('홈', '/')])
    html = build_page(template, data, reviews or [], 지역, 메인, 위치사진, 링크섹션, 상위링크, bc_jsonld, bc_nav)

    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(html)

    print(f'[OK] {out_path}')
    return True


# ── 메인 ────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true',
                        help='파일 생성 없이 경로만 출력')
    args = parser.parse_args()

    dong_map = load_dong_map()
    keywords = load_keywords()

    with open(TEMPLATE, encoding='utf-8') as f:
        template = f.read()

    rv_stream = review_stream()

    # 링크섹션용 맵 사전 구축
    do_si_map   = {}   # {도: [시구, ...]}
    si_dong_map = {}   # {(도, 시구): [동, ...]}
    for dong, (do_nm, si_nm, _, _) in dong_map.items():
        do_si_map.setdefault(do_nm, [])
        if si_nm not in do_si_map[do_nm]:
            do_si_map[do_nm].append(si_nm)
        key = (do_nm, si_nm)
        si_dong_map.setdefault(key, [])
        if dong not in si_dong_map[key]:
            si_dong_map[key].append(dong)

    ok = skip = 0

    # 중복 생성 방지용 집합
    done_lv1 = set()          # {도}
    done_lv2 = set()          # {(도, 시구)}
    done_lv3 = set()          # {(도, 시구, 동)}

    for dong, (do_nm, si_nm, branch, 위치사진) in dong_map.items():

        # ── 레벨1: 와카데미/{도}/index.html ─────────────────────────────
        if do_nm not in done_lv1:
            done_lv1.add(do_nm)
            r_path  = os.path.join(RESULT_BASE, do_nm, 'result.html')
            out_dir = os.path.join(WACADEMY_DIR, do_nm)
            lk = build_link_section_lv1(do_nm, do_si_map.get(do_nm, []))
            bc = [('홈', '/'), (do_nm, None)]
            r = generate(do_nm, MAIN_FIXED, r_path, out_dir, template, '', lk, '/', next_reviews(rv_stream), bc, args.dry_run)
            ok += r; skip += not r

        # ── 레벨2: 와카데미/{도}/{시구}/index.html ──────────────────────
        if (do_nm, si_nm) not in done_lv2:
            done_lv2.add((do_nm, si_nm))
            r_path  = os.path.join(RESULT_BASE, do_nm, si_nm, 'result.html')
            out_dir = os.path.join(WACADEMY_DIR, do_nm, si_nm)
            lk = build_link_section_lv2(do_nm, si_nm, si_dong_map.get((do_nm, si_nm), []))
            bc = [('홈', '/'), (do_nm, f'/{do_nm}/'), (si_nm, None)]
            r = generate(si_nm, MAIN_FIXED, r_path, out_dir, template, '', lk, f'/{do_nm}/', next_reviews(rv_stream), bc, args.dry_run)
            ok += r; skip += not r

        # ── 레벨3: 와카데미/{도}/{시구}/{동}/index.html ──────────────────
        if (do_nm, si_nm, dong) not in done_lv3:
            done_lv3.add((do_nm, si_nm, dong))
            r_path  = os.path.join(RESULT_BASE, do_nm, si_nm, dong, 'result.html')
            out_dir = os.path.join(WACADEMY_DIR, do_nm, si_nm, dong)
            lk = build_link_section_lv3(do_nm, si_nm, dong, keywords)
            bc = [('홈', '/'), (do_nm, f'/{do_nm}/'), (si_nm, f'/{do_nm}/{si_nm}/'), (dong, None)]
            r = generate(dong, MAIN_FIXED, r_path, out_dir, template, 위치사진, lk, f'/{do_nm}/{si_nm}/', next_reviews(rv_stream), bc, args.dry_run)
            ok += r; skip += not r

        # ── 레벨4: 와카데미/{도}/{시구}/{동}/{메인}/index.html ───────────
        for kw in keywords:
            r_path  = os.path.join(RESULT_BASE, do_nm, si_nm, dong, kw, 'result.html')
            out_dir = os.path.join(WACADEMY_DIR, do_nm, si_nm, dong, kw)
            bc = [('홈', '/'), (do_nm, f'/{do_nm}/'), (si_nm, f'/{do_nm}/{si_nm}/'), (dong, None)]
            r = generate(dong, kw, r_path, out_dir, template, 위치사진, '', f'/{do_nm}/{si_nm}/{dong}/', next_reviews(rv_stream), bc, args.dry_run)
            ok += r; skip += not r

    print(f'\n완료: {ok}개 생성  /  {skip}개 스킵(result.html 없음)')


if __name__ == '__main__':
    main()
