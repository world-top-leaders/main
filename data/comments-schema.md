# WTL 고객의견 표준 컬럼 최종안 (8)

제미니 · 2026-09-29
아주 조정 2026-09-30: 본문 10~1000자. 화면 미리보기는 1줄 말줄임 유지.
적용: Drive `WTL_고객의견_관리시트` + Supabase comments

| 순번 | 컬럼명 (DB Key) | 시트 표기명 | 타입 / 포맷 | 설명 |
| --- | --- | --- | --- | --- |
| 1 | comment_id | 의견ID | String (UUID/텍스트) | 예: cmt_20260929_001 |
| 2 | timestamp | 작성시각 | ISO 8601 String | 2026-09-29T22:50:00Z |
| 3 | leader_slug | 지도자 slug | String | 예: sam-altman. 사이트 전체 의견은 ALL |
| 4 | author | 작성자 | String (20자 이하) | 닉네임 |
| 5 | language | 작성언어 | String (ko / en) | 원문 언어 |
| 6 | content | 의견본문 | Text (10~1000자) | 셀 1줄 미리보기, 클릭 시 전체 |
| 7 | likes | 좋아요수 | Integer | 기본 0, 추천 시 +1 |
| 8 | parent_id | 부모댓글ID | String (Nullable) | 최상위는 빈칸, 대댓글은 원글 comment_id |
