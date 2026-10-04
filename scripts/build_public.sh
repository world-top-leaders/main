#!/usr/bin/env bash
# 공개 사이트에 내보낼 파일 허용 목록 + 검색 노출 준비 (감수: 클로드 2026-10-01, 10-02 보강)
# 새 공개 파일이 생기면 여기에 한 줄 추가한다.
set -euo pipefail
SITE="https://worldtopleaders.org"
rm -rf public
mkdir -p public/assets public/data public/tools
cp index.html leader.html public/
cp assets/wtl-common.js public/assets/
if [ -d assets/leaders ]; then cp -r assets/leaders public/assets/; fi
cp data/leaders.csv data/locales.json public/data/
if [ -f data/notice.json ]; then cp data/notice.json public/data/; fi
# 팀 회의실(임시로 유지 — 주소를 아는 사람은 누구나 열 수 있음)
cp "tools/감)회의실.html" public/tools/ 2>/dev/null || true
cp "tools/감)허브.html" public/tools/ 2>/dev/null || true

# --- 검색엔진용 정보 (index.html은 매일 새로 만들어지므로 여기서 자동으로 넣는다) ---
DESC="World Top Leaders — daily-updated ranking of the world's top 50 AI leaders, scored on Research, Business, AGI and Wealth from public sources. 세계 AI 지도자 Top 50 순위를 매일 공개 자료로 갱신합니다."
META="<meta name=\"description\" content=\"$DESC\" /><meta property=\"og:type\" content=\"website\" /><meta property=\"og:site_name\" content=\"World Top Leaders\" /><meta property=\"og:title\" content=\"World Top Leaders — AI Leaders Top 50\" /><meta property=\"og:description\" content=\"$DESC\" /><meta property=\"og:url\" content=\"$SITE/\" /><link rel=\"canonical\" href=\"$SITE/\" />"
if ! grep -q 'name="description"' public/index.html; then
  sed -i "0,/<meta charset[^>]*>/s||&\n  $META|" public/index.html
fi
LMETA="<meta name=\"description\" content=\"World Top Leaders — leader profile, WTL scores (Research, Business, AGI, Wealth) and public comments.\" />"
if ! grep -q 'name="description"' public/leader.html; then
  sed -i "0,/<meta charset[^>]*>/s||&\n  $LMETA|" public/leader.html
fi

# robots.txt
cat > public/robots.txt <<ROBOTS
User-agent: *
Allow: /
Disallow: /tools/
Sitemap: $SITE/sitemap.xml
ROBOTS

# sitemap.xml (메인 + 지도자 50명)
TODAY=$(date -u +%Y-%m-%d)
{
  echo '<?xml version="1.0" encoding="UTF-8"?>'
  echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  echo "  <url><loc>$SITE/</loc><lastmod>$TODAY</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>"
  tail -n +2 data/leaders.csv | awk -F',' 'NF>1 && $2 ~ /^[a-z0-9-]+$/ {print $2}' | while read -r slug; do
    echo "  <url><loc>$SITE/leader?slug=$slug</loc><lastmod>$TODAY</lastmod><changefreq>daily</changefreq><priority>0.7</priority></url>"
  done
  echo '</urlset>'
} > public/sitemap.xml

echo "public 폴더 준비 완료:"; find public -type f | sort
