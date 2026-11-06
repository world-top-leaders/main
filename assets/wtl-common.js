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
      f_email: "Email", f_nick: "Nickname shown on posts (2–20 characters)", f_pw: "Password (at least 6 characters)", f_pw2: "Confirm password", f_newpw: "New password (at least 6 characters)",
      consent: "[Required] I agree to the collection and use of my email address. Purpose: member verification and password recovery. Kept until I leave the site. Your email is never shown to others.",
      err_consent: "Please agree to the collection of your email to sign up.", err_email: "Please enter a valid email address.",
      signup_sent: "We sent a confirmation email to {email}. Click the link in the email to finish signing up. (Check your spam folder too.)",
      forgot: "Forgot password?", forgot_title: "Reset password", forgot_note: "Enter the email you signed up with. We will send a link to set a new password.", btn_send: "Send",
      forgot_sent: "If {email} is a member, a reset link has been sent.", newpw_title: "Set a new password", ok_newpw: "Your password has been changed.",
      ok_confirmed: "Your email is confirmed. Welcome!", err_link: "The link has expired or is invalid. Please try again.",
      account: "My account", withdraw: "Leave site", withdraw_confirm: "Delete your account and email? Your posts stay but are no longer marked as a member's.", ok_withdraw: "Your account has been deleted.",
      err_email_taken: "This email is already registered. Please log in.", err_not_confirmed: "Please confirm your email first (check the link we sent).", err_mail_rate: "Too many emails were sent. Please try again in a while.",
      to_login: "Already a member? Log in", to_signup: "New here? Sign up",
      err_nick: "Nickname must be 2–20 characters.", err_pw6: "Password must be 6–72 characters.", err_pw_match: "Passwords do not match.",
      err_nick_taken: "That nickname is already taken.", err_login: "Nickname or password is incorrect.", err_auth_rate: "Too many sign-ups from this connection. Please try later.",
      err_auth_down: "Sign-up is not available yet. Please try again later.",
      ok_signup: "Welcome! You are signed up and logged in.", ok_login: "Logged in.", ok_logout: "Logged out.",
      member_post_note: "Posting as {nick}. Log in on any device to edit or delete.", login_email_note: "Log in with your email and password.", show_pw: "Show password", nick_full: "Nicknames can be up to 20 characters. Put your email in the Email box when signing up.", nick_at: "The nickname is shown to everyone. Please don't use your email address as a nickname.",
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
      f_email: "이메일", f_nick: "글에 보일 닉네임 (2~20자)", f_pw: "비밀번호 (6자 이상)", f_pw2: "비밀번호 확인", f_newpw: "새 비밀번호 (6자 이상)",
      consent: "[필수] 이메일 주소 수집·이용에 동의합니다. 목적: 회원 확인과 비밀번호 찾기. 보관: 회원 탈퇴 때까지. 이메일은 다른 사람에게 보이지 않습니다.",
      err_consent: "가입하려면 이메일 수집·이용에 동의해 주세요.", err_email: "이메일 주소를 바르게 써 주세요.",
      signup_sent: "{email} 주소로 확인 메일을 보냈어요. 메일 속 링크를 누르면 가입이 끝나요. (스팸함도 확인해 주세요)",
      forgot: "비밀번호 찾기", forgot_title: "비밀번호 찾기", forgot_note: "가입한 이메일을 쓰시면 새 비밀번호를 정하는 링크를 보내 드려요.", btn_send: "보내기",
      forgot_sent: "{email} 주소가 회원이면 비밀번호 재설정 링크를 보냈어요.", newpw_title: "새 비밀번호 정하기", ok_newpw: "비밀번호를 바꿨어요.",
      ok_confirmed: "이메일 확인이 끝났어요. 환영합니다!", err_link: "링크가 만료되었거나 맞지 않아요. 다시 해 주세요.",
      account: "내 계정", withdraw: "회원 탈퇴", withdraw_confirm: "계정과 이메일을 지울까요? 쓴 글은 남지만 회원 표시는 사라져요.", ok_withdraw: "탈퇴했어요. 그동안 고마웠어요.",
      err_email_taken: "이미 가입한 이메일이에요. 로그인해 주세요.", err_not_confirmed: "먼저 이메일 확인 링크를 눌러 주세요.", err_mail_rate: "메일을 너무 많이 보냈어요. 잠시 뒤 다시 해 주세요.",
      to_login: "이미 회원이면 로그인", to_signup: "처음이면 회원가입",
      err_nick: "닉네임은 2~20자로 써 주세요.", err_pw6: "비밀번호는 6자 이상으로 써 주세요.", err_pw_match: "비밀번호가 서로 달라요.",
      err_nick_taken: "이미 쓰고 있는 닉네임이에요.", err_login: "닉네임이나 비밀번호가 맞지 않아요.", err_auth_rate: "이 연결에서 가입이 너무 많았어요. 나중에 다시 해 주세요.",
      err_auth_down: "회원 기능을 준비 중이에요. 잠시 뒤 다시 해 주세요.",
      ok_signup: "가입되었어요. 환영합니다! 바로 로그인되었어요.", ok_login: "로그인했어요.", ok_logout: "로그아웃했어요.",
      member_post_note: "{nick} 님 이름으로 올라가요. 어느 기기에서든 로그인하면 수정·삭제할 수 있어요.", login_email_note: "가입한 이메일과 비밀번호로 로그인해요.", show_pw: "비밀번호 보기", nick_full: "닉네임은 20자까지 들어가요. 이메일은 회원가입의 '이메일' 칸에 넣어 주세요.", nick_at: "닉네임은 모두에게 보여요. 이메일 주소는 닉네임으로 쓰지 않는 게 좋아요.",
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
      placeholder_reply: "댓글을 쓰세요 (2–1,000자)"
    }
  };

  /* ===== Dynamic Top 50 Ranking from CSV (added 2026-11-06) ===== */
  (function renderFullRanking() {
    function parseCSV(text) {
      var rows = [], row = [], cur = "", q = false, i, c;
      for (i = 0; i < text.length; i++) {
        c = text[i];
        if (q) {
          if (c === '"') { if (text[i+1] === '"') { cur += '"'; i++; } else q = false; }
          else cur += c;
        } else if (c === '"') q = true;
        else if (c === ',') { row.push(cur); cur = ""; }
        else if (c === '\n' || c === '\r') { if (cur || row.length) { row.push(cur); rows.push(row); } row = []; cur = ""; if (c === '\r' && text[i+1] === '\n') i++; }
        else cur += c;
      }
      if (cur || row.length) { row.push(cur); rows.push(row); }
      if (!rows.length) return [];
      var headers = rows[0];
      return rows.slice(1).filter(function(r){ return r.length > 1 && r[1]; }).map(function(r){
        var o = {};
        headers.forEach(function(h, idx){ o[h.trim()] = (r[idx] || "").trim(); });
        return o;
      });
    }

    function render(leaders) {
      var table = document.querySelector("table.wtl-rank");
      if (!table) return;
      var tbody = table.querySelector("tbody");
      if (!tbody) return;
      tbody.innerHTML = "";
      leaders.forEach(function(L, i) {
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
      .then(function(r){ return r.ok ? r.text() : Promise.reject(); })
      .then(parseCSV)
      .then(render)
      .catch(function(){});
  })();
})();
