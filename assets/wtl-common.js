/* WTL Phase 3 common — Claude 2026-09-30 */
(function () {
  "use strict";
  var SUPABASE_URL = "https://hwdzjmeklzkszfqxbvsz.supabase.co";
  var SUPABASE_KEY = "sb_publishable_2JorYW_R1etapUtiZMI8Yg_gQTRO-f5";
  var REST = SUPABASE_URL + "/rest/v1";
  var TABLE = "wtl_comments";
  var COLS = "id,slug,parent_comment_id,author,lang,body,likes,created_at";
  var BODY_MIN = 10, BODY_MAX = 1000, AUTHOR_MAX = 20, COOLDOWN_MS = 60000;
  var EXTRA = {
    en: { badge_en:"EN", link_detail:"Profile", comments_all_title:"Comments on the whole site", comments_leader_title:"Comments", comments_count:"{n} comments", no_comment_cell:"Write a comment", anonymous:"Anonymous", err_len:"Comment must be 10–1,000 characters.", err_author:"Name can be up to 20 characters.", err_rate:"You can post once per minute. Please try again shortly.", err_generic:"Could not save. Please try again.", err_load:"Could not load comments.", ok_posted:"Posted. Thank you!", btn_liked:"Liked", replies:"Replies", th_author:"Name", th_comment:"Comment", th_time:"Time", back_to_list:"\u2190 Top 50", rank_badge:"Rank #{n}", metrics_title:"WTL score", profile_title:"Profile", profile_pending:"Detailed profile will be added after data review.", not_found:"Leader not found.", initials_note:"Photo pending — initials shown.", m_research:"Research", m_business:"Business", m_agi:"AGI", m_wealth:"Wealth", p_org:"Organization", p_role:"Role", p_rank:"Rank", p_avg:"Average", p_birth:"Born", p_gender:"Gender", p_nationality:"Nationality", p_education:"Education", p_career:"Career", p_expertise:"Field", p_net_worth:"Net worth", p_achievements:"Key achievements", placeholder_comment:"Write a comment (10–1,000 characters)", placeholder_author:"Name (optional, max 20)", label_latest:"Newest", label_likes:"Most liked", label_replies:"Most replies", btn_submit:"Submit", btn_like:"Like", btn_reply:"Reply", wiki_label:"Wikipedia", msg_wiki_fallback:"Korean Wikipedia page not found. Opening English Wikipedia.", note_disclaimer:"Public-source composite. Not investment advice.", empty_comments:"No comments yet.", th_score:"Avg" },
    ko: { badge_en:"EN", link_detail:"상세", comments_all_title:"사이트 전체 의견", comments_leader_title:"의견", comments_count:"의견 {n}개", no_comment_cell:"의견 쓰기", anonymous:"익명", err_len:"의견은 10~1,000자로 써 주세요.", err_author:"닉네임은 20자까지 쓤 수 있어요.", err_rate:"1분에 한 번만 등록할 수 있어요. 잠시 뒤 다시 시도해 주세요.", err_generic:"저장하지 못했어요. 다시 시도해 주세요.", err_load:"의견을 불러오지 못했어요.", ok_posted:"등록되었습니다. 감사합니다!", btn_liked:"좋아요 완료", replies:"댓글", th_author:"작성자", th_comment:"의견", th_time:"시각", back_to_list:"\u2190 Top 50 목록", rank_badge:"{n}위", metrics_title:"WTL 평가 점수", profile_title:"프로필", profile_pending:"상세 인적사항은 데이터 검토 후 추가됩니다.", not_found:"해당 지도자를 찾을 수 없습니다.", initials_note:"사진 준비 중 — 이니셜로 표시합니다.", m_research:"연구", m_business:"사업", m_agi:"AGI", m_wealth:"재산", p_org:"소속", p_role:"직책", p_rank:"순위", p_avg:"평균", p_birth:"출생", p_gender:"성별", p_nationality:"국적", p_education:"학력", p_career:"주요 경력", p_expertise:"전문 분야", p_net_worth:"추정 순자산", p_achievements:"대표 업적", placeholder_comment:"의견을 쓰세요 (10–1,000자)", placeholder_author:"닉네임 (선택, 20자 이하)", label_latest:"최신순", label_likes:"공감 많은 순", label_replies:"댓글 많은 순", btn_submit:"등록", btn_like:"좋아요", btn_reply:"댓글", wiki_label:"위키백과", msg_wiki_fallback:"한국어 위키 문서가 없어 영문 위키로 열립니다.", note_disclaimer:"공개 소스 합성. 투자 권유 아님.", empty_comments:"아직 의견이 없습니다.", th_score:"평균" }
  };
  var DICT = { en: {}, ko: {} };
  var lang = (function () { try { var s = localStorage.getItem("wtl_lang"); if (s === "ko" || s === "en") return s; } catch (e) {} return (navigator.language || "").toLowerCase().indexOf("ko") === 0 ? "ko" : "en"; })();
  var langListeners = [];
  function t(key, vars) { var s = (DICT[lang] && DICT[lang][key]) || (EXTRA[lang] && EXTRA[lang][key]) || (EXTRA.en && EXTRA.en[key]) || key; if (vars) Object.keys(vars).forEach(function (k) { s = s.replace("{" + k + "}", vars[k]); }); return s; }
  function setLang(l) { lang = l === "ko" ? "ko" : "en"; try { localStorage.setItem("wtl_lang", lang); } catch (e) {} document.documentElement.lang = lang; applyI18n(document); langListeners.forEach(function (fn) { try { fn(lang); } catch (e) {} }); }
  function onLang(fn) { langListeners.push(fn); }
  function applyI18n(root) { root.querySelectorAll("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); }); root.querySelectorAll("[data-i18n-ph]").forEach(function (el) { el.placeholder = t(el.getAttribute("data-i18n-ph")); }); document.querySelectorAll(".wtl-lang button").forEach(function (b) { b.classList.toggle("on", b.dataset.lang === lang); }); }
  function loadLocales(base) { return fetch(base + "data/locales.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : {}; }).then(function (j) { DICT.en = j.en || {}; DICT.ko = j.ko || {}; }).catch(function () {}); }
  function parseCSV(text) { var rows = [], row = [], cur = "", q = false, i, c; for (i = 0; i < text.length; i++) { c = text[i]; if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; } else if (c === '"') q = true; else if (c === ",") { row.push(cur); cur = ""; } else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cur); cur = ""; if (row.length > 1 || row[0] !== "") rows.push(row); row = []; } else cur += c; } if (cur !== "" || row.length) { row.push(cur); rows.push(row); } var head = rows.shift().map(function (h) { return h.trim(); }); return rows.map(function (r) { var o = {}; head.forEach(function (h, k) { o[h] = (r[k] || "").trim(); }); return o; }); }
  function loadLeaders(base) { return fetch(base + "data/leaders.csv", { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error("leaders.csv " + r.status); return r.text(); }).then(parseCSV); }
  function leaderName(L) { return lang === "ko" && L.name_ko ? L.name_ko : L.name_en; }
  function wikiFor(L) { if (lang === "ko" && L.wiki_ko) return { url: L.wiki_ko, fallback: false }; if (lang === "ko") return { url: L.wiki_en, fallback: true }; return { url: L.wiki_en || L.wiki_ko, fallback: false }; }
  function el(tag, props, text) { var e = document.createElement(tag); if (props) Object.keys(props).forEach(function (k) { if (k === "dataset") Object.assign(e.dataset, props[k]); else if (k in e) e[k] = props[k]; else e.setAttribute(k, props[k]); }); if (text != null) e.textContent = text; return e; }
  function makeWikiLink(L, text) { var w = wikiFor(L); var a = el("a", { href: w.url || "#", target: "_blank", rel: "noopener", className: "wtl-wiki" }); a.appendChild(document.createTextNode(text)); if (w.fallback) { a.appendChild(el("span", { className: "wtl-badge-en", title: t("msg_wiki_fallback") }, t("badge_en"))); a.addEventListener("click", function () { toast(t("msg_wiki_fallback")); }); } return a; }
  function initialsSVG(nameEn, slug, size) { size = size || 160; var parts = (nameEn || "?").replace(/[^A-Za-z\s\-]/g, " ").split(/[\s\-]+/).filter(Boolean); var ini = parts.length ? (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() : "?"; var h = 0; for (var i = 0; i < (slug || "").length; i++) h = (h * 31 + slug.charCodeAt(i)) % 360; var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="'+size+'" height="'+size+'" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl('+h+',45%,32%)"/><stop offset="1" stop-color="hsl('+((h+40)%360)+',50%,18%)"/></linearGradient></defs><rect width="100" height="100" rx="50" fill="url(#g)"/><circle cx="50" cy="50" r="47" fill="none" stroke="#d4af37" stroke-width="2"/><text x="50" y="50" dy=".35em" text-anchor="middle" font-family="Georgia,serif" font-size="38" fill="#f3e6b3">'+ini+'</text></svg>'; return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg); }
  function fmtTime(iso) { var d = new Date(iso); if (isNaN(d)) return ""; var p = function (n) { return (n < 10 ? "0" : "") + n; }; return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes()); }
  var toastTimer;
  function toast(msg, isErr) { var tEl = document.getElementById("wtl-toast"); if (!tEl) { tEl = el("div", { id: "wtl-toast", role: "status" }); document.body.appendChild(tEl); } tEl.textContent = msg; tEl.className = "show" + (isErr ? " err" : ""); clearTimeout(toastTimer); toastTimer = setTimeout(function () { tEl.className = ""; }, 3200); }
  function mountLangSwitch(container) { var box = el("div", { className: "wtl-lang", role: "group" }); [["ko", "KO"], ["en", "EN"]].forEach(function (p) { var b = el("button", { type: "button" }, p[1]); b.dataset.lang = p[0]; b.addEventListener("click", function () { setLang(p[0]); }); box.appendChild(b); }); container.appendChild(box); }
  function api(path, opts) { opts = opts || {}; var headers = { apikey: SUPABASE_KEY, "Content-Type": "application/json" }; if (opts.prefer) headers.Prefer = opts.prefer; return fetch(REST + path, { method: opts.method || "GET", headers: headers, body: opts.body ? JSON.stringify(opts.body) : undefined }).then(function (r) { return r.text().then(function (txt) { var data = null; try { data = txt ? JSON.parse(txt) : null; } catch (e) {} if (!r.ok) { var err = new Error((data && data.message) || ("HTTP " + r.status)); err.status = r.status; throw err; } return data; }); }); }
  function fetchComments(slug) { var q = "?select=" + COLS + "&order=created_at.desc&limit=1000" + (slug ? "&slug=eq." + encodeURIComponent(slug) : ""); return api("/" + TABLE + q); }
  function postComment(row) { return api("/" + TABLE, { method: "POST", body: row, prefer: "return=minimal" }); }
  function likeComment(id) { return api("/rpc/wtl_comment_like", { method: "POST", body: { p_id: id } }); }
  function likedSet() { try { return JSON.parse(localStorage.getItem("wtl_liked") || "[]"); } catch (e) { return []; } }
  function markLiked(id) { try { var s = likedSet(); if (s.indexOf(id) < 0) { s.push(id); localStorage.setItem("wtl_liked", JSON.stringify(s.slice(-500))); } } catch (e) {} }
  function lastPostAt() { try { return +localStorage.getItem("wtl_last_post") || 0; } catch (e) { return 0; } }
  function setLastPost() { try { localStorage.setItem("wtl_last_post", String(Date.now())); } catch (e) {} }
  function errMsg(e) { var m = (e && e.message) || ""; if (m.indexOf("RATE_LIMIT") >= 0) return t("err_rate"); return t("err_generic"); }
  function validate(author, body) { if (author.length > AUTHOR_MAX) return t("err_author"); if (body.length < BODY_MIN || body.length > BODY_MAX) return t("err_len"); if (COOLDOWN_MS - (Date.now() - lastPostAt()) > 0) return t("err_rate"); return null; }
  function mountCommentSheet(container, slug, options) {
    options = options || {};
    var state = { items: [], sort: "latest", open: {}, replyForms: {} };
    var root = el("section", { className: "wtl-sheet", id: options.id || "" });
    var headBox = el("div"), gridBox = el("div");
    container.appendChild(root);
    function buildForm(parentId, onDone) {
      var f = el("form", { className: parentId ? "wtl-form reply" : "wtl-form" });
      var author = el("input", { type: "text", maxLength: AUTHOR_MAX, className: "wtl-author" }); author.placeholder = t("placeholder_author");
      try { author.value = localStorage.getItem("wtl_author") || ""; } catch (e) {}
      var body = el("textarea", { maxLength: BODY_MAX, rows: parentId ? 2 : 3, className: "wtl-body" }); body.placeholder = t("placeholder_comment");
      var counter = el("span", { className: "wtl-counter" }, "0/" + BODY_MAX);
      var btn = el("button", { type: "submit", className: "wtl-submit" }, parentId ? t("btn_reply") : t("btn_submit"));
      body.addEventListener("input", function () { var n = body.value.trim().length; counter.textContent = n + "/" + BODY_MAX; });
      var row = el("div", { className: "wtl-form-row" }); row.appendChild(author); row.appendChild(counter); row.appendChild(btn);
      f.appendChild(body); f.appendChild(row);
      f.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var a = author.value.trim(), b = body.value.trim(), v = validate(a, b);
        if (v) { toast(v, true); return; }
        btn.disabled = true;
        var rec = { slug: slug, author: a || t("anonymous"), lang: lang, body: b };
        if (parentId) rec.parent_comment_id = parentId;
        postComment(rec).then(function () { setLastPost(); try { localStorage.setItem("wtl_author", a); } catch (e) {} body.value = ""; counter.textContent = "0/" + BODY_MAX; toast(t("ok_posted")); if (parentId) state.open[parentId] = true; return reload().then(onDone); }).catch(function (e) { toast(errMsg(e), true); }).then(function () { btn.disabled = false; });
      });
      return f;
    }
    function likeBtn(c) {
      var liked = likedSet().indexOf(c.id) >= 0;
      var b = el("button", { type: "button", className: "wtl-like" + (liked ? " on" : "") }, "\ud83d\udc4d " + c.likes);
      b.addEventListener("click", function (ev) {
        ev.stopPropagation();
        if (likedSet().indexOf(c.id) >= 0) { toast(t("btn_liked")); return; }
        b.disabled = true;
        likeComment(c.id).then(function (n) { markLiked(c.id); c.likes = typeof n === "number" ? n : c.likes + 1; b.textContent = "\ud83d\udc4d " + c.likes; b.classList.add("on"); }).catch(function () { toast(t("err_generic"), true); }).then(function () { b.disabled = false; });
      });
      return b;
    }
    function render() {
      headBox.innerHTML = ""; gridBox.innerHTML = "";
      var tops = state.items.filter(function (c) { return !c.parent_comment_id; });
      var kids = {};
      state.items.forEach(function (c) { if (c.parent_comment_id) (kids[c.parent_comment_id] = kids[c.parent_comment_id] || []).push(c); });
      var byLatest = function (a, b) { return a.created_at < b.created_at ? 1 : -1; };
      tops.sort(state.sort === "likes" ? function (a, b) { return (b.likes - a.likes) || byLatest(a, b); } : state.sort === "replies" ? function (a, b) { return ((kids[b.id] || []).length - (kids[a.id] || []).length) || byLatest(a, b); } : byLatest);
      var head = el("div", { className: "wtl-sheet-head" });
      head.appendChild(el("h2", null, options.title ? options.title() : t("comments_leader_title")));
      head.appendChild(el("span", { className: "wtl-count" }, t("comments_count", { n: state.items.length })));
      var sel = el("select", { className: "wtl-sort" });
      [["latest", "label_latest"], ["likes", "label_likes"], ["replies", "label_replies"]].forEach(function (o) { var op = el("option", { value: o[0] }, t(o[1])); if (state.sort === o[0]) op.selected = true; sel.appendChild(op); });
      sel.addEventListener("change", function () { state.sort = sel.value; render(); });
      head.appendChild(sel); headBox.appendChild(head);
      var table = el("table", { className: "wtl-grid" });
      var hr = el("tr"); ["#", t("th_author"), t("th_comment"), "\ud83d\udc4d", "\ud83d\udcac", t("th_time")].forEach(function (h) { hr.appendChild(el("th", null, h)); });
      table.appendChild(el("thead")).appendChild(hr);
      var tb = el("tbody");
      if (!tops.length) { var em = el("tr"); em.appendChild(el("td", { colSpan: 6, className: "wtl-empty" }, state.error ? t("err_load") : t("empty_comments"))); tb.appendChild(em); }
      tops.forEach(function (c, idx) {
        var reps = kids[c.id] || [];
        var tr = el("tr", { className: "wtl-row" + (state.open[c.id] ? " open" : "") });
        tr.appendChild(el("td", null, String(idx + 1)));
        tr.appendChild(el("td", null, c.author));
        var bodyTd = el("td"); bodyTd.appendChild(el("div", { className: "wtl-ell" }, c.body)); tr.appendChild(bodyTd);
        tr.appendChild(el("td", null, String(c.likes)));
        tr.appendChild(el("td", null, String(reps.length)));
        tr.appendChild(el("td", null, fmtTime(c.created_at)));
        tr.addEventListener("click", function () { state.open[c.id] = !state.open[c.id]; render(); });
        tb.appendChild(tr);
        if (state.open[c.id]) {
          var dr = el("tr", { className: "wtl-detail" }); var td = el("td", { colSpan: 6 });
          td.appendChild(el("div", { className: "wtl-full" }, c.body));
          var act = el("div", { className: "wtl-actions" }); act.appendChild(likeBtn(c)); td.appendChild(act);
          var rl = el("div", { className: "wtl-replies" });
          reps.forEach(function (r) { var ri = el("div", { className: "wtl-reply" }); ri.appendChild(el("div", { className: "wtl-reply-meta" }, r.author + " · " + fmtTime(r.created_at))); ri.appendChild(el("div", null, r.body)); ri.appendChild(likeBtn(r)); rl.appendChild(ri); });
          if (!state.replyForms[c.id]) state.replyForms[c.id] = buildForm(c.id);
          rl.appendChild(state.replyForms[c.id]); td.appendChild(rl); dr.appendChild(td); tb.appendChild(dr);
        }
      });
      table.appendChild(tb);
      var wrap = el("div", { className: "wtl-grid-wrap" }); wrap.appendChild(table); gridBox.appendChild(wrap);
    }
    function reload() { return fetchComments(slug).then(function (rows) { state.items = rows || []; state.error = false; render(); }).catch(function () { state.error = true; render(); }); }
    root.appendChild(headBox); root.appendChild(buildForm(null)); root.appendChild(gridBox); onLang(render); render(); return reload();
  }
  var st = document.createElement("style");
  st.textContent = ".wtl-lang{display:inline-flex;border:1px solid #1e3348;border-radius:999px;overflow:hidden;font-family:system-ui,sans-serif}.wtl-lang button{background:transparent;color:#8aa0b5;border:0;padding:6px 14px;cursor:pointer}.wtl-lang button.on{background:#d4af37;color:#071018;font-weight:700}.wtl-wiki{color:#e8eef5;text-decoration:none;border-bottom:1px dotted #7ec8ff}.wtl-badge-en{margin-left:6px;padding:0 5px;border:1px solid #7ec8ff;border-radius:4px;font-size:10px;color:#7ec8ff}.wtl-detail-link{margin-left:8px;font-size:11px;color:#d4af37;text-decoration:none}.wtl-sheet{margin-top:32px;background:#0e1a28;border:1px solid #1e3348;border-radius:12px;padding:16px;font-family:system-ui,sans-serif}.wtl-sheet-head{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px}.wtl-sheet-head h2{margin:0;font:600 18px Georgia,serif;color:#e8eef5}.wtl-count{color:#8aa0b5;font-size:13px}.wtl-sort{margin-left:auto;background:#071018;color:#e8eef5;border:1px solid #1e3348;border-radius:8px;padding:6px 8px}.wtl-form textarea,.wtl-form input{background:#071018;color:#e8eef5;border:1px solid #1e3348;border-radius:8px;padding:9px 10px;font:14px system-ui;width:100%;box-sizing:border-box}.wtl-form-row{display:flex;gap:8px;align-items:center;margin-top:8px}.wtl-submit{background:#d4af37;color:#071018;border:0;border-radius:8px;padding:8px 16px;font-weight:700;cursor:pointer}.wtl-grid{width:100%;border-collapse:collapse;font-size:13px}.wtl-grid th{background:#102033;color:#c9d7e6;text-align:left;padding:8px;border-bottom:2px solid #d4af37}.wtl-grid td{padding:7px 8px;border-bottom:1px solid #1e3348;color:#e8eef5;vertical-align:top}.wtl-row{cursor:pointer}.wtl-ell{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.wtl-full{white-space:pre-wrap;word-break:break-word;line-height:1.6}.wtl-like{background:transparent;border:1px solid #1e3348;color:#e8eef5;border-radius:999px;padding:3px 10px;cursor:pointer}.wtl-like.on{border-color:#d4af37;color:#d4af37}.wtl-empty{color:#8aa0b5;text-align:center;padding:18px}#wtl-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#102033;color:#e8eef5;border:1px solid #d4af37;padding:10px 16px;border-radius:10px;opacity:0;z-index:99}#wtl-toast.show{opacity:1}#wtl-toast.err{border-color:#e06c6c}.wtl-counter{color:#8aa0b5;font-size:12px;margin-left:auto}";
  document.head.appendChild(st);
  window.WTL = { t:t, lang:function(){return lang;}, setLang:setLang, onLang:onLang, applyI18n:applyI18n, loadLocales:loadLocales, loadLeaders:loadLeaders, leaderName:leaderName, wikiFor:wikiFor, makeWikiLink:makeWikiLink, initialsSVG:initialsSVG, el:el, toast:toast, fmtTime:fmtTime, mountLangSwitch:mountLangSwitch, mountCommentSheet:mountCommentSheet, fetchComments:fetchComments };
})();
