# WTL 고객의견 표준 컬럼 (8)

제미니 확정 · 2026-09-29
적용: Drive `WTL_고객의견_관리시트` + Supabase comments

| 컬럼 | 형 | 설명 |
|---|---|---|
| comment_id | string | 고유 ID |
| timestamp | ISO 8601 | 작성 시각 |
| leader_slug | string | `data/leaders.csv` slug. 전체 의견은 `site` |
| author | string | 작성자. 빈 값 허용 |
| language | `ko` \| `en` | 작성 언어 |
| content | string | 10–300자 |
| likes | integer | 공감 수. 기본 0 |
| parent_id | string \| empty | 대댓글이면 부모 comment_id |
