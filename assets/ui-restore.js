/* UI Restore: Korean default + Board + Lang switch — 2026-11-07 */
(function () {
  "use strict";
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    if (!localStorage.getItem("wtl-lang")) localStorage.setItem("wtl-lang", "ko");
    var lang = localStorage.getItem("wtl-lang") || "ko";

    var bar = document.createElement("div");
    bar.style.cssText = "display:flex;gap:12px;align-items:center;justify-content:flex-end;margin-bottom:16px;font-size:14px;";
    bar.innerHTML = 
      '<a href="board.html" style="color:#d4af37;border:1px solid rgba(212,175,55,.5);border-radius:999px;padding:4px 12px;text-decoration:none;">💬 게시판</a>' +
      '<div style="display:inline-flex;border:1px solid #1e3348;border-radius:999px;overflow:hidden;">' +
        '<button id="lang-ko" style="background:transparent;color:#8aa0b5;border:0;padding:6px 14px;cursor:pointer;">KO</button>' +
        '<button id="lang-en" style="background:transparent;color:#8aa0b5;border:0;padding:6px 14px;cursor:pointer;">EN</button>' +
      '</div>';
    document.body.insertBefore(bar, document.body.firstChild);

    function setLang(l) {
      localStorage.setItem("wtl-lang", l);
      var ko = document.getElementById("lang-ko");
      var en = document.getElementById("lang-en");
      if (ko) { ko.style.background = l === "ko" ? "#d4af37" : "transparent"; ko.style.color = l === "ko" ? "#071018" : "#8aa0b5"; }
      if (en) { en.style.background = l === "en" ? "#d4af37" : "transparent"; en.style.color = l === "en" ? "#071018" : "#8aa0b5"; }
      var h1 = document.querySelector("h1");
      if (h1 && l === "ko") h1.textContent = "세계 톱 리더";
    }
    setLang(lang);
    document.getElementById("lang-ko").onclick = function(){ setLang("ko"); location.reload(); };
    document.getElementById("lang-en").onclick = function(){ setLang("en"); location.reload(); };
  });
})();
