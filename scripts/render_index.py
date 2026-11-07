#!/usr/bin/env python3
"""공개용 index.html 만들기 (클로드 2026-11-07).

매일 갱신에서 index.html이 통째로 다시 쓰이며 줄이 잘리거나(10줄만 남음)
스크립트 줄이 빠지는 일이 되풀이되어, 공개 첫 화면은 늘 이렇게 만든다:
  틀 site/index.template.html + 순위 data/leaders.csv (50줄 모두)
저장소의 index.html은 '이전 순위'와 날짜를 읽는 데만 쓴다(없어도 됨).
쓰기: python3 scripts/render_index.py <나갈 파일>
"""
import csv, datetime, html, re, sys

out = sys.argv[1]
tpl = open("site/index.template.html", encoding="utf-8").read()
rows = list(csv.DictReader(open("data/leaders.csv", encoding="utf-8")))
if len(rows) < 50:
    sys.exit(f"data/leaders.csv에 {len(rows)}줄뿐입니다(50줄 필요). 빌드를 멈춥니다.")

daily = ""
try:
    daily = open("index.html", encoding="utf-8").read()
except OSError:
    pass
prev = {}
for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", daily, re.S):
    tds = [re.sub(r"<[^>]+>", "", c).strip() for c in re.findall(r"<td[^>]*>(.*?)</td>", tr, re.S)]
    if len(tds) >= 4 and tds[1].isdigit():
        prev[html.unescape(tds[3])] = int(tds[1])
m = re.search(r"20\d\d-\d\d-\d\d", daily)
date = m.group(0) if m else (datetime.datetime.utcnow() + datetime.timedelta(hours=9)).strftime("%Y-%m-%d")

def num(v):
    f = float(v)
    return str(int(f)) if f.is_integer() else v

lines = []
for r in sorted(rows, key=lambda r: int(r["rank"])):
    rank = int(r["rank"]); name = r["name_en"]
    p = prev.get(name)
    if p is None:
        pv, chg = "–", "–"
    else:
        d = p - rank
        pv, chg = str(p), ("=" if d == 0 else f"+{d}" if d > 0 else str(d))
    cls = {1: "r1", 2: "r2", 3: "r3"}.get(rank, "")
    cells = [str(rank), pv, chg, name, r["org"], r["role_en"], num(r["R"]), num(r["B"]), num(r["AGI"]), num(r["W"])]
    tds = "".join(f"<td>{html.escape(c, quote=False)}</td>" for c in cells)
    lines.append(f'        <tr class="{cls}">{tds}<td class="avg">{float(r["avg"]):.2f}</td></tr>')

page = tpl.replace("{{ROWS}}", "\n".join(lines)).replace("{{DATE}}", date)
open(out, "w", encoding="utf-8").write(page)
print(f"index.html: {len(lines)}명, 날짜 {date}, 이전 순위 {len(prev)}명 찾음")
