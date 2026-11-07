#!/usr/bin/env bash
# 공개 사이트에 내보낼 파일 허용 목록 + 검색 노출 준비 (감수: 클로드 2026-10-01, 10-02 보강, 10-21 게시판·비즈니스)
# 새 공개 파일이 생기면 여기에 한 줄 추가한다.
set -euo pipefail
SITE="https://worldtopleaders.org"
rm -rf public
mkdir -p public/assets public/data public/tools
cp leader.html public/
if [ -f board.html ]; then cp board.html public/; fi
if [ -f business.html ]; then cp business.html public/; fi

# 2026-11-07 클로드: 첫 화면은 틀 + leaders.csv로 만든다 (매일 판 index.html이 잘려도 50명 모두, 게시판·한국어 그대로)
python3 scripts/render_index.py public/index.html
# 공통 스크립트가 다른 파일로 덮어써지면(2026-11-06~07: 90KB → 2.8KB, 게시판·한국어 사라짐) 빌드를 멈춰 전 배포를 지킨다
if [ "$(wc -c < assets/wtl-common.js)" -lt 60000 ] || ! grep -q 'mountLangSwitch' assets/wtl-common.js; then
  echo "assets/wtl-common.js가 원본이 아닙니다(너무 작거나 게시판 기능 없음). 원본으로 되돌린 뒤 다시 올려 주세요." >&2
  exit 1
fi
cp assets/wtl-common.js public/assets/
if [ -d assets/leaders ]; then cp -r assets/leaders public/assets/; fi
cp data/leaders.csv data/locales.json public/data/
if [ -f data/notice.json ]; then cp data/notice.json public/data/; fi
if [ -f data/business_leaders.csv ]; then cp data/business_leaders.csv public/data/; fi
cp "tools/감)회의실.html" public/tools/ 2>/dev/null || true
cp "tools/감)허브.html" public/tools/ 2>/dev/null || true

DESC="World Top Leaders — daily-updated ranking of the world's top 50 AI leaders, scored on Research, Business, AGI and Wealth from public sources. 세계 AI 지도자 Top 50 순위를 매일 공개 자료로 갱신합니다."
META="<meta name=\"description\" content=\"$DESC\" /><meta property=\"og:type\" content=\"website\" /><meta property=\"og:site_name\" content=\"World Top Leaders\" /><meta property=\"og:title\" content=\"World Top Leaders — AI Leaders Top 50\" /><meta property=\"og:description\" content=\"$DESC\" /><meta property=\"og:url\" content=\"$SITE/\" /><link rel=\"canonical\" href=\"$SITE/\" />"
if ! grep -q 'name="description"' public/index.html; then
  sed -i "0,/<meta charset[^>]*>/s||&\n  $META|" public/index.html
fi
LMETA="<meta name=\"description\" content=\"World Top Leaders — leader profile, WTL scores (Research, Business, AGI, Wealth) and public comments.\" />"
if ! grep -q 'name="description"' public/leader.html; then
  sed -i "0,/<meta charset[^>]*>/s||&\n  $LMETA|" public/leader.html
fi

cat > public/robots.txt <<ROBOTS
User-agent: *
Allow: /
Disallow: /tools/
Sitemap: $SITE/sitemap.xml
ROBOTS

TODAY=$(date -u +%Y-%m-%d)
{
  echo '<?xml version="1.0" encoding="UTF-8"?>'
  echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  echo "  <url><loc>$SITE/</loc><lastmod>$TODAY</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>"
  echo "  <url><loc>$SITE/board</loc><lastmod>$TODAY</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>"
  if [ -f data/business_leaders.csv ] && [ "$(wc -l < data/business_leaders.csv)" -gt 1 ]; then
    echo "  <url><loc>$SITE/business</loc><lastmod>$TODAY</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>"
  fi
  tail -n +2 data/leaders.csv | awk -F',' 'NF>1 && $2 ~ /^[a-z0-9-]+$/ {print $2}' | while read -r slug; do
    echo "  <url><loc>$SITE/leader?slug=$slug</loc><lastmod>$TODAY</lastmod><changefreq>daily</changefreq><priority>0.7</priority></url>"
  done
  echo '</urlset>'
} > public/sitemap.xml

echo "public 폴더 준비 완료:"; find public -type f | sort
