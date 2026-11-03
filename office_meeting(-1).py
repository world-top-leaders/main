import os
import speech_recognition as sr
import pyttsx3
from google import genai
from openai import OpenAI

# 1. API 키 설정 (아주 님의 키를 입력해 주세요)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "여기에_GEMINI_API_KEY_입력")
XAI_API_KEY = os.environ.get("XAI_API_KEY", "여기에_GROK_XAI_API_KEY_입력")

# 클라이언트 초기화
gemini_client = genai.Client(api_key=GEMINI_API_KEY)
grok_client = OpenAI(api_key=XAI_API_KEY, base_url="https://api.x.ai/v1")

# TTS 음성 엔진 초기화
tts_engine = pyttsx3.init()
tts_engine.setProperty('rate', 185) # 말하기 속도

def speak(speaker_name, text):
    print(f"\n📢 [{speaker_name} 발언]:\n{text}\n")
    tts_engine.say(text)
    tts_engine.runAndWait()

def ask_gemini(user_query, history_context):
    prompt = f"""
    당신은 'World Top Leaders' 프로젝트의 핵심 총괄 파트너 '제미니'입니다.
    총괄 디렉터인 '아주' 님, 그리고 트렌드 포집 파트너인 '그록(Grok)'과 3자 전략 회의 중입니다.
    데이터 아키텍처, 4대 점수 지표(연구/사업/AGI/재산), 웹 시스템, 300인 확장 등 구조와 실행에 집중해 조언하세요.
    음성으로 낭독되므로 친근하고 명료하게 3~4문장 내외로 핵심을 말하세요.

    [이전 대화 맥락]:
    {history_context}

    [아주 님의 말씀/안건]:
    {user_query}
    """
    response = gemini_client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )
    return response.text.strip()

def ask_grok(user_query, gemini_reply, history_context):
    prompt = f"""
    당신은 'World Top Leaders' 프로젝트의 트렌드·레이더 파트너 '그록(Grok)'입니다.
    총괄 디렉터인 '아주' 님, 그리고 아키텍처 파트너인 '제미니'와 3자 회의 중입니다.
    X(트위터)의 실시간 반응, 업계 화제성, 대중성, 독창적이고 날카로운 시각으로 제미니의 의견에 살을 붙이거나 보완하세요.
    음성으로 낭독되므로 유쾌하고 솔직하게 3~4문장 내외로 말하세요.

    [아주 님의 안건]: {user_query}
    [제미니의 의견]: {gemini_reply}
    """
    response = grok_client.chat.completions.create(
        model="grok-beta",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content.strip()

def get_voice_input():
    r = sr.Recognizer()
    with sr.Microphone() as source:
        print("\n🎤 마이크를 듣고 있습니다... (말씀해 주세요)")
        r.adjust_for_ambient_noise(source, duration=0.8)
        try:
            audio = r.listen(source, timeout=6, phrase_time_limit=15)
            text = r.recognize_google(audio, language="ko-KR")
            print(f"👉 [인식된 말씀]: {text}")
            return text
        except Exception:
            return None

def start_meeting():
    print("="*65)
    print("  🏢 World Top Leaders 3자 전략 회의실 (아주 x 제미니 x 그록)")
    print("  • 타자 입력: 그냥 글을 치고 Enter")
    print("  • 음성 입력: 'v' 입력 후 Enter 누르고 마이크에 말씀")
    print("  • 회의 종료: 'exit' 또는 'q'")
    print("="*65)

    meeting_history = ""

    while True:
        mode = input("\n[회의 발언 모드] (Enter: 타자입력 / v: 음성입력 / q: 종료): ").strip()
        
        if mode.lower() in ['q', 'exit']:
            print("\n회의를 마칩니다. 수고하셨습니다!")
            break
            
        user_msg = ""
        if mode.lower() == 'v':
            user_msg = get_voice_input()
            if not user_msg:
                print("음성이 잘 인식되지 않았습니다. 다시 시도해 주세요.")
                continue
        else:
            user_msg = input("\n⌨️ [아주 님 발언]: ").strip()
            if not user_msg:
                continue

        # 1. 제미니 발언 생성 및 낭독
        gemini_thought = ask_gemini(user_msg, meeting_history)
        speak("제미니 (Architecture)", gemini_thought)

        # 2. 그록 발언 생성 및 낭독
        grok_thought = ask_grok(user_msg, gemini_thought, meeting_history)
        speak("그록 (Trend & X-Radar)", grok_thought)

        # 회의 기록 누적
        meeting_history += f"\n[아주]: {user_msg}\n[제미니]: {gemini_thought}\n[그록]: {grok_thought}\n"

if __name__ == "__main__":
    start_meeting()