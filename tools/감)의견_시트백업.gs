var SUPABASE_URL = "https://hwdzjmeklzkszfqxbvsz.supabase.co";
var SUPABASE_KEY = "sb_publishable_2JorYW_R1etapUtiZMI8Yg_gQTRO-f5";
var TAB = "Supabase_백업";
var HEADERS = ["의견ID", "작성시각", "지도자 slug", "작성자", "작성언어", "의견본문", "좋아요수", "부모댓글ID"];
function backupComments() {
  var rows = [], from = 0, page = 1000;
  while (true) {
    var url = SUPABASE_URL + "/rest/v1/wtl_comments" +
      "?select=id,created_at,slug,author,lang,body,likes,parent_comment_id&order=created_at.asc";
    var res = UrlFetchApp.fetch(url, {
      headers: { apikey: SUPABASE_KEY, Range: from + "-" + (from + page - 1) },
      muteHttpExceptions: true
    });
    if (res.getResponseCode() >= 300) throw new Error("Supabase " + res.getResponseCode() + ": " + res.getContentText());
    var data = JSON.parse(res.getContentText());
    data.forEach(function (c) {
      rows.push([c.id, c.created_at, c.slug, c.author, c.lang, c.body, c.likes, c.parent_comment_id || ""]);
    });
    if (data.length < page) break;
    from += page;
  }
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(TAB) || ss.insertSheet(TAB);
  sh.clearContents();
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight("bold");
  if (rows.length) sh.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);
  sh.setFrozenRows(1);
  sh.getRange(1, HEADERS.length + 2).setValue("마지막 백업: " + new Date().toLocaleString("ko-KR") + " · " + rows.length + "건");
}
function installHourlyBackup() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "backupComments") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("backupComments").timeBased().everyHours(1).create();
  backupComments();
}
