/* Dynamic Top 50 Ranking from CSV — 2026-11-06 */
(function () {
  "use strict";
  function parseCSV(text) {
    var rows = [], row = [], cur = "", q = false, i, c;
    for (i = 0; i < text.length; i++) {
      c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; }
        else cur += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(cur); cur = ""; }
      else if (c === '\n' || c === '\r') {
        if (cur || row.length) { row.push(cur); rows.push(row); }
        row = []; cur = "";
        if (c === '\r' && text[i + 1] === '\n') i++;
      } else cur += c;
    }
    if (cur || row.length) { row.push(cur); rows.push(row); }
    if (!rows.length) return [];
    var headers = rows[0];
    return rows.slice(1).filter(function (r) { return r.length > 1 && r[1]; }).map(function (r) {
      var o = {};
      headers.forEach(function (h, idx) { o[h.trim()] = (r[idx] || "").trim(); });
      return o;
    });
  }

  function render(leaders) {
    var table = document.querySelector("table.wtl-rank");
    if (!table) return;
    var tbody = table.querySelector("tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    leaders.forEach(function (L, i) {
      var rank = i + 1;
      var tr = document.createElement("tr");
      tr.setAttribute("data-slug", L.slug || "");
      var name = L.name_en || "";
      var wiki = L.wiki_en || "#";
      var slug = L.slug || "";
      tr.innerHTML =
        "<td>" + rank + "</td>" +
        "<td>-</td>" +
        "<td>0</td>" +
        "<td class=\"name wtl-name\">" +
          "<a href=\"" + wiki + "\" target=\"_blank\" rel=\"noopener\" class=\"wtl-wiki\">" + name + "</a>" +
          "<a href=\"leader.html?slug=" + slug + "\" class=\"wtl-detail-link\">Profile ›</a>" +
        "</td>" +
        "<td>" + (L.org || "") + "</td>" +
        "<td>" + (L.role_en || "") + "</td>" +
        "<td>" + (L.R || "") + "</td>" +
        "<td>" + (L.B || "") + "</td>" +
        "<td>" + (L.AGI || "") + "</td>" +
        "<td>" + (L.W || "") + "</td>" +
        "<td class=\"avg\">" + (L.avg || "") + "</td>" +
        "<td class=\"cmt-cell\"><a href=\"leader.html?slug=" + slug + "#comments\"><span class=\"cmt-none\">✎ Write a comment</span></a></td>";
      tbody.appendChild(tr);
    });
  }

  fetch("/data/leaders.csv", { cache: "no-cache" })
    .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
    .then(parseCSV)
    .then(render)
    .catch(function () {});
})();
