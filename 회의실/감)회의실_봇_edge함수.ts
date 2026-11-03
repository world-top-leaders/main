// Supabase Edge Function: meeting-bot
// World Top Leaders 회의실 — 그록/제미니 자동 응답 (서버리스, PC/외부서버 불필요)
// 작성: 오호(클로드) 2026-09-23
//
// 동작: 아주가 meeting_messages에 메시지를 INSERT하면
//       Database Webhook이 이 함수를 즉시 호출 → 그록·제미니 API를 동시에 불러
//       각자 응답을 다시 meeting_messages에 INSERT한다.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SB_SERVICE_ROLE_KEY")!;
const XAI_API_KEY = Deno.env.get("XAI_API_KEY");
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function buildPrompt(name: string, transcript: string) {
  return `아래는 "World Top Leaders" 프로젝트 회의실 대화 기록입니다. 당신은 ${name} 역할로 참여 중입니다.
가장 최근 아주(디렉터)의 발언에 대해, 간결하고 실무적으로 의견/제안을 답하세요. 자기소개나 인사말은 생략합니다.

--- 대화 기록 ---
${transcript}
--- 여기까지 ---

${name}의 응답:`;
}

async function callGrok(prompt: string): Promise<string> {
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${XAI_API_KEY}`, "Content-Type": "application/json" },
    // 모델명은 xAI 콘솔에서 현재 사용 가능한 최신 모델명으로 확인 후 바꿔주세요.
    body: JSON.stringify({
      model: "grok-4-latest",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`Grok API 오류: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "(응답 없음)";
}

async function callGemini(prompt: string): Promise<string> {
  // 모델명은 Google AI Studio에서 현재 사용 가능한 최신 모델명으로 확인 후 바꿔주세요.
  const model = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) throw new Error(`Gemini API 오류: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "(응답 없음)";
}

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const row = payload.record ?? payload.new;

    if (!row || row.sender !== "아주") {
      return new Response("skip", { status: 200 });
    }

    const { data: history, error } = await supabase
      .from("meeting_messages")
      .select("*")
      .eq("room_id", row.room_id)
      .order("created_at", { ascending: true })
      .limit(20);
    if (error) throw error;

    const transcript = (history ?? []).map((m) => `${m.sender}: ${m.content}`).join("\n");

    const tasks: Promise<void>[] = [];

    if (XAI_API_KEY) {
      tasks.push(
        callGrok(buildPrompt("그록", transcript))
          .then((reply) =>
            supabase.from("meeting_messages").insert({
              room_id: row.room_id,
              sender: "그록",
              role: "ai",
              content: reply,
            })
          )
          .then(() => {})
          .catch((e) => console.error("그록 오류:", e))
      );
    }

    if (GEMINI_API_KEY) {
      tasks.push(
        callGemini(buildPrompt("제미니", transcript))
          .then((reply) =>
            supabase.from("meeting_messages").insert({
              room_id: row.room_id,
              sender: "제미니",
              role: "ai",
              content: reply,
            })
          )
          .then(() => {})
          .catch((e) => console.error("제미니 오류:", e))
      );
    }

    await Promise.all(tasks);
    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(String(err), { status: 500 });
  }
});
