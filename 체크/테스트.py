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

import os, sys, json, random, argparse, re

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR        = os.path.dirname(os.path.abspath(__file__))
WACADEMY_DIR    = os.path.dirname(BASE_DIR)                          # 와카데미/
BONMUN_DIR      = os.path.join(os.path.dirname(WACADEMY_DIR), '본문뽑기')  # 본문뽑기/
DESKTOP_DIR     = os.path.dirname(WACADEMY_DIR)                      # 바탕 화면/

TEMPLATE        = os.path.join(BASE_DIR, '틀.html')
ACADEMY_LIST    = os.path.join(WACADEMY_DIR, '학원목록.txt')
REVIEW_BASE     = os.path.join(BONMUN_DIR, '아카데미', '리뷰')
RESULT_BASE     = os.path.join(BONMUN_DIR, '아카데미')
STORE_DATA_FILE = os.path.join(DESKTOP_DIR, 'perf.kr 사이트 html 백업', '15-지도.txt')

KAKAO_KEY = '848084666ed912bc3a45a96652076f23'


# ── 학원목록.txt 파싱: 동 → (도, 시구, 지점명) ──────────────────────

def load_dong_map():
    """학원목록.txt → {동명: (도, 시구, 지점명)}"""
    dong_map = {}
    cur_do = cur_si = cur_branch = ''
    with open(ACADEMY_LIST, encoding='utf-8') as f:
        for line in f:
            parts = line.rstrip('\n').split('\t')
            if parts[0].strip():
                cur_do     = parts[0].strip()
                cur_si     = parts[1].strip() if len(parts) > 1 else ''
                cur_branch = parts[2].strip() if len(parts) > 2 else ''
            dong = parts[3].strip() if len(parts) > 3 else ''
            if dong:
                dong_map[dong] = (cur_do, cur_si, cur_branch)
    return dong_map


def resolve_result_path(dong_map, 지역, 메인):
    """지역(동) + 메인(키워드)으로 result.html 절대경로 반환."""
    entry  = dong_map.get(지역, ('경기도', '성남시', ''))
    do_nm, si_nm = entry[0], entry[1]
    path = os.path.join(RESULT_BASE, do_nm, si_nm, 지역, 메인, 'result.html')
    return path, do_nm, si_nm


# ── 15-지도.txt 파싱: 지점명 → (lat, lng, addr) ──────────────────────

def load_store_data():
    """15-지도.txt allStoreData → {지점명: (lat, lng, addr)}"""
    try:
        with open(STORE_DATA_FILE, encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        return {}
    stores = {}
    blocks = re.findall(
        r'name:\s*"([^"]+)".*?addr:\s*"([^"]+)".*?lat:\s*([\d.]+),?\s*\n\s*lng:\s*([\d.]+)',
        content, re.DOTALL
    )
    for name, addr, lat, lng in blocks:
        stores[name] = (float(lat), float(lng), addr)
    return stores


# ── 지도 HTML 생성 ────────────────────────────────────────────────────

def build_map_html(지역, 지점명, lat, lng, addr):
    # 1~10m 범위 랜덤 오프셋 (0.00001~0.00009도)
    jitter = lambda: random.uniform(0.00001, 0.00009) * random.choice([-1, 1])
    lat = round(lat + jitter(), 8)
    lng = round(lng + jitter(), 8)
    return f'''<!-- 지도 섹션 -->
<section class="map-section">
  <div class="map-head">
    <p class="map-eyebrow">LOCATION</p>
    <p class="map-name">{지점명}</p>
    <p class="map-addr">{addr}</p>
  </div>
  <div class="map-frame" id="wawaMapFrame">
    <div id="wawaMap" style="width:100%;height:100%"></div>
  </div>
  <script>
  (function(){{
    var LAT={lat}, LNG={lng}, LEVEL=7;
    function initMap(){{
      var el=document.getElementById('wawaMap');
      if(!el) return;
      var map=new kakao.maps.Map(el,{{center:new kakao.maps.LatLng(LAT,LNG),level:LEVEL}});
      new kakao.maps.Marker({{map:map,position:new kakao.maps.LatLng(LAT,LNG)}});
    }}
    var s=document.createElement('script');
    s.src='https://dapi.kakao.com/v2/maps/sdk.js?appkey={KAKAO_KEY}&autoload=false';
    s.onload=function(){{kakao.maps.load(initMap);}};
    document.head.appendChild(s);
  }})();
  </script>
</section>'''


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



# ── 치환 ──────────────────────────────────────────────────────────────

def build_page(template, data, reviews, 지역, 메인, map_html=''):
    html = template

    html = html.replace('{{지도}}', map_html)
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

    # 학원목록.txt에서 도/시구/지점명 역추적 → result.html 경로 결정
    dong_map   = load_dong_map()
    store_data = load_store_data()
    result_path, do_nm, si_nm = resolve_result_path(dong_map, args.지역, args.메인)

    # 지점 매핑 → 지도 HTML 생성
    branch_name = dong_map.get(args.지역, ('', '', ''))[2]
    map_html = ''
    if branch_name and branch_name in store_data:
        lat, lng, addr = store_data[branch_name]
        map_html = build_map_html(args.지역, branch_name, lat, lng, addr)
        print(f'지점       : {branch_name} ({lat}, {lng})')
    else:
        print(f'지점       : 매칭 없음 ({branch_name})')

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

    html = build_page(template, data, reviews, args.지역, args.메인, map_html)

    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(html)

    print(f'\n생성 완료 → {out_path}')


if __name__ == '__main__':
    main()
