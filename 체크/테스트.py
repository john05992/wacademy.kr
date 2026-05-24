# -*- coding: utf-8 -*-
"""
테스트.py
=========
틀.html + result.html(JSON) + 리뷰txt → {지역키워드} {메인키워드}.html 생성

경로 자동 해석:
  학원목록.txt 에서 동 → (도, 시구) 역추적
  → 본문뽑기/아카데미/{도}/{시구}/{동}/{메인키워드}/result.html

사용법:
    python 테스트.py --지역 동백동 --메인 고등 수학학원
    python 테스트.py --지역 이매동 --메인 고등 수학학원
    python 테스트.py --지역 동백동 --메인 고등 수학학원 --out "C:/출력폴더"
"""

import os, sys, json, random, argparse

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR      = os.path.dirname(os.path.abspath(__file__))
WACADEMY_DIR  = os.path.dirname(BASE_DIR)                          # 와카데미/
BONMUN_DIR    = os.path.join(os.path.dirname(WACADEMY_DIR), '본문뽑기')  # 본문뽑기/

TEMPLATE      = os.path.join(BASE_DIR, '틀.html')
ACADEMY_LIST  = os.path.join(WACADEMY_DIR, '학원목록.txt')
REVIEW_BASE   = os.path.join(BONMUN_DIR, '아카데미', '리뷰')
RESULT_BASE   = os.path.join(BONMUN_DIR, '아카데미')


# ── 학원목록.txt 파싱: 동 → (도, 시구) ───────────────────────────────

def load_dong_map():
    """학원목록.txt → {동명: (도, 시구)}"""
    dong_map = {}
    cur_do = cur_si = ''
    with open(ACADEMY_LIST, encoding='utf-8') as f:
        for line in f:
            parts = line.rstrip('\n').split('\t')
            if parts[0].strip():
                cur_do = parts[0].strip()
                cur_si = parts[1].strip() if len(parts) > 1 else ''
            dong = parts[3].strip() if len(parts) > 3 else ''
            if dong:
                dong_map[dong] = (cur_do, cur_si)
    return dong_map


def resolve_result_path(dong_map, 지역, 메인):
    """
    지역(동) + 메인(키워드)으로 result.html 절대경로 반환.
    학원목록.txt에 없는 동이면 경기도/성남시 기본값.
    """
    do_nm, si_nm = dong_map.get(지역, ('경기도', '성남시'))
    path = os.path.join(RESULT_BASE, do_nm, si_nm, 지역, 메인, 'result.html')
    return path, do_nm, si_nm


# ── 리뷰 랜덤 선택 ────────────────────────────────────────────────────

def pick_random_review(n=6):
    """리뷰 폴더에서 랜덤 txt 파일 선택 후 n줄 샘플"""
    if not os.path.isdir(REVIEW_BASE):
        return ['리뷰 데이터 없음'] * n

    folders = [d for d in os.listdir(REVIEW_BASE)
               if os.path.isdir(os.path.join(REVIEW_BASE, d)) and d.isdigit()]
    if not folders:
        return ['리뷰 데이터 없음'] * n

    folder = random.choice(folders)
    folder_path = os.path.join(REVIEW_BASE, folder)
    files = [f for f in os.listdir(folder_path) if f.endswith('.txt')]
    if not files:
        return ['리뷰 데이터 없음'] * n

    file_path = os.path.join(folder_path, random.choice(files))
    with open(file_path, encoding='utf-8') as f:
        lines = [l.strip() for l in f if l.strip()]
    return random.sample(lines, min(n, len(lines)))


# ── 유틸 ──────────────────────────────────────────────────────────────

def load_json(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)

def safe(val):
    return val if val else ''

def calc_img_root(out_path):
    """
    출력 HTML 파일에서 와카데미/ 루트까지의 상대 경로 반환.
    예) 체크/이매동.html → '../'
        아카데미/경기도/성남시/이매동/고등 수학학원/index.html → '../../../../../'
    """
    out_dir = os.path.dirname(os.path.abspath(out_path))
    wacademy_dir = os.path.abspath(WACADEMY_DIR)
    rel = os.path.relpath(wacademy_dir, out_dir)
    # Windows 백슬래시 → 슬래시, 끝에 / 추가
    rel = rel.replace('\\', '/').rstrip('/') + '/'
    return rel


# ── 치환 ──────────────────────────────────────────────────────────────

def build_page(template, data, reviews, 지역, 메인):
    html = template

    html = html.replace('{{지역키워드}}', 지역)
    html = html.replace('{{메인키워드}}', 메인)
    html = html.replace('{{meta}}', safe(data.get('meta')))

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

    return html


# ── 메인 ──────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--지역', required=True, help='동 이름 (예: 동백동, 이매동)')
    parser.add_argument('--메인', required=True, help='키워드 (예: 고등 수학학원)')
    parser.add_argument('--out',  default=BASE_DIR, help='출력 폴더 (기본: 체크 폴더)')
    args = parser.parse_args()

    # 학원목록.txt에서 도/시구 역추적 → result.html 경로 결정
    dong_map = load_dong_map()
    result_path, do_nm, si_nm = resolve_result_path(dong_map, args.지역, args.메인)

    print(f'지역키워드 : {args.지역}')
    print(f'메인키워드 : {args.메인}')
    print(f'도/시구    : {do_nm} / {si_nm}')
    print(f'result.html: {result_path}')

    if not os.path.exists(result_path):
        print(f'\n[오류] result.html 없음: {result_path}')
        print('5월21자웹사이트.py로 먼저 해당 동/키워드 result.html을 생성하세요.')
        sys.exit(1)

    with open(TEMPLATE, encoding='utf-8') as f:
        template = f.read()

    data    = load_json(result_path)
    reviews = pick_random_review()

    out_name = f'{args.지역} {args.메인}.html'
    out_path = os.path.join(os.path.abspath(args.out), out_name)

    img_root = calc_img_root(out_path)
    html = build_page(template, data, reviews, args.지역, args.메인)
    html = html.replace('{{이미지루트}}', img_root)

    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(html)

    print(f'\n생성 완료 → {out_path}')


if __name__ == '__main__':
    main()
