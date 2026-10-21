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
  // 댓글(답글)은 짧은 인사도 되도록 2자부터, 간격도 15초로 따로 센다 (2026-10-08)
  var REPLY_MIN = 2, REPLY_COOLDOWN_MS = 15000;

  /* ---------- 다국어 ---------- */
  // data/locales.json(제미니 관리)이 우선. 아래 EXTRA는 locales.json에 아직 없는 키의 기본값.
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
      board_note2: "You can edit or delete your own post even when posting anonymously. To do so from another device later, please set a nickname and password before posting.",
      mine: "My post", mine_title: "Your post. Open it to edit or delete.", my_code: "Secret code",
      pw_prompt2: "Password or secret code",
      code_title: "Your post was registered", code_msg: "The secret code for this post is {code}. If you forget your nickname and password and also change devices, you will need this code to have the post deleted.",
      btn_close: "Close", btn_copy: "Copy code", copied: "Copied.",
      signup: "Sign up", login: "Log in", logout: "Log out", hello: "{nick}", admin_mode: "Admin mode", member_badge: "Member",
      f_nick: "Nickname (2–20 characters)", f_pw: "Password (at least 6 characters)", f_pw2: "Confirm password",
      signup_note: "No email needed. Please remember your nickname and password: they cannot be recovered automatically.",
      to_login: "Already a member? Log in", to_signup: "New here? Sign up",
      err_nick: "Nickname must be 2–20 characters.", err_pw6: "Password must be 6–72 characters.", err_pw_match: "Passwords do not match.",
      err_nick_taken: "That nickname is already taken.", err_login: "Nickname or password is incorrect.", err_auth_rate: "Too many sign-ups from this connection. Please try later.",
      err_auth_down: "Sign-up is not available yet. Please try again later.",
      ok_signup: "Welcome! You are signed up and logged in.", ok_login: "Logged in.", ok_logout: "Logged out.",
      member_post_note: "Posting as {nick}. Log in on any device to edit or delete.",
      btn_admin_del: "🗑 Admin delete", admin_del_confirm: "Delete this post as admin?", btn_check_code: "Check code", code_ph: "6-char code",
      code_match: "✓ The secret code matches.", code_nomatch: "✗ The secret code does not match.", deleted_admin: "This post was removed by the admin.",
      nav_ai: "🤖 AI Leaders", nav_biz: "🏢 Business Leaders", back_to_biz: "← Business Top 50",
      theme_to_day: "☀️ Day", theme_to_night: "🌙 Night", theme_title: "Switch day / night mode", board_title: "World Top Leaders Board", board_sub: "Share your thoughts on AI leaders and this site. Please be kind.",
      comments_leader_title: "Comments",
      comments_count: "{n} comments",
      write_comment: "Write",
      no_comment_cell: "Write a comment",
      anonymous: "Participant",
      placeholder_pw: "Password (optional, for edit/delete)",
      btn_edit: "Edit", btn_delete: "Delete", btn_save: "Save", btn_cancel: "Cancel", btn_confirm_delete: "Delete now?",
      pw_prompt: "Password", edited: "edited", deleted_msg: "This comment was deleted by its author.",
      ok_edited: "Updated.", ok_deleted: "Deleted.", err_secret: "Password does not match.",
      err_tries: "Too many attempts. Please try again in 10 minutes.", err_gone: "This comment no longer exists.",
      err_pw_len: "Password must be 4–30 characters.",
      err_len: "Comment must be 10–1,000 characters.",
      err_len_reply: "Reply must be 2–1,000 characters.",
      err_rate_reply: "Please wait a few seconds before replying again.",
      placeholder_reply: "Write a reply (2–1,000 characters)",
      err_author: "Name can be up to 20 characters.",
      err_rate: "You can post once per minute. Please try again shortly.",
      err_generic: "Could not save. Please try again.",
      err_load: "Could not load comments.",
      ok_posted: "Posted. Thank you!",
      wait_sec: "Wait {s}s",
      btn_liked: "Liked",
      replies: "Replies",
      th_author: "Name",
      th_comment: "Comment",
      th_time: "Time",
      back_to_list: "← Top 50",
      rank_badge: "Rank #{n}",
      metrics_title: "WTL score",
      profile_title: "Profile",
      profile_pending: "Detailed profile (birth, education, career) will be added after data review.",
      not_found: "Leader not found.",
      initials_note: "Photo pending — initials shown.",
      m_research: "Research", m_business: "Business", m_agi: "AGI", m_wealth: "Wealth",
      p_org: "Organization", p_role: "Role", p_rank: "Rank", p_avg: "Average",
      p_birth: "Born", p_gender: "Gender", p_nationality: "Nationality", p_education: "Education",
      p_career: "Career", p_expertise: "Field", p_net_worth: "Net worth", p_achievements: "Key achievements"
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
      board_note2: "익명으로 올린 글도 자신의 글은 수정, 삭제할 수 있습니다. 다만 기기가 변경된 경우에도 수정,삭제를 하려면 닉네임, 비밀번호를 등록하고 올리시기 바랍니다.",
      mine: "내 글", mine_title: "내가 쓴 글 · 눌러서 수정/삭제", my_code: "비밀코드",
      pw_prompt2: "비밀번호 또는 비밀코드",
      code_title: "게시글이 등록되었어요", code_msg: "게시글의 비밀코드는 {code}입니다. 익명의 글을 닉네임과 비밀번호를 잊고, 또 기기 변경을 한 경우에 글을 지우려면 비밀코드를 제시하여야 합니다.",
      btn_close: "닫기", btn_copy: "코드 복사", copied: "복사했어요.",
      signup: "회원가입", login: "로그인", logout: "로그아웃", hello: "{nick} 님", admin_mode: "관리자 모드", member_badge: "회원",
      f_nick: "닉네임 (2~20자)", f_pw: "비밀번호 (6자 이상)", f_pw2: "비밀번호 확인",
      signup_note: "이메일 없이 가입해요. 닉네임과 비밀번호를 꼭 기억해 주세요. 잊으면 스스로 찾을 수 없어요.",
      to_login: "이미 회원이면 로그인", to_signup: "처음이면 회원가입",
      err_nick: "닉네임은 2~20자로 써 주세요.", err_pw6: "비밀번호는 6자 이상으로 써 주세요.", err_pw_match: "비밀번호가 서로 달라요.",
      err_nick_taken: "이미 쓰고 있는 닉네임이에요.", err_login: "닉네임이나 비밀번호가 맞지 않아요.", err_auth_rate: "이 연결에서 가입이 너무 많았어요. 나중에 다시 해 주세요.",
      err_auth_down: "회원 기능을 준비 중이에요. 잠시 뒤 다시 해 주세요.",
      ok_signup: "가입되었어요. 환영합니다! 바로 로그인되었어요.", ok_login: "로그인했어요.", ok_logout: "로그아웃했어요.",
      member_post_note: "{nick} 님 이름으로 올라가요. 어느 기기에서든 로그인하면 수정·삭제할 수 있어요.",
      btn_admin_del: "🗑 관리자 삭제", admin_del_confirm: "관리자 권한으로 이 글을 삭제할까요?", btn_check_code: "코드 확인", code_ph: "비밀코드 6자",
      code_match: "✓ 비밀코드가 맞아요.", code_nomatch: "✗ 비밀코드가 맞지 않아요.", deleted_admin: "관리자가 삭제한 글입니다.",
      nav_ai: "🤖 AI 리더", nav_biz: "🏢 비즈니스 리더", back_to_biz: "← 비즈니스 Top 50",
      theme_to_day: "☀️ 주간", theme_to_night: "🌙 야간", theme_title: "주간 / 야간 모드 바꾸기", board_title: "세계 톱 리더 게시판", board_sub: "AI 지도자와 이 사이트에 대한 생각을 자유롭게 나눠 주세요. 서로 존중하는 말로 부탁드립니다.",
      comments_leader_title: "의견",
      comments_count: "의견 {n}개",
      write_comment: "의견 쓰기",
      no_comment_cell: "의견 쓰기",
      anonymous: "참여자",
      placeholder_pw: "비밀번호 (선택 · 수정/삭제용)",
      btn_edit: "수정", btn_delete: "삭제", btn_save: "저장", btn_cancel: "취소", btn_confirm_delete: "정말 삭제할까요?",
      pw_prompt: "비밀번호", edited: "수정됨", deleted_msg: "작성자가 삭제한 의견입니다.",
      ok_edited: "수정되었습니다.", ok_deleted: "삭제되었습니다.", err_secret: "비밀번호가 맞지 않아요.",
      err_tries: "시도가 너무 많아요. 10분 뒤에 다시 해 주세요.", err_gone: "이미 삭제된 의견이에요.",
      err_pw_len: "비밀번호는 4~30자로 써 주세요.",
      err_len: "의견은 10~1,000자로 써 주세요.",
      err_len_reply: "댓글은 2~1,000자로 써 주세요.",
      err_rate_reply: "댓글은 15초에 한 번 쓸 수 있어요. 잠시 뒤 다시 눌러 주세요.",
      placeholder_reply: "댓글을 쓰세요 (2–1,000자)",
      err_author: "닉네임은 20자까지 쓸 수 있어요.",
      err_rate: "1분에 한 번만 등록할 수 있어요. 잠시 뒤 다시 시도해 주세요.",
      err_generic: "저장하지 못했어요. 다시 시도해 주세요.",
      err_load: "의견을 불러오지 못했어요.",
      ok_posted: "등록되었습니다. 감사합니다!",
      wait_sec: "{s}초 후",
      btn_liked: "좋아요 완료",
      replies: "댓글",
      th_author: "작성자",
      th_comment: "의견",
      th_time: "시각",
      back_to_list: "← Top 50 목록",
      rank_badge: "{n}위",
      metrics_title: "WTL 평가 점수",
      profile_title: "프로필",
      profile_pending: "상세 인적사항(출생·학력·경력)은 데이터 검토 후 추가됩니다.",
      not_found: "해당 지도자를 찾을 수 없습니다.",
      initials_note: "사진 준비 중 — 이니셜로 표시합니다.",
      m_research: "연구", m_business: "사업", m_agi: "AGI", m_wealth: "재산",
      p_org: "소속", p_role: "직책", p_rank: "순위", p_avg: "평균",
      p_birth: "출생", p_gender: "성별", p_nationality: "국적", p_education: "학력",
      p_career: "주요 경력", p_expertise: "전문 분야", p_net_worth: "추정 순자산", p_achievements: "대표 업적"
    }
  };
  var DICT = { en: {}, ko: {} };
  // 2026-10-21: 아주가 정한 게시판 문구. locales.json보다 앞선다.
  var FORCE = {
    en: { comments_all_title: "Free Board", comments_count: "{n} posts", btn_submit: "Submit" },
    ko: { comments_all_title: "자유 게시판", comments_count: "글 {n}개", btn_submit: "등록" }
  };
  // 브라우저 자동 번역이 게시판 문구를 엉뚱하게 바꾸던 문제(예: "전체 잠시 멈춰서") — 사이트가 KO/EN을 직접 하므로 끈다
  document.documentElement.setAttribute("translate", "no");
  var lang = (function () {
    try { var s = localStorage.getItem("wtl_lang"); if (s === "ko" || s === "en") return s; } catch (e) {}
    return (navigator.language || "").toLowerCase().indexOf("ko") === 0 ? "ko" : "en";
  })();
  var langListeners = [];

  function t(key, vars) {
    var s = (FORCE[lang] && FORCE[lang][key]) || (DICT[lang] && DICT[lang][key]) || (EXTRA[lang] && EXTRA[lang][key]) ||
            (DICT.en && DICT.en[key]) || (EXTRA.en && EXTRA.en[key]) || key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.replace("{" + k + "}", vars[k]); });
    return s;
  }
  function setLang(l) {
    lang = l === "ko" ? "ko" : "en";
    try { localStorage.setItem("wtl_lang", lang); } catch (e) {}
    document.documentElement.lang = lang;
    applyI18n(document);
    langListeners.forEach(function (fn) { try { fn(lang); } catch (e) { console.error(e); } });
  }
  function onLang(fn) { langListeners.push(fn); }
  function applyI18n(root) {
    root.querySelectorAll("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
    root.querySelectorAll("[data-i18n-ph]").forEach(function (el) { el.placeholder = t(el.getAttribute("data-i18n-ph")); });
    document.querySelectorAll(".wtl-lang button").forEach(function (b) { b.classList.toggle("on", b.dataset.lang === lang); });
  }
  function loadLocales(base) {
    return fetch(base + "data/locales.json", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (j) { DICT.en = j.en || {}; DICT.ko = j.ko || {}; })
      .catch(function () {});
  }

  /* ---------- 지도자 데이터 (data/leaders.csv, 키: slug) ---------- */
  function parseCSV(text) {
    var rows = [], row = [], cur = "", q = false, i, c;
    for (i = 0; i < text.length; i++) {
      c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; }
        else cur += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(cur); cur = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cur); cur = ""; if (row.length > 1 || row[0] !== "") rows.push(row); row = [];
      } else cur += c;
    }
    if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
    var head = rows.shift().map(function (h) { return h.trim(); });
    return rows.map(function (r) { var o = {}; head.forEach(function (h, k) { o[h] = (r[k] || "").trim(); }); return o; });
  }
  // 2026-10-21: 비즈니스 지도자 목록. business.html(body data-wtl-list="business") 또는 leader.html?list=business
  var LIST = (function () {
    var q = ""; try { q = new URLSearchParams(location.search).get("list") || ""; } catch (e) {}
    var b = document.body && document.body.getAttribute("data-wtl-list");
    return (b || q) === "business" ? "business" : "ai";
  })();
  function listFile() { return LIST === "business" ? "data/business_leaders.csv" : "data/leaders.csv"; }
  function loadLeaders(base) {
    return fetch(base + listFile(), { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error(listFile() + " " + r.status); return r.text(); })
      .then(parseCSV);
  }
  function leaderName(L) { return lang === "ko" && L.name_ko ? L.name_ko : L.name_en; }
  // 언어별 위키 주소. KO에서 wiki_ko 없으면 wiki_en으로 폴백.
  function wikiFor(L) {
    if (lang === "ko" && L.wiki_ko) return { url: L.wiki_ko, fallback: false };
    if (lang === "ko") return { url: L.wiki_en, fallback: true };
    return { url: L.wiki_en || L.wiki_ko, fallback: false };
  }
  function makeWikiLink(L, text) {
    var w = wikiFor(L);
    var a = el("a", { href: w.url || "#", target: "_blank", rel: "noopener", className: "wtl-wiki" });
    a.appendChild(document.createTextNode(text));
    if (w.fallback) {
      var b = el("span", { className: "wtl-badge-en", title: t("msg_wiki_fallback") }, t("badge_en"));
      a.appendChild(b);
      a.addEventListener("click", function () { toast(t("msg_wiki_fallback")); });
    }
    return a;
  }

  /* ---------- 이니셜 SVG ---------- */
  function initialsSVG(nameEn, slug, size) {
    size = size || 160;
    var parts = (nameEn || "?").replace(/[^A-Za-z\s\-]/g, " ").split(/[\s\-]+/).filter(Boolean);
    var ini = parts.length ? (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() : "?";
    var h = 0; for (var i = 0; i < (slug || "").length; i++) h = (h * 31 + slug.charCodeAt(i)) % 360;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 100 100">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(' + h + ',45%,32%)"/>' +
      '<stop offset="1" stop-color="hsl(' + ((h + 40) % 360) + ',50%,18%)"/></linearGradient></defs>' +
      '<rect width="100" height="100" rx="50" fill="url(#g)"/>' +
      '<circle cx="50" cy="50" r="47" fill="none" stroke="#d4af37" stroke-width="2"/>' +
      '<text x="50" y="50" dy=".35em" text-anchor="middle" font-family="Georgia,serif" font-size="38" fill="#f3e6b3">' + ini + '</text></svg>';
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  /* ---------- 공통 유틸 ---------- */
  function el(tag, props, text) {
    var e = document.createElement(tag);
    if (props) Object.keys(props).forEach(function (k) {
      if (k === "dataset") Object.assign(e.dataset, props[k]);
      else if (k in e) e[k] = props[k]; else e.setAttribute(k, props[k]);
    });
    if (text != null) e.textContent = text;
    return e;
  }
  function fmtTime(iso) {
    var d = new Date(iso); if (isNaN(d)) return "";
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes());
  }
  var toastTimer;
  function toast(msg, isErr) {
    var tEl = document.getElementById("wtl-toast");
    if (!tEl) { tEl = el("div", { id: "wtl-toast", role: "status" }); document.body.appendChild(tEl); }
    tEl.textContent = msg; tEl.className = "show" + (isErr ? " err" : "");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { tEl.className = ""; }, 3200);
  }
  function mountLangSwitch(container) {
    var box = el("div", { className: "wtl-lang", role: "group", "aria-label": "Language" });
    [["ko", "KO"], ["en", "EN"]].forEach(function (p) {
      var b = el("button", { type: "button" }, p[1]); b.dataset.lang = p[0];
      b.addEventListener("click", function () { setLang(p[0]); });
      box.appendChild(b);
    });
    container.appendChild(box);
    mountThemeSwitch(container);
  }

  /* ---------- 주간·야간 모드 ----------
   * 2026-10-21 추가 (아주 요청). 매일 바뀌는 index.html을 건드리지 않고 이 파일만으로 동작한다.
   * 페이지 본래 바탕(어두운 판 = 야간, 밝은 판 = 주간)을 기본으로 두고,
   * 방문자가 단추로 바꾸면 localStorage "wtl_theme"에 기억해 다음 방문과 다른 페이지에도 적용한다.
   */
  var D = "html[data-wtl-theme=day] ", N = "html[data-wtl-theme=night] ";
  var THEME_CSS = "" +
    ".wtl-theme{margin-left:8px;background:transparent;border:1px solid #1e3348;color:#c9d7e6;border-radius:999px;padding:5px 12px;font:13px system-ui,sans-serif;cursor:pointer;white-space:nowrap}.wtl-theme:hover{border-color:#d4af37;color:#d4af37}" +
    "#langbar,.wtl-topbar{flex-wrap:wrap}" +
    // 주간: 어두운 판(10-04 디자인)과 board.html을 밝게
    D + "{color-scheme:light}" +
    D + "body{background:#f4f6f9 !important;color:#14212e !important}" +
    D + "header{border-color:#d5dee8 !important}" + D + "h1{color:#0b1a2a}" +
    D + ".sub," + D + ".note," + D + "footer," + D + ".back{color:#5a6b7d !important}" +
    D + "a{color:#1F4E79}" +
    D + "table{background:#fff !important}" +
    D + "th{background:#eaf0f6 !important;color:#1d3247 !important;border-bottom-color:#b8912a !important}" +
    D + "td{border-bottom-color:#e1e8ef !important;color:#14212e}" +
    D + "tr:hover td{background:#eef4fa !important}" +
    D + ".r1 td{background:rgba(212,175,55,.22) !important}" + D + ".r2 td{background:rgba(150,160,170,.16) !important}" + D + ".r3 td{background:rgba(205,127,50,.16) !important}" +
    D + ".avg{color:#8a6a0e !important}" +
    D + ".wtl-theme{border-color:#c5d3e0;color:#1d3247}" +
    D + ".wtl-lang{border-color:#c5d3e0}" + D + ".wtl-lang button{color:#5a6b7d}" + D + ".wtl-lang button.on{color:#071018}" +
    D + ".wtl-board-link{color:#8a6a0e;border-color:rgba(154,123,22,.5)}" +
    D + ".wtl-sheet{background:#fff;border-color:#d5dee8}" + D + ".wtl-sheet-head h2{color:#14212e}" +
    D + ".wtl-count," + D + ".wtl-meta," + D + ".wtl-reply-meta," + D + ".wtl-replies-h," + D + ".wtl-counter," + D + ".wtl-gone," + D + ".wtl-empty," + D + ".wtl-grid .c0," + D + ".wtl-grid .c5{color:#5a6b7d}" +
    D + ".wtl-sort," + D + ".wtl-form textarea," + D + ".wtl-form input{background:#fff;color:#14212e;border-color:#c5d3e0}" +
    D + ".wtl-grid th{background:#eaf0f6 !important;color:#1d3247 !important}" + D + ".wtl-grid td{color:#14212e;border-bottom-color:#e1e8ef !important}" +
    D + ".wtl-row:hover td," + D + ".wtl-row.open td{background:#eef4fa !important}" + D + ".wtl-detail td{background:#f6f9fc !important}" +
    D + ".wtl-like{border-color:#c5d3e0;color:#14212e}" + D + ".wtl-like.on{border-color:#b8912a;color:#8a6a0e}" +
    D + ".wtl-mini{border-color:#c5d3e0;color:#5a6b7d}" + D + ".wtl-mini.danger{color:#b42318;border-color:#b42318}" + D + ".wtl-mini.on{color:#8a6a0e;border-color:#b8912a}" + D + ".wtl-mini:hover{color:#14212e;border-color:#2E75B6}" +
    D + ".wtl-pw-hint{color:#5a6b7d}" + D + ".wtl-mine{color:#8a6a0e;border-color:#b8912a}" + D + ".wtl-memb{color:#2E75B6}" + D + ".wtl-hello{color:#1d3247}" +
    D + ".wtl-modal-box{background:#fff;color:#14212e;border-color:#b8912a}" + D + ".wtl-code{background:#fbf3d6;color:#8a6a0e;border-color:#b8912a}" + D + ".wtl-linkbtn{color:#1F4E79}" +
    D + ".wtl-nav-link{color:#1d3247;border-color:#c5d3e0}" +
    D + ".wtl-replies{border-left-color:#d5dee8}" + D + ".wtl-reply{border-bottom-color:#d5dee8}" +
    D + ".wtl-form-note{color:#1e7a3c}" + D + ".wtl-form-note.err{color:#b42318}" +
    D + "#wtl-toast{background:#fff;color:#14212e}" +
    D + ".wtl-notice{background:#fbf3d6;color:#5b4708}" + D + ".wtl-notice a{color:#1F4E79}" + D + ".wtl-notice button{color:#5b4708}" +
    // 야간: 밝은 판(10-11~ 매일판)을 어둡게
    N + "{color-scheme:dark}" +
    N + "body{background:#071018 !important;color:#e8eef5 !important}" +
    N + ":is(header,main,section,article,nav,footer,.wrap,.container,.card,.table-wrap,.wtl-table-wrap){background-color:transparent !important}" +
    N + ":is(h1,h2,h3,h4,p,li,caption):not([class*=wtl]){color:inherit !important}" +
    N + "a{color:#7ec8ff}" +
    N + "table{background:#0e1a28 !important}" +
    N + "th{background:#102033 !important;color:#c9d7e6 !important;border-bottom-color:#d4af37 !important}" +
    N + "td{background-color:transparent;border-color:#1e3348 !important;color:#e8eef5 !important}" +
    N + "tr:hover td{background:#132536 !important}";
  function nativeTheme() {
    var cs = getComputedStyle(document.body), m = cs.backgroundColor.match(/[\d.]+/g);
    if (!m) return "night";
    if (m.length >= 4 && +m[3] === 0) return cs.backgroundImage === "none" ? "day" : "night"; // 바탕색이 없으면 흰 바탕 또는 그림 바탕
    return (+m[0] + +m[1] + +m[2]) / 3 > 160 ? "day" : "night";
  }
  var native = null, themeBtns = [];
  function theme() {
    try { var s = localStorage.getItem("wtl_theme"); if (s === "day" || s === "night") return s; } catch (e) {}
    return native || "night";
  }
  function applyTheme() {
    if (!document.body) return;
    if (!native) {
      if (!document.getElementById("wtl-theme-css")) { var st4 = el("style", { id: "wtl-theme-css" }); st4.textContent = THEME_CSS; document.head.appendChild(st4); }
      native = nativeTheme();
    }
    var cur = theme(), root = document.documentElement;
    if (cur === native) root.removeAttribute("data-wtl-theme"); else root.setAttribute("data-wtl-theme", cur);
    // 기존 밝은 바탕 보정(.wtl-light)을 지금 보이는 모드에 맞춘다
    document.body.classList.toggle("wtl-light", cur === "day");
    themeBtns.forEach(function (b) {
      b.textContent = t(cur === "day" ? "theme_to_night" : "theme_to_day");
      b.title = t("theme_title");
      b.setAttribute("aria-label", t("theme_title"));
    });
  }
  function setTheme(v) {
    try { localStorage.setItem("wtl_theme", v); } catch (e) {}
    applyTheme();
  }
  function mountThemeSwitch(container) {
    if (container.querySelector(".wtl-theme")) return;
    var b = el("button", { type: "button", className: "wtl-theme" });
    b.addEventListener("click", function () { setTheme(theme() === "day" ? "night" : "day"); });
    container.appendChild(b);
    themeBtns.push(b);
    applyTheme();
  }
  onLang(applyTheme);

  /* ---------- Supabase REST ---------- */
  function api(path, opts) {
    opts = opts || {};
    var headers = { apikey: SUPABASE_KEY, "Content-Type": "application/json" };
    if (opts.prefer) headers.Prefer = opts.prefer;
    return fetch(REST + path, { method: opts.method || "GET", headers: headers, body: opts.body ? JSON.stringify(opts.body) : undefined })
      .then(function (r) {
        return r.text().then(function (txt) {
          var data = null; try { data = txt ? JSON.parse(txt) : null; } catch (e) {}
          if (!r.ok) { var err = new Error((data && data.message) || ("HTTP " + r.status)); err.status = r.status; throw err; }
          return data;
        });
      });
  }
  var newCols = true;
  function fetchComments(slug) {
    var tail = "&order=created_at.desc&limit=1000" + (slug ? "&slug=eq." + encodeURIComponent(slug) : "");
    if (!newCols) return api("/" + TABLE + "?select=" + COLS + tail);
    return api("/" + TABLE + "?select=" + COLS + ",is_member" + tail).catch(function (e) {
      if (e.status !== 400 && e.status !== 401 && e.status !== 403) throw e;
      newCols = false; return api("/" + TABLE + "?select=" + COLS + tail);
    });
  }
  function postComment(row) {
    var send = function (r) { return api("/" + TABLE + "?select=id", { method: "POST", body: r, prefer: "return=representation" }); };
    return send(row).catch(function (e) {
      // 서버에 새 칸(edit_code, member_token)이 아직 없으면 예전 방식으로 한 번 더 보낸다
      if ((row.edit_code || row.member_token) && /edit_code|member_token|column|permission/i.test(e.message || "")) {
        var r2 = {}; Object.keys(row).forEach(function (k) { if (k !== "edit_code" && k !== "member_token") r2[k] = row[k]; });
        row._legacy = true; return send(r2);
      }
      throw e;
    });
  }
  function editComment(id, secret, body) { return api("/rpc/wtl_comment_edit", { method: "POST", body: { p_id: id, p_secret: secret, p_body: body } }); }
  function deleteComment(id, secret) { return api("/rpc/wtl_comment_delete", { method: "POST", body: { p_id: id, p_secret: secret } }); }
  // 로그인 없이 수정·삭제: 글쓴 브라우저에는 비밀 토큰을 저장, 다른 기기에서는 비밀번호로
  function tokens() { try { return JSON.parse(localStorage.getItem("wtl_tokens") || "{}"); } catch (e) { return {}; } }
  function saveToken(id, tok) { try { var m = tokens(); m[id] = tok; localStorage.setItem("wtl_tokens", JSON.stringify(m)); } catch (e) {} }
  function newToken() {
    var a = new Uint8Array(16);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(a); else for (var i = 0; i < 16; i++) a[i] = Math.floor(Math.random() * 256);
    return Array.prototype.map.call(a, function (b) { return (b < 16 ? "0" : "") + b.toString(16); }).join("");
  }
  function statusMsg(s) {
    return s === "BAD_SECRET" ? t("err_secret") : s === "TOO_MANY_TRIES" ? t("err_tries") : s === "NOT_FOUND" ? t("err_gone") : s === "BAD_LENGTH" ? t("err_len") : t("err_generic");
  }
  function likeComment(id) { return api("/rpc/wtl_comment_like", { method: "POST", body: { p_id: id } }); }

  function likedSet() { try { return JSON.parse(localStorage.getItem("wtl_liked") || "[]"); } catch (e) { return []; } }
  function markLiked(id) { try { var s = likedSet(); if (s.indexOf(id) < 0) { s.push(id); localStorage.setItem("wtl_liked", JSON.stringify(s.slice(-500))); } } catch (e) {} }
  function lastPostAt() { try { return +localStorage.getItem("wtl_last_post") || 0; } catch (e) { return 0; } }
  function setLastPost() { try { localStorage.setItem("wtl_last_post", String(Date.now())); } catch (e) {} }
  function lastReplyAt() { try { return +localStorage.getItem("wtl_last_reply") || 0; } catch (e) { return 0; } }
  function setLastReply() { try { localStorage.setItem("wtl_last_reply", String(Date.now())); } catch (e) {} }
  function errMsg(e, isReply) {
    var m = (e && e.message) || "";
    if (m.indexOf("RATE_LIMIT") >= 0) return t(isReply ? "err_rate_reply" : "err_rate");
    if (m.indexOf("row-level security") >= 0 || m.indexOf("check constraint") >= 0) return t(isReply ? "err_len_reply" : "err_len");
    return t("err_generic");
  }
  function validate(author, body, isReply) {
    if (author.length > AUTHOR_MAX) return t("err_author");
    if (body.length < (isReply ? REPLY_MIN : BODY_MIN) || body.length > BODY_MAX) return t(isReply ? "err_len_reply" : "err_len");
    var wait = isReply ? REPLY_COOLDOWN_MS - (Date.now() - lastReplyAt()) : COOLDOWN_MS - (Date.now() - lastPostAt());
    if (wait > 0) return t(isReply ? "err_rate_reply" : "err_rate");
    return null;
  }

  /* ---------- 회원·비밀코드·관리자 (2026-10-21) ----------
   * 회원은 Supabase의 wtl_members 표(닉네임+비밀번호, 이메일 없음). 로그인하면 받은 열쇠를 localStorage "wtl_member"에 둔다.
   * 관리자는 is_admin=true인 회원. 삭제·코드 확인은 모두 서버 함수가 다시 확인하므로 화면만 고쳐서는 할 수 없다.
   */
  function rpc(name, body) { return api("/rpc/" + name, { method: "POST", body: body }); }
  var member = (function () { try { var m = JSON.parse(localStorage.getItem("wtl_member") || "null"); return m && m.token ? m : null; } catch (e) { return null; } })();
  var memberListeners = [];
  function onMember(fn) { memberListeners.push(fn); }
  function setMember(m) {
    member = m;
    try { if (m) localStorage.setItem("wtl_member", JSON.stringify(m)); else localStorage.removeItem("wtl_member"); } catch (e) {}
    memberListeners.forEach(function (fn) { try { fn(member); } catch (e) { console.error(e); } });
  }
  var memberChecked = false;
  function checkMember() {
    if (!member || memberChecked) return; memberChecked = true;
    rpc("wtl_member_me", { p_token: member.token }).then(function (r) {
      if (!r) setMember(null);
      else if (r.nickname !== member.nickname || !!r.is_admin !== !!member.is_admin) setMember({ token: member.token, nickname: r.nickname, is_admin: !!r.is_admin });
    }).catch(function (e) { if (e.status === 404) setMember(null); });
  }
  function isMine(c) { return !!(member && c.is_member && c.author === member.nickname); }

  function codes() { try { return JSON.parse(localStorage.getItem("wtl_codes") || "{}"); } catch (e) { return {}; } }
  function saveCode(id, code) { try { var m = codes(); m[id] = code; localStorage.setItem("wtl_codes", JSON.stringify(m)); } catch (e) {} }
  function newCode() {
    var A = "abcdefghijkmnpqrstuvwxyz23456789", a = new Uint8Array(6), s = "";
    (window.crypto || window.msCrypto).getRandomValues(a);
    for (var i = 0; i < 6; i++) s += A.charAt(a[i] % A.length);
    return s;
  }

  function openModal(build) {
    var ov = el("div", { className: "wtl-modal" });
    var box = el("div", { className: "wtl-modal-box", role: "dialog" }); box.setAttribute("aria-modal", "true");
    ov.appendChild(box);
    function close() { ov.remove(); document.removeEventListener("keydown", esc); }
    function esc(e) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", esc);
    ov.addEventListener("click", function (e) { if (e.target === ov) close(); });
    build(box, close);
    document.body.appendChild(ov);
    var f = box.querySelector("input,button.wtl-submit"); if (f) f.focus();
    return close;
  }
  function showCode(code) {
    openModal(function (box, close) {
      box.appendChild(el("h3", null, t("code_title")));
      var parts = t("code_msg", { code: "\u0001" }).split("\u0001");
      var p = el("p", { className: "wtl-code-msg" });
      p.appendChild(document.createTextNode(parts[0])); p.appendChild(el("strong", { className: "wtl-code" }, code)); p.appendChild(document.createTextNode(parts[1] || ""));
      box.appendChild(p);
      var row = el("div", { className: "wtl-modal-row" });
      var cp = el("button", { type: "button", className: "wtl-mini" }, t("btn_copy"));
      cp.addEventListener("click", function () { try { navigator.clipboard.writeText(code).then(function () { toast(t("copied")); }); } catch (e) {} });
      var cl = el("button", { type: "button", className: "wtl-submit" }, t("btn_close"));
      cl.addEventListener("click", close);
      row.appendChild(cp); row.appendChild(cl); box.appendChild(row);
    });
  }
  function openAuth(mode) {
    openModal(function (box, close) {
      function paint() {
        box.innerHTML = "";
        var signup = mode === "signup";
        box.appendChild(el("h3", null, t(signup ? "signup" : "login")));
        var f = el("form", { className: "wtl-form", noValidate: true });
        var nick = el("input", { type: "text", maxLength: 20, placeholder: t("f_nick"), autocomplete: "username" });
        var pw = el("input", { type: "password", maxLength: 72, placeholder: t("f_pw"), autocomplete: signup ? "new-password" : "current-password" });
        var pw2 = el("input", { type: "password", maxLength: 72, placeholder: t("f_pw2"), autocomplete: "new-password" });
        f.appendChild(nick); f.appendChild(pw); if (signup) { f.appendChild(pw2); f.appendChild(el("div", { className: "wtl-pw-hint" }, t("signup_note"))); }
        var note = el("div", { className: "wtl-form-note err", role: "alert" });
        f.appendChild(note);
        var row = el("div", { className: "wtl-modal-row" });
        var sw = el("button", { type: "button", className: "wtl-linkbtn" }, t(signup ? "to_login" : "to_signup"));
        sw.addEventListener("click", function () { mode = signup ? "login" : "signup"; paint(); });
        var cancel = el("button", { type: "button", className: "wtl-mini" }, t("btn_cancel"));
        cancel.addEventListener("click", close);
        var go = el("button", { type: "submit", className: "wtl-submit" }, t(signup ? "signup" : "login"));
        row.appendChild(sw); row.appendChild(cancel); row.appendChild(go); f.appendChild(row);
        function say(m) { note.textContent = m || ""; note.className = "wtl-form-note err" + (m ? " show" : ""); }
        f.addEventListener("submit", function (ev) {
          ev.preventDefault();
          var n = nick.value.trim(), a = pw.value;
          if (n.length < 2 || n.length > 20) return say(t("err_nick"));
          if (a.length < 6) return say(t("err_pw6"));
          if (signup && a !== pw2.value) return say(t("err_pw_match"));
          go.disabled = true;
          rpc(signup ? "wtl_member_signup" : "wtl_member_login", { p_nick: n, p_pw: a }).then(function (r) {
            if (!r || r.error || !r.token) {
              var e = r && r.error;
              say(t(e === "NICK_TAKEN" ? "err_nick_taken" : e === "BAD_NICK" ? "err_nick" : e === "BAD_PW" ? "err_pw6" : e === "RATE_LIMIT" ? "err_auth_rate" : e === "TOO_MANY_TRIES" ? "err_tries" : "err_login"));
              return;
            }
            setMember({ token: r.token, nickname: r.nickname, is_admin: !!r.is_admin });
            toast(t(signup ? "ok_signup" : "ok_login")); close();
          }).catch(function (e) { console.error(e); say(t(e.status === 404 ? "err_auth_down" : "err_generic")); })
            .then(function () { go.disabled = false; });
        });
        box.appendChild(f);
        nick.focus();
      }
      paint();
    });
  }
  // 회원가입·로그인 단추 (게시판 맨 윗줄 오른쪽)
  function makeAuthBar() {
    var box = el("span", { className: "wtl-auth" });
    function paint() {
      box.innerHTML = "";
      if (member) {
        box.appendChild(el("span", { className: "wtl-hello" }, "👤 " + t("hello", { nick: member.nickname })));
        if (member.is_admin) box.appendChild(el("span", { className: "wtl-admin-badge" }, t("admin_mode")));
        var lo = el("button", { type: "button", className: "wtl-mini" }, t("logout"));
        lo.addEventListener("click", function () { var tk = member.token; setMember(null); rpc("wtl_member_logout", { p_token: tk }).catch(function () {}); toast(t("ok_logout")); });
        box.appendChild(lo);
      } else {
        var su = el("button", { type: "button", className: "wtl-mini on" }, t("signup"));
        su.addEventListener("click", function () { openAuth("signup"); });
        var li = el("button", { type: "button", className: "wtl-mini" }, t("login"));
        li.addEventListener("click", function () { openAuth("login"); });
        box.appendChild(su); box.appendChild(li);
      }
    }
    paint(); onLang(paint); onMember(paint);
    return box;
  }

  /* ---------- 엑셀형 의견 시트 ---------- */
  // mountCommentSheet(container, slug, { title }) — slug = 지도자 slug 또는 "ALL"
  function mountCommentSheet(container, slug, options) {
    options = options || {};
    var state = { items: [], sort: "latest", open: {}, replyForms: {} };
    var root = el("section", { className: "wtl-sheet", id: options.id || "" });
    root.setAttribute("translate", "no");
    var authBar = makeAuthBar();
    checkMember();
    var headBox = el("div"), gridBox = el("div");
    container.appendChild(root);

    function buildForm(parentId, onDone) {
      var f = el("form", { className: parentId ? "wtl-form reply" : "wtl-form", noValidate: true });
      var author = el("input", { type: "text", maxLength: AUTHOR_MAX, className: "wtl-author" });
      author.dataset.i18nPh = "placeholder_author"; author.placeholder = t("placeholder_author");
      try { author.value = localStorage.getItem("wtl_author") || ""; } catch (e) {}
      var body = el("textarea", { maxLength: BODY_MAX, rows: parentId ? 2 : 3, className: "wtl-body" });
      var phKey = parentId ? "placeholder_reply" : slug === "ALL" ? "placeholder_board" : "placeholder_comment";
      body.dataset.i18nPh = phKey; body.placeholder = t(phKey);
      var minLen = parentId ? REPLY_MIN : BODY_MIN;
      // 막히면 화면 맨 아래 알림만으로는 놓치기 쉬워서, 입력칸 바로 아래에도 알려 준다
      var note = el("div", { className: "wtl-form-note", role: "alert" });
      function say(msg, isErr) { note.textContent = msg || ""; note.className = "wtl-form-note" + (msg ? " show" : "") + (isErr ? " err" : ""); if (msg) toast(msg, isErr); clearTimeout(note._t); if (msg && !isErr) note._t = setTimeout(function () { say(""); }, 4000); }
      var pw = el("input", { type: "password", maxLength: 30, className: "wtl-pw", autocomplete: "new-password" });
      pw.dataset.i18nPh = "placeholder_pw"; pw.placeholder = t("placeholder_pw");
      var counter = el("span", { className: "wtl-counter" }, "0/" + BODY_MAX);
      var btn = el("button", { type: "submit", className: "wtl-submit" }, parentId ? t("btn_reply") : t("btn_submit"));
      btn.dataset.i18n = parentId ? "btn_reply" : "btn_submit";
      body.addEventListener("input", function () {
        var n = body.value.trim().length;
        counter.textContent = n + "/" + BODY_MAX;
        counter.classList.toggle("bad", n > 0 && n < minLen);
        if (note.className.indexOf("err") >= 0) { note.textContent = ""; note.className = "wtl-form-note"; }
      });
      var row = el("div", { className: "wtl-form-row" });
      row.appendChild(author); row.appendChild(pw); row.appendChild(counter); row.appendChild(btn);
      f.appendChild(body); f.appendChild(row); f.appendChild(note);
      // 회원으로 로그인했으면 닉네임·비밀번호 칸 대신 안내 한 줄
      var memNote = el("div", { className: "wtl-pw-hint wtl-mem-note" });
      f.insertBefore(memNote, note);
      function syncMember() {
        author.style.display = pw.style.display = member ? "none" : "";
        memNote.style.display = member ? "" : "none";
        memNote.textContent = member ? "👤 " + t("member_post_note", { nick: member.nickname }) : "";
      }
      syncMember(); onMember(syncMember); onLang(syncMember);
      // 2026-10-21: 본 글 쓰기 칸 아래 안내 두 줄 (아주 문구)
      if (!parentId) {
        ["board_note1", "board_note2"].forEach(function (k) { var d = el("div", { className: "wtl-pw-hint" }, t(k)); d.dataset.i18n = k; f.appendChild(d); });
      }
      f.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var a = author.value.trim(), b = body.value.trim();
        var v = validate(a, b, !!parentId);
        if (!v && pw.value && (pw.value.length < 4 || pw.value.length > 30)) v = t("err_pw_len");
        if (v) { say(v, true); return; }
        btn.disabled = true;
        var tok = newToken();
        var rec = { slug: slug, author: a || "참여자", lang: lang, body: b, edit_token: tok };
        var code = null;
        if (member) { rec.member_token = member.token; rec.author = member.nickname; }
        else { code = newCode(); rec.edit_code = code; if (pw.value) rec.edit_pw = pw.value; }
        if (parentId) rec.parent_comment_id = parentId;
        postComment(rec).then(function (rows) {
          if (rows && rows[0] && rows[0].id) { saveToken(rows[0].id, tok); if (code && !rec._legacy) saveCode(rows[0].id, code); }
          if (code && !rec._legacy) showCode(code);
          pw.value = "";
          if (parentId) setLastReply(); else setLastPost();
          try { localStorage.setItem("wtl_author", a); } catch (e) {}
          body.value = ""; counter.textContent = "0/" + BODY_MAX;
          say(t("ok_posted"));
          if (parentId) state.open[parentId] = true;
          return reload().then(onDone);
        }).catch(function (e) { console.error(e); say(errMsg(e, !!parentId), true); })
          .then(function () { btn.disabled = false; });
      });
      return f;
    }

    function goneMsg(c) { return c.body === "(deleted by admin)" ? t("deleted_admin") : t("deleted_msg"); }
    function shownAuthor(c) { return c.author === "참여자" || c.author === "Anonymous" ? t("anonymous") : c.author; }
    function metaText(c) { return shownAuthor(c) + " · " + fmtTime(c.created_at) + (c.edited_at ? " · " + t("edited") : ""); }

    // 관리자 단추: 아무 글이나 삭제, 비밀코드 확인 (서버가 관리자인지 다시 확인한다)
    function adminControls(c, box) {
      var del = el("button", { type: "button", className: "wtl-mini danger" }, t("btn_admin_del"));
      var chk = el("button", { type: "button", className: "wtl-mini" }, t("btn_check_code"));
      del.addEventListener("click", function (ev) {
        ev.stopPropagation();
        if (!window.confirm(t("admin_del_confirm"))) return;
        del.disabled = true;
        rpc("wtl_admin_delete", { p_token: member.token, p_id: c.id }).then(function (s) {
          if (s === "OK") { toast(t("ok_deleted")); return reload(); }
          toast(s === "NOT_ADMIN" ? t("err_generic") : statusMsg(s), true); del.disabled = false;
        }).catch(function (e) { console.error(e); toast(t("err_generic"), true); del.disabled = false; });
      });
      chk.addEventListener("click", function (ev) {
        ev.stopPropagation();
        var f = el("span", { className: "wtl-pwask" });
        var inp = el("input", { type: "text", maxLength: 6, placeholder: t("code_ph"), className: "wtl-pw" });
        var ok = el("button", { type: "button", className: "wtl-mini on" }, "OK");
        f.appendChild(inp); f.appendChild(ok); chk.replaceWith(f); inp.focus();
        function go() {
          rpc("wtl_admin_check_code", { p_token: member.token, p_id: c.id, p_code: inp.value }).then(function (s) {
            toast(t(s === "MATCH" ? "code_match" : "code_nomatch"), s !== "MATCH");
          }).catch(function (e) { console.error(e); toast(t("err_generic"), true); });
        }
        ok.addEventListener("click", function (e) { e.stopPropagation(); go(); });
        inp.addEventListener("click", function (e) { e.stopPropagation(); });
        inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); go(); } });
      });
      box.appendChild(chk); box.appendChild(del);
    }

    // 수정·삭제 버튼. 이 브라우저에서 쓴 글이면 바로, 아니면 비밀번호를 물어본다.
    function ownerControls(c, bodyEl) {
      var box = el("span", { className: "wtl-owner" });
      var editB = el("button", { type: "button", className: "wtl-mini" }, t("btn_edit"));
      var delB = el("button", { type: "button", className: "wtl-mini" }, t("btn_delete"));
      box.appendChild(editB); box.appendChild(delB);
      var myCode = codes()[c.id];
      if (myCode) box.insertBefore(el("span", { className: "wtl-meta", title: t("my_code") }, "🔑 " + myCode), editB);
      if (member && member.is_admin) adminControls(c, box);
      function withSecret(onSecret) {
        if (isMine(c)) { onSecret(member.token); return; }
        var tok = tokens()[c.id];
        if (tok) { onSecret(tok); return; }
        var f = el("span", { className: "wtl-pwask" });
        var inp = el("input", { type: "password", maxLength: 30, placeholder: t("pw_prompt2"), className: "wtl-pw" });
        var ok = el("button", { type: "button", className: "wtl-mini on" }, "OK");
        var cancel = el("button", { type: "button", className: "wtl-mini" }, t("btn_cancel"));
        f.appendChild(inp); f.appendChild(ok); f.appendChild(cancel);
        box.innerHTML = ""; box.appendChild(f); inp.focus();
        ok.addEventListener("click", function (e) { e.stopPropagation(); if (inp.value) onSecret(inp.value); });
        inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); if (inp.value) onSecret(inp.value); } });
        cancel.addEventListener("click", function (e) { e.stopPropagation(); render(); });
      }
      editB.addEventListener("click", function (ev) {
        ev.stopPropagation();
        withSecret(function (secret) {
          var ta = el("textarea", { maxLength: BODY_MAX, rows: 4, className: "wtl-body wtl-edit" }); ta.value = c.body;
          var save = el("button", { type: "button", className: "wtl-submit" }, t("btn_save"));
          var cancel = el("button", { type: "button", className: "wtl-mini" }, t("btn_cancel"));
          var ed = el("div", { className: "wtl-form" }); ed.appendChild(ta);
          var r = el("div", { className: "wtl-form-row" }); r.appendChild(cancel); r.appendChild(save); ed.appendChild(r);
          bodyEl.innerHTML = ""; bodyEl.appendChild(ed); box.innerHTML = ""; ta.focus();
          cancel.addEventListener("click", function (e) { e.stopPropagation(); render(); });
          save.addEventListener("click", function (e) {
            e.stopPropagation();
            var nb = ta.value.trim();
            var isRep = !!c.parent_comment_id;
            if (nb.length < (isRep ? REPLY_MIN : BODY_MIN) || nb.length > BODY_MAX) { toast(t(isRep ? "err_len_reply" : "err_len"), true); return; }
            save.disabled = true;
            editComment(c.id, secret, nb).then(function (s) {
              if (s === "OK") { toast(t("ok_edited")); return reload(); }
              toast(statusMsg(s), true); render();
            }).catch(function (err) { console.error(err); toast(t("err_generic"), true); render(); });
          });
        });
      });
      delB.addEventListener("click", function (ev) {
        ev.stopPropagation();
        withSecret(function (secret) {
          var yes = el("button", { type: "button", className: "wtl-mini danger" }, t("btn_confirm_delete"));
          var no = el("button", { type: "button", className: "wtl-mini" }, t("btn_cancel"));
          box.innerHTML = ""; box.appendChild(yes); box.appendChild(no);
          no.addEventListener("click", function (e) { e.stopPropagation(); render(); });
          yes.addEventListener("click", function (e) {
            e.stopPropagation(); yes.disabled = true;
            deleteComment(c.id, secret).then(function (s) {
              if (s === "OK") { toast(t("ok_deleted")); return reload(); }
              toast(statusMsg(s), true); render();
            }).catch(function (err) { console.error(err); toast(t("err_generic"), true); render(); });
          });
        });
      });
      return box;
    }

    function likeBtn(c) {
      var liked = likedSet().indexOf(c.id) >= 0;
      var b = el("button", { type: "button", className: "wtl-like" + (liked ? " on" : ""), title: t("btn_like") }, "👍 " + c.likes);
      b.addEventListener("click", function (ev) {
        ev.stopPropagation();
        if (likedSet().indexOf(c.id) >= 0) { toast(t("btn_liked")); return; }
        b.disabled = true;
        likeComment(c.id).then(function (n) {
          markLiked(c.id); c.likes = typeof n === "number" ? n : c.likes + 1;
          b.textContent = "👍 " + c.likes; b.classList.add("on");
        }).catch(function (e) { console.error(e); toast(t("err_generic"), true); })
          .then(function () { b.disabled = false; });
      });
      return b;
    }

    function render() {
      headBox.innerHTML = ""; gridBox.innerHTML = "";
      var kids = {};
      state.items.forEach(function (c) { if (c.parent_comment_id && !c.deleted_at) (kids[c.parent_comment_id] = kids[c.parent_comment_id] || []).push(c); });
      // 삭제된 의견은 달린 댓글이 있을 때만 흔적을 남긴다
      var tops = state.items.filter(function (c) { return !c.parent_comment_id && (!c.deleted_at || (kids[c.id] || []).length); });
      var liveCount = state.items.filter(function (c) { return !c.deleted_at; }).length;
      Object.keys(kids).forEach(function (k) { kids[k].sort(function (a, b) { return a.created_at < b.created_at ? -1 : 1; }); });
      var byLatest = function (a, b) { return a.created_at < b.created_at ? 1 : -1; };
      tops.sort(state.sort === "likes" ? function (a, b) { return (b.likes - a.likes) || byLatest(a, b); }
        : state.sort === "replies" ? function (a, b) { return ((kids[b.id] || []).length - (kids[a.id] || []).length) || byLatest(a, b); }
        : byLatest);

      var head = el("div", { className: "wtl-sheet-head" });
      head.appendChild(el("h2", null, options.title ? options.title() : t("comments_leader_title")));
      head.appendChild(el("span", { className: "wtl-count" }, t("comments_count", { n: liveCount })));
      var sel = el("select", { className: "wtl-sort", "aria-label": "sort" });
      [["latest", "label_latest"], ["likes", "label_likes"], ["replies", "label_replies"]].forEach(function (o) {
        var op = el("option", { value: o[0] }, t(o[1])); if (state.sort === o[0]) op.selected = true; sel.appendChild(op);
      });
      sel.addEventListener("change", function () { state.sort = sel.value; render(); });
      head.appendChild(sel);
      head.appendChild(authBar);
      headBox.appendChild(head);

      var table = el("table", { className: "wtl-grid" });
      var thead = el("thead"); var hr = el("tr");
      ["#", t("th_author"), t("th_comment"), "👍", "💬", t("th_time")].forEach(function (h, i) {
        hr.appendChild(el("th", { className: "c" + i }, h));
      });
      thead.appendChild(hr); table.appendChild(thead);
      var tb = el("tbody");
      if (state.error) {
        var er = el("tr"); er.appendChild(el("td", { colSpan: 6, className: "wtl-empty" }, t("err_load"))); tb.appendChild(er);
      } else if (!tops.length) {
        var em = el("tr"); em.appendChild(el("td", { colSpan: 6, className: "wtl-empty" }, t("empty_comments"))); tb.appendChild(em);
      }
      var myTok = tokens(); // 이 브라우저에서 쓴 글 표시용
      tops.forEach(function (c, idx) {
        var reps = kids[c.id] || [];
        var tr = el("tr", { className: "wtl-row" + (state.open[c.id] ? " open" : ""), tabIndex: 0 });
        tr.setAttribute("aria-expanded", state.open[c.id] ? "true" : "false");
        tr.appendChild(el("td", { className: "c0" }, String(idx + 1)));
        var gone = !!c.deleted_at;
        var who = el("td", { className: "c1" }, gone ? "—" : shownAuthor(c));
        if (!gone && (myTok[c.id] || isMine(c))) who.insertBefore(el("span", { className: "wtl-mine", title: t("mine_title") }, t("mine")), who.firstChild);
        else if (!gone && c.is_member) who.insertBefore(el("span", { className: "wtl-memb", title: t("member_badge") }, "✓"), who.firstChild);
        tr.appendChild(who);
        var bodyTd = el("td", { className: "c2" }); bodyTd.appendChild(el("div", { className: "wtl-ell" + (gone ? " wtl-gone" : "") }, gone ? goneMsg(c) : c.body)); tr.appendChild(bodyTd);
        tr.appendChild(el("td", { className: "c3" }, String(c.likes)));
        tr.appendChild(el("td", { className: "c4" }, String(reps.length)));
        tr.appendChild(el("td", { className: "c5" }, fmtTime(c.created_at)));
        var toggle = function () { state.open[c.id] = !state.open[c.id]; render(); };
        tr.addEventListener("click", toggle);
        tr.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
        tb.appendChild(tr);
        if (state.open[c.id]) {
          var dr = el("tr", { className: "wtl-detail" }); var td = el("td", { colSpan: 6 });
          var full = el("div", { className: "wtl-full" + (gone ? " wtl-gone" : "") }, gone ? goneMsg(c) : c.body);
          td.appendChild(full);
          if (!gone) {
            var act = el("div", { className: "wtl-actions" }); act.appendChild(likeBtn(c));
            act.appendChild(el("span", { className: "wtl-meta" }, metaText(c)));
            act.appendChild(ownerControls(c, full));
            td.appendChild(act);
          }
          var rl = el("div", { className: "wtl-replies" });
          rl.appendChild(el("div", { className: "wtl-replies-h" }, t("replies") + " " + reps.length));
          reps.forEach(function (r) {
            var ri = el("div", { className: "wtl-reply" });
            var rm = el("div", { className: "wtl-reply-meta" }, "↳ " + metaText(r));
            if (myTok[r.id] || isMine(r)) rm.appendChild(el("span", { className: "wtl-mine", title: t("mine_title") }, t("mine")));
            ri.appendChild(rm);
            var rb = el("div", { className: "wtl-reply-body" }, r.body); ri.appendChild(rb);
            var ra = el("div", { className: "wtl-actions" }); ra.appendChild(likeBtn(r)); ra.appendChild(ownerControls(r, rb)); ri.appendChild(ra);
            rl.appendChild(ri);
          });
          if (!gone) {
            if (!state.replyForms[c.id]) state.replyForms[c.id] = buildForm(c.id);
            rl.appendChild(state.replyForms[c.id]);
          }
          td.appendChild(rl); dr.appendChild(td); tb.appendChild(dr);
        }
      });
      table.appendChild(tb);
      var wrap = el("div", { className: "wtl-grid-wrap" }); wrap.appendChild(table);
      gridBox.appendChild(wrap);
    }

    function reload() {
      return fetchComments(slug).then(function (rows) { state.items = rows || []; state.error = false; render(); })
        .catch(function (e) { console.error(e); state.error = true; render(); });
    }
    root.appendChild(headBox);
    root.appendChild(buildForm(null));
    root.appendChild(gridBox);
    onLang(render);
    onMember(render);
    render();
    return reload();
  }

  /* ---------- 공통 스타일 ---------- */
  var CSS = "" +
    ".wtl-lang{display:inline-flex;border:1px solid #1e3348;border-radius:999px;overflow:hidden;font-family:system-ui,sans-serif}" +
    ".wtl-lang button{background:transparent;color:#8aa0b5;border:0;padding:6px 14px;font-size:13px;cursor:pointer}" +
    ".wtl-lang button.on{background:#d4af37;color:#071018;font-weight:700}" +
    ".wtl-wiki{color:#e8eef5;text-decoration:none;border-bottom:1px dotted #7ec8ff}.wtl-wiki:hover{color:#7ec8ff}" +
    ".wtl-badge-en{display:inline-block;margin-left:6px;padding:0 5px;border:1px solid #7ec8ff;border-radius:4px;font-size:10px;line-height:15px;color:#7ec8ff;vertical-align:1px}" +
    ".wtl-detail-link{margin-left:8px;font-size:11px;color:#d4af37;text-decoration:none;white-space:nowrap}.wtl-detail-link:hover{text-decoration:underline}" +
    "#wtl-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(20px);background:#102033;color:#e8eef5;border:1px solid #d4af37;padding:10px 16px;border-radius:10px;font:14px system-ui,sans-serif;opacity:0;pointer-events:none;transition:.25s;z-index:99;max-width:calc(100% - 32px)}" +
    "#wtl-toast.show{opacity:1;transform:translateX(-50%)}#wtl-toast.err{border-color:#e06c6c}" +
    ".wtl-sheet{margin-top:32px;background:#0e1a28;border:1px solid #1e3348;border-radius:12px;padding:16px;font-family:system-ui,sans-serif}" +
    ".wtl-sheet-head{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px}" +
    ".wtl-sheet-head h2{margin:0;font:600 18px Georgia,serif;letter-spacing:.04em;color:#e8eef5}" +
    ".wtl-count{color:#8aa0b5;font-size:13px}.wtl-sort{margin-left:auto;background:#071018;color:#e8eef5;border:1px solid #1e3348;border-radius:8px;padding:6px 8px}" +
    ".wtl-form{display:flex;flex-direction:column;gap:8px;margin-bottom:14px}" +
    ".wtl-form textarea,.wtl-form input{background:#071018;color:#e8eef5;border:1px solid #1e3348;border-radius:8px;padding:9px 10px;font:14px system-ui,sans-serif;width:100%;box-sizing:border-box}" +
    ".wtl-form textarea{resize:vertical;min-height:44px}.wtl-form-row{display:flex;gap:8px;align-items:center}" +
    ".wtl-form-row input{flex:1;max-width:260px}.wtl-counter{color:#8aa0b5;font-size:12px;margin-left:auto;font-variant-numeric:tabular-nums}.wtl-counter.bad{color:#e06c6c}" +
    ".wtl-form-note{display:none;font-size:13px;margin-top:6px;color:#9be3b0}.wtl-form-note.show{display:block}.wtl-form-note.err{color:#ff9a9a}" +
    ".wtl-submit{background:#d4af37;color:#071018;border:0;border-radius:8px;padding:8px 16px;font-weight:700;cursor:pointer}.wtl-submit:disabled{opacity:.5}" +
    ".wtl-grid-wrap{overflow-x:auto}.wtl-grid{width:100%;border-collapse:collapse;font-size:13px;table-layout:fixed;min-width:560px}" +
    ".wtl-grid th{background:#102033;color:#c9d7e6;text-align:left;padding:8px;border-bottom:2px solid #d4af37;position:static}" +
    ".wtl-grid td{padding:7px 8px;border-bottom:1px solid #1e3348;vertical-align:top;color:#e8eef5}" +
    ".wtl-grid .c0{width:36px;color:#8aa0b5}.wtl-grid .c1{width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.wtl-grid .c3,.wtl-grid .c4{width:44px;text-align:right}.wtl-grid .c5{width:128px;color:#8aa0b5;font-variant-numeric:tabular-nums}" +
    ".wtl-row{cursor:pointer}.wtl-row:hover td,.wtl-row.open td{background:#132536}" +
    ".wtl-ell{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".wtl-detail td{background:#0b1622;padding:12px 14px}.wtl-full{white-space:pre-wrap;word-break:break-word;line-height:1.6;font-size:14px}" +
    ".wtl-actions{display:flex;gap:10px;align-items:center;margin-top:8px}.wtl-meta{color:#8aa0b5;font-size:12px}" +
    ".wtl-like{background:transparent;border:1px solid #1e3348;color:#e8eef5;border-radius:999px;padding:3px 10px;cursor:pointer;font-size:12px}.wtl-like.on{border-color:#d4af37;color:#d4af37}" +
    ".wtl-replies{margin-top:12px;border-left:2px solid #1e3348;padding-left:12px}.wtl-replies-h{color:#8aa0b5;font-size:12px;margin-bottom:6px}" +
    ".wtl-reply{padding:6px 0;border-bottom:1px dashed #1e3348}.wtl-reply-meta{color:#8aa0b5;font-size:12px}.wtl-reply-body{white-space:pre-wrap;word-break:break-word;margin-top:2px}" +
    ".wtl-owner{margin-left:auto;display:inline-flex;gap:6px;align-items:center}.wtl-pwask{display:inline-flex;gap:6px;align-items:center}" +
    ".wtl-mini{background:transparent;border:1px solid #1e3348;color:#8aa0b5;border-radius:6px;padding:2px 8px;font-size:12px;cursor:pointer}.wtl-mini:hover{color:#e8eef5;border-color:#7ec8ff}.wtl-mini.on{color:#d4af37;border-color:#d4af37}.wtl-mini.danger{color:#e06c6c;border-color:#e06c6c}" +
    ".wtl-pwask .wtl-pw{width:110px;padding:3px 6px;font-size:12px}.wtl-gone{color:#8aa0b5;font-style:italic}.wtl-form .wtl-pw{max-width:220px}" +
    ".wtl-pw-hint{color:#8aa0b5;font-size:12px;line-height:1.5}" +
    ".wtl-mine{display:inline-block;margin:0 6px 0 0;padding:0 6px;border:1px solid #d4af37;border-radius:999px;color:#d4af37;font-size:10px;line-height:16px;vertical-align:1px}.wtl-reply-meta .wtl-mine{margin:0 0 0 6px}" +
    ".wtl-memb{display:inline-block;margin-right:5px;color:#7ec8ff;font-size:11px}" +
    ".wtl-auth{display:inline-flex;gap:6px;align-items:center;flex-wrap:wrap}.wtl-hello{color:#c9d7e6;font-size:13px}" +
    ".wtl-admin-badge{background:#e06c6c;color:#fff;border-radius:999px;padding:1px 8px;font-size:11px;font-weight:700}" +
    ".wtl-modal{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:100;padding:16px}" +
    ".wtl-modal-box{background:#0e1a28;color:#e8eef5;border:1px solid #d4af37;border-radius:14px;padding:20px;max-width:440px;width:100%;font-family:system-ui,sans-serif;box-shadow:0 12px 40px rgba(0,0,0,.4)}" +
    ".wtl-modal-box h3{margin:0 0 12px;font:600 18px Georgia,serif}.wtl-modal-box .wtl-form{margin:0}" +
    ".wtl-modal-row{display:flex;gap:8px;align-items:center;justify-content:flex-end;margin-top:12px;flex-wrap:wrap}" +
    ".wtl-code-msg{line-height:1.7;margin:0}.wtl-code{display:inline-block;margin:0 4px;padding:1px 8px;border-radius:6px;background:#071018;border:1px solid #d4af37;color:#d4af37;font:700 17px ui-monospace,Consolas,monospace;letter-spacing:.08em}" +
    ".wtl-linkbtn{background:transparent;border:0;color:#7ec8ff;cursor:pointer;font-size:13px;margin-right:auto;padding:0}" +
    ".wtl-nav-link{color:#c9d7e6;border:1px solid #1e3348;border-radius:999px;padding:4px 12px;text-decoration:none;font-size:14px}.wtl-nav-link:hover{border-color:#7ec8ff;color:#7ec8ff}" +
    ".wtl-form.reply{margin:10px 0 0}.wtl-empty{color:#8aa0b5;text-align:center;padding:18px}" +
    "@media (max-width:640px){.wtl-form-row{flex-wrap:wrap}.wtl-form-row input{flex:1 1 45%}.wtl-grid{min-width:0}.wtl-grid .c0{display:none}.wtl-grid .c3,.wtl-grid .c4{width:34px}.wtl-grid .c1{width:72px}.wtl-grid .c5{width:88px;font-size:11px}.wtl-form-row input{max-width:none}}";
  var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);

  window.WTL = {
    t: t, lang: function () { return lang; }, setLang: setLang, onLang: onLang, applyI18n: applyI18n,
    loadLocales: loadLocales, loadLeaders: loadLeaders, leaderName: leaderName, wikiFor: wikiFor,
    makeWikiLink: makeWikiLink, initialsSVG: initialsSVG, el: el, toast: toast, fmtTime: fmtTime,
    mountLangSwitch: mountLangSwitch, mountCommentSheet: mountCommentSheet, fetchComments: fetchComments,
    initIndex: initIndex, theme: theme, setTheme: setTheme, mountThemeSwitch: mountThemeSwitch
  };

  /* ---------- 순위표(index.html) 자동 보강 ----------
   * 2026-09-30 수정: 매일 표를 새로 만들 때 인라인 스크립트·스타일이 빠져도 동작하도록,
   * 이 파일이 순위표를 찾아 스스로 보강한다. index.html에는 아래 한 줄만 있으면 된다.
   *   <script src="assets/wtl-common.js"></script>
   * (id="rank-table", id="langbar", id="all-comments"가 없으면 알아서 만든다.)
   */
  var HEAD_KEYS = ["th_rank", "th_prev", "th_chg", "th_name", "th_org", "th_role", "th_research", "th_business", "th_agi", "th_wealth", "th_score", "th_notes"];
  var INDEX_CSS = "" +
    ".wtl-topbar{display:flex;justify-content:flex-end;padding:12px 24px 0}" +
    ".wtl-table-wrap{overflow-x:auto}.wtl-table-wrap table{min-width:980px}" +
    ".wtl-rank th{white-space:nowrap}.wtl-rank td.wtl-name{white-space:nowrap}" +
    ".cmt-cell{max-width:240px}.cmt-cell a{color:#c9d7e6;text-decoration:none;display:flex;gap:6px;align-items:center}.cmt-cell a:hover{color:#7ec8ff}" +
    ".cmt-prev{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0}" +
    ".cmt-n{flex:none;font-size:11px;color:#d4af37;border:1px solid rgba(212,175,55,.5);border-radius:999px;padding:0 6px}" +
    ".wtl-topbar{gap:12px;align-items:center}.wtl-board-link{color:#d4af37;border:1px solid rgba(212,175,55,.5);border-radius:999px;padding:4px 12px;text-decoration:none;font-size:14px}.wtl-board-link:hover{background:rgba(212,175,55,.12)}" +
    ".cmt-none{color:#8aa0b5;font-size:12px;white-space:nowrap}" +
    // 밝은 바탕의 순위표(10-11 이후 매일 판)에서도 이름·의견 글씨가 보이도록
    ".wtl-light .wtl-rank .wtl-wiki{color:#1F4E79}.wtl-light .wtl-rank .wtl-wiki:hover{color:#2E75B6}" +
    ".wtl-light .wtl-rank .wtl-detail-link{color:#9a7b16}.wtl-light .cmt-cell a{color:#1F4E79}.wtl-light .cmt-none{color:#5a6b7d}" +
    ".wtl-light .wtl-lang{border-color:#c5d3e0}.wtl-light .wtl-lang button{color:#5a6b7d}.wtl-light .wtl-lang button.on{color:#071018}";
  var indexDone = false;
  function initIndex() {
    if (indexDone) return; 
    var table = document.getElementById("rank-table") || document.querySelector(".wrap table:not(.wtl-grid)") || document.querySelector("table:not(.wtl-grid)");
    if (!table || table.closest(".wtl-sheet") || !table.tBodies.length || table.tBodies[0].rows.length < 3 || document.body.dataset.wtlNoAuto) return;
    indexDone = true;
    var st2 = document.createElement("style"); st2.textContent = INDEX_CSS; document.head.appendChild(st2);
    table.classList.add("wtl-rank");
    var bgm = getComputedStyle(document.body).backgroundColor.match(/\d+/g);
    if (bgm && (+bgm[0] + +bgm[1] + +bgm[2]) / 3 > 160 && (bgm.length < 4 || +bgm[3] > 0)) document.body.classList.add("wtl-light");
    applyTheme(); // 주간·야간 선택을 바로 적용 (2026-10-21)
    if (table.parentNode && !/table-wrap/.test(table.parentNode.className || "")) {
      var wrap = el("div", { className: "wtl-table-wrap" }); table.parentNode.insertBefore(wrap, table); wrap.appendChild(table);
    } else if (table.parentNode) table.parentNode.classList.add("wtl-table-wrap");
    var langbar = document.getElementById("langbar");
    if (!langbar) { langbar = el("div", { id: "langbar" }); document.body.insertBefore(langbar, document.body.firstChild); }
    langbar.classList.add("wtl-topbar");
    var allBox = document.getElementById("all-comments");
    if (!allBox) { allBox = el("div", { id: "all-comments" }); var tw = table.closest(".wtl-table-wrap") || table; tw.parentNode.insertBefore(allBox, tw.nextSibling); }

    // 머리글: 이름 칸 위치를 찾고, 번역 키와 '의견' 칸을 붙인다
    var headRow = table.tHead && table.tHead.rows[0];
    var NAME_COL = 3;
    if (headRow) {
      [].forEach.call(headRow.cells, function (th, i) {
        if (/^name$/i.test(th.textContent.trim()) || th.getAttribute("data-i18n") === "th_name") NAME_COL = i;
        if (!th.getAttribute("data-i18n") && HEAD_KEYS[i]) th.setAttribute("data-i18n", HEAD_KEYS[i]);
      });
      if (!headRow.querySelector('[data-i18n="th_comments"]')) {
        var thc = el("th", null, "Comments"); thc.setAttribute("data-i18n", "th_comments"); headRow.appendChild(thc);
      }
    }
    var listQ = LIST === "business" ? "&list=business" : "";
    // 2026-10-21: AI 리더 ↔ 비즈니스 리더 바로가기. 비즈니스 목록은 자료가 채워진 뒤에만 보인다
    if (!langbar.querySelector(".wtl-nav-link")) {
      var navKey = LIST === "business" ? "nav_ai" : "nav_biz";
      var nav = el("a", { href: LIST === "business" ? "index.html" : "business.html", className: "wtl-nav-link" }, t(navKey));
      nav.setAttribute("data-i18n", navKey);
      if (LIST === "business") langbar.appendChild(nav);
      else fetch("data/business_leaders.csv", { cache: "no-cache" }).then(function (r) { return r.ok ? r.text() : ""; })
        .then(function (txt) { if (parseCSV(txt || "").length > 0) langbar.insertBefore(nav, langbar.firstChild); }).catch(function () {});
    }
    // 2026-10-21 추가: 순위표 위에 게시판(board.html) 바로가기
    if (!langbar.querySelector(".wtl-board-link")) {
      var bl = el("a", { href: "board.html", className: "wtl-board-link" }, t("nav_board"));
      bl.setAttribute("data-i18n", "nav_board");
      langbar.appendChild(bl);
    }
    mountLangSwitch(langbar);
    // 악센트 기호(U+0300~U+036F) 제거용. 파일 복사 과정에서 글자가 바뀌지 않도록 숫자로 만든다
    var MARKS = new RegExp("[" + String.fromCharCode(0x300) + "-" + String.fromCharCode(0x36f) + "]", "g");
    var norm = function (s) { return (s || "").toLowerCase().normalize("NFD").replace(MARKS, "").replace(/[^a-z0-9]/g, ""); };
    Promise.all([loadLocales(""), loadLeaders("")]).then(function (res) {
      var byName = {};
      res[1].forEach(function (L) { byName[norm(L.name_en)] = L; });
      var rows = [].slice.call(table.tBodies[0].rows);
      rows.forEach(function (tr) {
        var cell = tr.cells[NAME_COL]; if (!cell) return;
        var L = byName[norm(cell.textContent)];
        if (L) { tr.dataset.slug = L.slug; tr._leader = L; cell.classList.add("wtl-name"); }
        tr.appendChild(el("td", { className: "cmt-cell" }));
      });
      var counts = {}, latest = {};
      function paintNames() {
        rows.forEach(function (tr) {
          var L = tr._leader; if (!L) return;
          var cell = tr.cells[NAME_COL]; cell.innerHTML = "";
          cell.appendChild(makeWikiLink(L, leaderName(L)));
          cell.appendChild(el("a", { href: "leader.html?slug=" + encodeURIComponent(L.slug) + listQ, className: "wtl-detail-link" }, t("link_detail") + " ›"));
        });
      }
      function paintComments() {
        rows.forEach(function (tr) {
          var L = tr._leader, td = tr.cells[tr.cells.length - 1]; td.innerHTML = "";
          if (!L) return;
          var a = el("a", { href: "leader.html?slug=" + encodeURIComponent(L.slug) + listQ + "#comments" });
          var c = latest[L.slug];
          if (c) {
            a.appendChild(el("span", { className: "cmt-prev", title: c.body }, c.body));
            a.appendChild(el("span", { className: "cmt-n" }, String(counts[L.slug])));
          } else a.appendChild(el("span", { className: "cmt-none" }, "✎ " + t("no_comment_cell")));
          td.appendChild(a);
        });
      }
      paintNames(); paintComments();
      onLang(function () { paintNames(); paintComments(); });
      fetchComments(null).then(function (list) {
        (list || []).forEach(function (c) {
          if (c.deleted_at) return;
          counts[c.slug] = (counts[c.slug] || 0) + 1;
          if (!latest[c.slug]) latest[c.slug] = c; // 최신순으로 받음
        });
        paintComments();
      }).catch(function (e) { console.error(e); });
      mountCommentSheet(allBox, "ALL", { id: "comments", title: function () { return t("comments_all_title"); } });
      setLang(lang);
    }).catch(function (e) { console.error("WTL index init", e); });
  }
  /* ---------- 운영 공지 배너 (data/notice.json) ----------
   * 2026-10-02 추가: 보수·점검 안내를 모든 페이지 맨 위에 띄운다.
   * notice.json 예: {"id":"2026-10-02","active":true,"ko":"…","en":"…","link":"https://…","link_ko":"…","link_en":"…"}
   * active를 false로 바꾸거나 파일을 지우면 배너가 사라진다. 방문자가 닫으면 같은 id는 다시 뜨지 않는다.
   */
  function initNotice() {
    fetch("data/notice.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (n) {
      if (!n || !n.active) return;
      try { if (localStorage.getItem("wtl_notice_closed") === String(n.id)) return; } catch (e) {}
      var st3 = document.createElement("style");
      st3.textContent = ".wtl-notice{background:#2a2410;border-bottom:1px solid #d4af37;color:#f3e6b3;font:14px/1.5 system-ui,sans-serif;padding:10px 44px 10px 16px;position:relative;text-align:center}" +
        ".wtl-notice a{color:#7ec8ff;font-weight:600}.wtl-notice button{position:absolute;right:8px;top:50%;transform:translateY(-50%);background:transparent;border:0;color:#f3e6b3;font-size:20px;cursor:pointer;line-height:1;padding:4px 8px}";
      document.head.appendChild(st3);
      var bar = el("div", { className: "wtl-notice", role: "status" });
      var txt = el("span"); bar.appendChild(txt);
      var close = el("button", { type: "button", "aria-label": "close" }, "×"); bar.appendChild(close);
      function paint() {
        txt.innerHTML = "";
        txt.appendChild(document.createTextNode(lang === "ko" ? (n.ko || n.en) : (n.en || n.ko)));
        var sameHost = false;
        try { sameHost = n.link && new URL(n.link).host === location.host; } catch (e) {}
        if (n.link && !sameHost) {
          txt.appendChild(document.createTextNode(" "));
          txt.appendChild(el("a", { href: n.link }, lang === "ko" ? (n.link_ko || n.link) : (n.link_en || n.link)));
        }
      }
      paint(); onLang(paint);
      close.addEventListener("click", function () {
        bar.remove();
        try { localStorage.setItem("wtl_notice_closed", String(n.id)); } catch (e) {}
      });
      document.body.insertBefore(bar, document.body.firstChild);
    }).catch(function () {});
  }

  applyTheme(); // 저장된 주간·야간 선택을 첫 화면부터 적용
  if (LIST === "business") {
    var backA = document.querySelector("a.back");
    if (backA) { backA.href = "business.html"; backA.setAttribute("data-i18n", "back_to_biz"); backA.textContent = t("back_to_biz"); }
  }
  // leader.html처럼 순위표가 없는 페이지에서는 아무 일도 하지 않는다.
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", initIndex); document.addEventListener("DOMContentLoaded", initNotice); }
  else { initIndex(); initNotice(); }
})();
