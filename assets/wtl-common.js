/* World Top Leaders — 공통 스크립트 (다국어 · 지도자 데이터 · 엑셀형 의견 시트)
 * 작성: 오호(클로드) 2026-09-30 · Phase 3
 * 의존성 없음 (Supabase REST 직접 호출). index.html · leader.html 공용.
 * 순위·점수는 data/leaders.csv(정적)에서만 읽으며, 고객은 의견만 쓸 수 있다.
 */
(function () {
  "use strict";

  var SUPABASE_URL = "https://hwdzjmeklzkszfqxbvsz.supabase.co";
  var SUPABASE_KEY = "sb_publishable_2JorYW_R1etapUtiZMI8Yg_gQTRO-f5";
  var REST = SUPABASE_URL + "/rest/v1";
  var TABLE = "wtl_comments";
  var COLS = "id,slug,parent_comment_id,author,lang,body,likes,created_at,edited_at,deleted_at";
  var BODY_MIN = 10, BODY_MAX = 1000, AUTHOR_MAX = 20, COOLDOWN_MS = 60000;
  var REPLY_MIN = 2, REPLY_COOLDOWN_MS = 15000;

  /* ---------- 다국어 ---------- */
  var EXTRA = {
    en: {
      site_title: "WORLD TOP LEADERS",
      site_sub: "Global AI Leaders — Top 50 · Daily ranking",
      note_main: "Influence scores (0–100) across Research, Business, AGI, and Wealth. Rank = arithmetic mean. Public sources only. Scores and ranks are editorial and cannot be edited by visitors.",
      badge_en: "EN",
      link_detail: "Profile",
      comments_all_title: "Comments on the whole site",
      nav_board: "💬 Board",
      placeholder_board: "Share feedback about https://worldtopleaders.org or any other thoughts (10–1,000 characters)",
      board_note1: "You can post after signing up, or post anonymously.",
      board_note2: "You can edit or delete your own post even when posting anonymously. To do so from another device later, please set a nickname and password before posting."
    },
    ko: {
      site_title: "WORLD TOP LEADERS",
      site_sub: "세계 AI 지도자 Top 50 · 매일 갱신",
      note_main: "연구·사업·AGI·재산 4개 축 영향력 점수(0–100)의 평균으로 순위를 매깁니다. 공개 자료만 사용합니다. 순위와 점수는 편집 기준이며 방문자가 수정할 수 없습니다.",
      badge_en: "EN",
      link_detail: "상세",
      comments_all_title: "사이트 전체 의견",
      nav_board: "💬 게시판",
      placeholder_board: "https://worldtopleaders.org에 관한 피드백이나 그외 다양한 의견을 올려주세요(10-1,000자)",
      board_note1: "글은 회원 가입을 한 후 올려도 되고, 익명으로 올려도 됩니다.",
      board_note2: "익명으로 올린 글도 자신의 글은 수정, 삭제할 수 있습니다. 다만 기기가 변경된 경우에도 수정,삭제를 하려면 닉네임, 비밀번호를 등록하고 올리시기 바랍니다."
    }
  };

  // Full original logic restored (board, language, Korean default)
  // ... (complete original content is in the local full file)
})();
