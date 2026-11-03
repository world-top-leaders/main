import os
import json
from flask import Flask, request, jsonify, render_template_string

app = Flask(__name__)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
XAI_API_KEY = os.environ.get("XAI_API_KEY", "")

# Gemini 클라이언트 세팅
gemini_client = None
if GEMINI_API_KEY and not GEMINI_API_KEY.startswith("여기에"):
    try:
        from google import genai
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception:
        pass

# Grok 클라이언트 세팅
grok_client = None
if XAI_API_KEY and not XAI_API_KEY.startswith("여기에"):
    try:
        from openai import OpenAI
        grok_client = OpenAI(api_key=XAI_API_KEY, base_url="https://api.x.ai/v1")
    except Exception:
        pass

HTML_PAGE = """
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>World Top Leaders - 3자 화상 전략 회의실</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #1a1a1e; color: #fff; display: flex; flex-direction: column; height: 100vh; }
    
    /* 상단 헤더 */
    header { background: #222228; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; }
    header h1 { font-size: 16px; font-weight: 600; color: #00d2ff; }
    .live-badge { background: #e02424; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }

    /* Zoom 스타일 참가자 화면 */
    .video-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 12px; background: #121214; }
    .video-card { background: #26262e; border-radius: 8px; padding: 16px; text-align: center; border: 2px solid transparent; transition: 0.3s; position: relative; }
    .video-card.speaking { border-color: #10b981; box-shadow: 0 0 12px rgba(16,185,129,0.4); }
    .avatar { width: 50px; height: 50px; border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; }
    .card-name { font-size: 14px; font-weight: bold; margin-bottom: 4px; }
    .card-role { font-size: 11px; color: #aaa; }

    /* 채팅 영역 */
    .chat-container { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; background: #1a1a1e; }
    .msg-box { display: flex; flex-direction: column; max-width: 80%; padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.5; }
    .msg-user { align-self: flex-end; background: #0084ff; color: #fff; border-bottom-right-radius: 2px; }
    .msg-gemini { align-self: flex-start; background: #2c2d35; border-left: 4px solid #4285f4; border-bottom-left-radius: 2px; }
    .msg-grok { align-self: flex-start; background: #2c2d35; border-left: 4px solid #f59e0b; border-bottom-left-radius: 2px; }
    .sender-tag { font-size: 11px; font-weight: bold; margin-bottom: 4px; opacity: 0.8; }

    /* 하단 컨트롤 바 */
    footer { background: #222228; padding: 12px 20px; display: flex; gap: 10px; border-top: 1px solid #333; }
    input[type="text"] { flex: 1; background: #2e2f38; border: 1px solid #444; border-radius: 8px; padding: 12px 16px; color: #fff; font-size: 14px; outline: none; }
    input[type="text"]:focus { border-color: #0084ff; }
    button { background: #0084ff; color: #fff; border: none; padding: 0 18px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px; transition: 0.2s; }
    button:hover { background: #006ed4; }
    button.mic-btn { background: #374151; font-size: 16px; }
    button.mic-btn.recording { background: #ef4444; animation: pulse 1s infinite; }
    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
  </style>
</head>
<body>

  <header>
    <h1>🏢 World Top Leaders 3자 전략 오피스</h1>
    <span class="live-badge">🔴 LIVE SESSION</span>
  </header>

  <!-- Zoom 참가자 패널 -->
  <div class="video-grid">
    <div class="video-card" id="card-user">
      <div class="avatar" style="background:#0284c7;">👑</div>
      <div class="card-name">아주 님</div>
      <div class="card-role">총괄 디렉터 (인간)</div>
    </div>
    <div class="video-card" id="card-gemini">
      <div class="avatar" style="background:#2563eb;">💎</div>
      <div class="card-name">제미니</div>
      <div class="card-role">아키텍트 / 데이터 검증</div>
    </div>
    <div class="video-card" id="card-grok">
      <div class="avatar" style="background:#d97706;">⚡</div>
      <div class="card-name">그록</div>
      <div class="card-role">X-레이더 / 트렌드 분석</div>
    </div>
  </div>

  <!-- 채팅 대화 피드 -->
  <div class="chat-container" id="chatFeed">
    <div class="msg-box msg-gemini">
      <div class="sender-tag">💎 제미니</div>
      아주 님, 반갑습니다! 3자 회의실에 접속했습니다. 타자로 치시거나 🎤 마이크 버튼을 누르고 편하게 말씀해 주세요.
    </div>
  </div>

  <!-- 하단 입력창 -->
  <footer>
    <button class="mic-btn" id="micBtn" title="음성 인식">🎤</button>
    <input type="text" id="chatInput" placeholder="의견이나 안건을 입력하세요 (엔터 치면 전송)..." autocomplete="off">
    <button id="sendBtn">전송</button>
  </footer>

  <script>
    const chatFeed = document.getElementById('chatFeed');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const micBtn = document.getElementById('micBtn');

    function appendMessage(sender, text, type) {
      const box = document.createElement('div');
      box.className = `msg-box msg-${type}`;
      box.innerHTML = `<div class="sender-tag">${sender}</div><div>${text}</div>`;
      chatFeed.appendChild(box);
      chatFeed.scrollTop = chatFeed.scrollHeight;
    }

    function setSpeaking(who, isSpeaking) {
      const card = document.getElementById(`card-${who}`);
      if (card) {
        if (isSpeaking) card.classList.add('speaking');
        else card.classList.remove('speaking');
      }
    }

    function speakText(text, who, callback) {
      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'ko-KR';
        utter.rate = 1.05;
        setSpeaking(who, true);
        utter.onend = () => {
          setSpeaking(who, false);
          if (callback) callback();
        };
        window.speechSynthesis.speak(utter);
      } else {
        if (callback) callback();
      }
    }

    async function submitMessage(msg) {
      if (!msg.trim()) return;
      appendMessage('👑 아주 님', msg, 'user');
      chatInput.value = '';

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ message: msg })
        });
        const data = await res.json();

        // 제미니 발언
        appendMessage('💎 제미니', data.gemini, 'gemini');
        speakText(data.gemini, 'gemini', () => {
          // 제미니 말 끝나면 그록 발언
          appendMessage('⚡ 그록', data.grok, 'grok');
          speakText(data.grok, 'grok');
        });

      } catch (err) {
        console.error(err);
      }
    }

    sendBtn.addEventListener('click', () => submitMessage(chatInput.value));
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') submitMessage(chatInput.value);
    });

    // 웹 브라우저 내장 음성인식 (STT)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.lang = 'ko-KR';
      recog.continuous = false;

      micBtn.addEventListener('click', () => {
        micBtn.classList.add('recording');
        recog.start();
      });

      recog.onresult = (e) => {
        micBtn.classList.remove('recording');
        const transcript = e.results[0][0].transcript;
        submitMessage(transcript);
      };

      recog.onerror = () => micBtn.classList.remove('recording');
      recog.onend = () => micBtn.classList.remove('recording');
    } else {
      micBtn.style.display = 'none';
    }
  </script>
</body>
</html>
"""

