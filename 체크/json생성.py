# -*- coding: utf-8 -*-
"""
json생성.py
===========
학원목록.txt → dong_map.json 생성

출력: 와카데미/dong_map.json
형식: {"동백동": "/경기도/용인시/동백동/", ...}

사용법:
  python json생성.py
"""

import os, json, sys

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
WACADEMY_DIR = os.path.dirname(BASE_DIR)
ACADEMY_LIST = os.path.join(WACADEMY_DIR, '학원목록.txt')
OUT_PATH     = os.path.join(WACADEMY_DIR, 'dong_map.json')


def build_dong_map():
    dong_map = {}
    cur_do = cur_si = ''

    with open(ACADEMY_LIST, encoding='utf-8') as f:
        for line in f:
            parts = line.rstrip('\n').split('\t')
            if parts[0].strip():
                cur_do = parts[0].strip()
                cur_si = parts[1].strip() if len(parts) > 1 else ''
            dong = parts[3].strip() if len(parts) > 3 else ''
            if dong and cur_do and cur_si:
                url = f'/{cur_do}/{cur_si}/{dong}/'
                dong_map[dong] = url

    return dong_map


def main():
    dong_map = build_dong_map()

    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(dong_map, f, ensure_ascii=False, indent=2)

    print(f'완료: {len(dong_map)}개 동 → {OUT_PATH}')


if __name__ == '__main__':
    main()
