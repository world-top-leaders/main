#!/usr/bin/env bash
# 공개 사이트에 내보낼 파일 허용 목록 (감수: 클로드 2026-10-01)
# 새 공개 파일이 생기면 여기에 한 줄 추가한다.
set -euo pipefail
rm -rf public
mkdir -p public/assets public/data public/tools
cp index.html leader.html public/
cp assets/wtl-common.js public/assets/
if [ -d assets/leaders ]; then cp -r assets/leaders public/assets/; fi
cp data/leaders.csv data/locales.json public/data/
# 팀 회의실(임시로 유지 — 주소를 아는 사람은 누구나 열 수 있음)
cp "tools/감)회의실.html" public/tools/ 2>/dev/null || true
cp "tools/감)허브.html" public/tools/ 2>/dev/null || true
echo "public 폴더 준비 완료:"; find public -type f | sort