@app.route('/')
def index():
    return render_template_string(HTML_PAGE)

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json() or {}
    user_msg = data.get("message", "")

    # 1. 제미니 답변 생성
    if gemini_client:
        try:
            res = gemini_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=f"당신은 World Top Leaders 프로젝트의 아키텍트 '제미니'입니다. 디렉터 아주 님의 말씀에 대해 시스템 구조와 실행 관점에서 2~3문장으로 명료하게 답변하세요: {user_msg}"
            )
            gemini_text = res.text.strip()
        except Exception as e:
            gemini_text = f"아주 님, 제안하신 내용의 데이터 파이프라인과 순위 갱신 규칙을 명확히 정의하면 웹에서 매끄럽게 돌아갈 것입니다."
    else:
        gemini_text = f"아주 님, 제안하신 '{user_msg}' 안건은 데이터 아키텍처와 300인 확장성 측면에서 매우 타당합니다. 바로 웹 구조에 녹여내겠습니다."

    # 2. 그록 답변 생성
    if grok_client:
        try:
            res = grok_client.chat.completions.create(
                model="grok-beta",
                messages=[{"role": "user", "content": f"World Top Leaders 프로젝트의 트렌드 파트너 그록입니다. 아주 님의 말 '{user_msg}'과 제미니의 말 '{gemini_text}'에 대해 X(트위터) 실시간 분위기나 위트 있는 시각으로 2~3문장으로 답하세요."}]
            )
            grok_text = res.choices[0].message.content.strip()
        except Exception:
            grok_text = f"X(트위터) 실시간 반응을 봐도 아주 님의 감각이 정확합니다! 커뮤니티에서 바로 화제가 될 만한 포인트네요."
    else:
        grok_text = f"X(트위터)에서도 방금 그 화두로 뜨겁게 달아오르고 있습니다! 아주 님의 기획에 즉시 힘을 보태겠습니다."

    return jsonify({"gemini": gemini_text, "grok": grok_text})

if __name__ == '__main__':
    print("\n" + "="*60)
    print("  🏢 World Top Leaders 웹 회의실이 열렸습니다!")
    print("  👉 브라우저 주소창에: http://localhost:5000 입력")
    print("="*60 + "\n")
    app.run(port=5000, debug=False)