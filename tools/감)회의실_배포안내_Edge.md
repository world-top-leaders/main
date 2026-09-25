# 회의실 Edge Function 배포 안내

작성: 오호(클로드) 2026-09-23

1. supabase login / link
2. functions new meeting-bot 후 `감)회의실_봇_edge함수.ts` 내용으로 교체
3. secrets: XAI_API_KEY, GEMINI_API_KEY, SB_SERVICE_ROLE_KEY
4. deploy --no-verify-jwt
5. Database Webhook: meeting_messages INSERT → meeting-bot
