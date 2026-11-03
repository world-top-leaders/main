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
  var lang = (function () {
    try { var s = localStorage.getItem("wtl_lang"); if (s === "ko" || s === "en") return s; } catch (e) {}
    return (navigator.language || "").toLowerCase().indexOf("ko") === 0 ? "ko" : "en";
  })();
  var langListeners = [];

  function t(key, vars) {
    var s = (DICT[lang] && DICT[lang][key]) || (EXTRA[lang] && EXTRA[lang][key]) ||
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
  function loadLeaders(base) {
    return fetch(base + "data/leaders.csv", { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error("leaders.csv " + r.status); return r.text(); })
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
  }

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
  function fetchComments(slug) {
    var q = "?select=" + COLS + "&order=created_at.desc&limit=1000" + (slug ? "&slug=eq." + encodeURIComponent(slug) : "");
    return api("/" + TABLE + q);
  }
  function postComment(row) { return api("/" + TABLE + "?select=id", { method: "POST", body: row, prefer: "return=representation" }); }
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
  function errMsg(e) {
    var m = (e && e.message) || "";
    if (m.indexOf("RATE_LIMIT") >= 0) return t("err_rate");
    if (m.indexOf("row-level security") >= 0 || m.indexOf("check constraint") >= 0) return t("err_len");
    return t("err_generic");
  }
  function validate(author, body) {
    if (author.length > AUTHOR_MAX) return t("err_author");
    if (body.length < BODY_MIN || body.length > BODY_MAX) return t("err_len");
    var wait = COOLDOWN_MS - (Date.now() - lastPostAt());
    if (wait > 0) return t("err_rate");
    return null;
  }

  /* ---------- 엑셀형 의견 시트 ---------- */
  // mountCommentSheet(container, slug, { title }) — slug = 지도자 slug 또는 "ALL"
  function mountCommentSheet(container, slug, options) {
    options = options || {};
    var state = { items: [], sort: "latest", open: {}, replyForms: {} };
    var root = el("section", { className: "wtl-sheet", id: options.id || "" });
    var headBox = el("div"), gridBox = el("div");
    container.appendChild(root);

    function buildForm(parentId, onDone) {
      var f = el("form", { className: parentId ? "wtl-form reply" : "wtl-form", noValidate: true });
      var author = el("input", { type: "text", maxLength: AUTHOR_MAX, className: "wtl-author" });
      author.dataset.i18nPh = "placeholder_author"; author.placeholder = t("placeholder_author");
      try { author.value = localStorage.getItem("wtl_author") || ""; } catch (e) {}
      var body = el("textarea", { maxLength: BODY_MAX, rows: parentId ? 2 : 3, className: "wtl-body" });
      body.dataset.i18nPh = "placeholder_comment"; body.placeholder = t("placeholder_comment");
      var pw = el("input", { type: "password", maxLength: 30, className: "wtl-pw", autocomplete: "new-password" });
      pw.dataset.i18nPh = "placeholder_pw"; pw.placeholder = t("placeholder_pw");
      var counter = el("span", { className: "wtl-counter" }, "0/" + BODY_MAX);
      var btn = el("button", { type: "submit", className: "wtl-submit" }, parentId ? t("btn_reply") : t("btn_submit"));
      btn.dataset.i18n = parentId ? "btn_reply" : "btn_submit";
      body.addEventListener("input", function () {
        var n = body.value.trim().length;
        counter.textContent = n + "/" + BODY_MAX;
        counter.classList.toggle("bad", n > 0 && n < BODY_MIN);
      });
      var row = el("div", { className: "wtl-form-row" });
      row.appendChild(author); row.appendChild(pw); row.appendChild(counter); row.appendChild(btn);
      f.appendChild(body); f.appendChild(row);
      f.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var a = author.value.trim(), b = body.value.trim();
        var v = validate(a, b);
        if (!v && pw.value && (pw.value.length < 4 || pw.value.length > 30)) v = t("err_pw_len");
        if (v) { toast(v, true); return; }
        btn.disabled = true;
        var tok = newToken();
        var rec = { slug: slug, author: a || "참여자", lang: lang, body: b, edit_token: tok };
        if (pw.value) rec.edit_pw = pw.value;
        if (parentId) rec.parent_comment_id = parentId;
        postComment(rec).then(function (rows) {
          if (rows && rows[0] && rows[0].id) saveToken(rows[0].id, tok);
          pw.value = "";
          setLastPost();
          try { localStorage.setItem("wtl_author", a); } catch (e) {}
          body.value = ""; counter.textContent = "0/" + BODY_MAX;
          toast(t("ok_posted"));
          if (parentId) state.open[parentId] = true;
          return reload().then(onDone);
        }).catch(function (e) { console.error(e); toast(errMsg(e), true); })
          .then(function () { btn.disabled = false; });
      });
      return f;
    }

    function shownAuthor(c) { return c.author === "참여자" || c.author === "Anonymous" ? t("anonymous") : c.author; }
    function metaText(c) { return shownAuthor(c) + " · " + fmtTime(c.created_at) + (c.edited_at ? " · " + t("edited") : ""); }

    // 수정·삭제 버튼. 이 브라우저에서 쓴 글이면 바로, 아니면 비밀번호를 물어본다.
    function ownerControls(c, bodyEl) {
      var box = el("span", { className: "wtl-owner" });
      var editB = el("button", { type: "button", className: "wtl-mini" }, t("btn_edit"));
      var delB = el("button", { type: "button", className: "wtl-mini" }, t("btn_delete"));
      box.appendChild(editB); box.appendChild(delB);
      function withSecret(onSecret) {
        var tok = tokens()[c.id];
        if (tok) { onSecret(tok); return; }
        var f = el("span", { className: "wtl-pwask" });
        var inp = el("input", { type: "password", maxLength: 30, placeholder: t("pw_prompt"), className: "wtl-pw" });
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
            if (nb.length < BODY_MIN || nb.length > BODY_MAX) { toast(t("err_len"), true); return; }
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
      tops.forEach(function (c, idx) {
        var reps = kids[c.id] || [];
        var tr = el("tr", { className: "wtl-row" + (state.open[c.id] ? " open" : ""), tabIndex: 0 });
        tr.setAttribute("aria-expanded", state.open[c.id] ? "true" : "false");
        tr.appendChild(el("td", { className: "c0" }, String(idx + 1)));
        var gone = !!c.deleted_at;
        tr.appendChild(el("td", { className: "c1" }, gone ? "—" : shownAuthor(c)));
        var bodyTd = el("td", { className: "c2" }); bodyTd.appendChild(el("div", { className: "wtl-ell" + (gone ? " wtl-gone" : "") }, gone ? t("deleted_msg") : c.body)); tr.appendChild(bodyTd);
        tr.appendChild(el("td", { className: "c3" }, String(c.likes)));
        tr.appendChild(el("td", { className: "c4" }, String(reps.length)));
        tr.appendChild(el("td", { className: "c5" }, fmtTime(c.created_at)));
        var toggle = function () { state.open[c.id] = !state.open[c.id]; render(); };
        tr.addEventListener("click", toggle);
        tr.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
        tb.appendChild(tr);
        if (state.open[c.id]) {
          var dr = el("tr", { className: "wtl-detail" }); var td = el("td", { colSpan: 6 });
          var full = el("div", { className: "wtl-full" + (gone ? " wtl-gone" : "") }, gone ? t("deleted_msg") : c.body);
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
            ri.appendChild(el("div", { className: "wtl-reply-meta" }, "↳ " + metaText(r)));
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
    ".wtl-form.reply{margin:10px 0 0}.wtl-empty{color:#8aa0b5;text-align:center;padding:18px}" +
    "@media (max-width:640px){.wtl-form-row{flex-wrap:wrap}.wtl-form-row input{flex:1 1 45%}.wtl-grid{min-width:0}.wtl-grid .c0{display:none}.wtl-grid .c3,.wtl-grid .c4{width:34px}.wtl-grid .c1{width:72px}.wtl-grid .c5{width:88px;font-size:11px}.wtl-form-row input{max-width:none}}";
  var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);

  window.WTL = {
    t: t, lang: function () { return lang; }, setLang: setLang, onLang: onLang, applyI18n: applyI18n,
    loadLocales: loadLocales, loadLeaders: loadLeaders, leaderName: leaderName, wikiFor: wikiFor,
    makeWikiLink: makeWikiLink, initialsSVG: initialsSVG, el: el, toast: toast, fmtTime: fmtTime,
    mountLangSwitch: mountLangSwitch, mountCommentSheet: mountCommentSheet, fetchComments: fetchComments,
    initIndex: initIndex
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
    ".cmt-none{color:#8aa0b5;font-size:12px;white-space:nowrap}";
  var indexDone = false;
  function initIndex() {
    if (indexDone) return; 
    var table = document.getElementById("rank-table") || document.querySelector(".wrap table:not(.wtl-grid)") || document.querySelector("table:not(.wtl-grid)");
    if (!table || table.closest(".wtl-sheet") || !table.tBodies.length || table.tBodies[0].rows.length < 3 || document.body.dataset.wtlNoAuto) return;
    indexDone = true;
    var st2 = document.createElement("style"); st2.textContent = INDEX_CSS; document.head.appendChild(st2);
    table.classList.add("wtl-rank");
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
    mountLangSwitch(langbar);
    var norm = function (s) { return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, ""); };
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
          cell.appendChild(el("a", { href: "leader.html?slug=" + encodeURIComponent(L.slug), className: "wtl-detail-link" }, t("link_detail") + " ›"));
        });
      }
      function paintComments() {
        rows.forEach(function (tr) {
          var L = tr._leader, td = tr.cells[tr.cells.length - 1]; td.innerHTML = "";
          if (!L) return;
          var a = el("a", { href: "leader.html?slug=" + encodeURIComponent(L.slug) + "#comments" });
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
  // leader.html처럼 순위표가 없는 페이지에서는 아무 일도 하지 않는다.
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initIndex);
  else initIndex();
})();
