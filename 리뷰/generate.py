# -*- coding: utf-8 -*-
"""
리뷰 100개 생성 후 와카데미/리뷰/N.txt 저장
사용법: python generate.py
필요: pip install anthropic
"""

import os, random, anthropic

# ── 경로 설정 ──────────────────────────────────────────
VAR_DIR  = os.path.expanduser("~") + "/OneDrive/바탕 화면/본문뽑기/변수"
SAVE_DIR = os.path.dirname(os.path.abspath(__file__))   # 이 파일이 있는 폴더(리뷰/)

# ── 변수 파일 읽기 ──────────────────────────────────────
def load(name):
    path = f"{VAR_DIR}/{name}.txt"
    with open(path, encoding="utf-8") as f:
        return [l.strip() for l in f if l.strip()]

주제      = load("주제")
느낀매력   = load("느낀매력")
장점      = load("장점")
수업외사항 = load("수업외사항")
노하우    = load("노하우")

# ── 샘플링 (프롬프트에 넣을 예시 개수) ─────────────────
def sample(lst, n=40):
    return "\n".join(random.sample(lst, min(n, len(lst))))

# ── 프롬프트 조립 ───────────────────────────────────────
PROMPT = f"""당신은 학원 수강생(또는 학부모)의 실제 후기를 작성하는 전문가입니다.

아래 [변수 목록]에서 항목을 무작위로 조합해 자연스러운 리뷰를 100개 작성하세요.

[규칙]
1. 리뷰 1개 = 30자 이내 (공백 포함)
2. 리뷰 100개를 줄바꿈으로만 구분해 출력 (번호·기호·따옴표 없이 텍스트만)
3. 100개 모두 달라야 하며 유사 문장 반복 금지
4. 변수를 직접 나열하지 말고 자연스러운 후기 문장으로 녹여 작성
5. 긍정적 어조 유지
6. 구어체·구체적 표현 사용

[변수 목록]

《주제》
{sample(주제, 50)}

《느낀매력》
{sample(느낀매력, 40)}

《장점》
{sample(장점, 40)}

《수업외사항》
{sample(수업외사항, 30)}

《노하우》
{sample(노하우, 30)}

지금 바로 100개 출력하세요."""

# ── 다음 저장 번호 계산 ─────────────────────────────────
def next_num():
    nums = []
    for f in os.listdir(SAVE_DIR):
        if f.endswith(".txt") and f[:-4].isdigit():
            nums.append(int(f[:-4]))
    return max(nums, default=0) + 1

# ── API 호출 ────────────────────────────────────────────
def main():
    client = anthropic.Anthropic()   # ANTHROPIC_API_KEY 환경변수 사용

    print("리뷰 100개 생성 중...")
    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=4096,
        messages=[{"role": "user", "content": PROMPT}]
    )

    raw = message.content[0].text
    lines = [l.strip() for l in raw.splitlines() if l.strip()]

    # 30자 초과 필터링
    reviews = [l for l in lines if len(l) <= 30]

    if len(reviews) < 100:
        print(f"⚠️  {len(reviews)}개 생성됨 (30자 초과 제외)")
    else:
        reviews = reviews[:100]

    # 저장
    n = next_num()
    out_path = os.path.join(SAVE_DIR, f"{n}.txt")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(reviews))

    print(f"✅ 저장 완료: {out_path}  ({len(reviews)}개)")

if __name__ == "__main__":
    main()
