# 제미니 × 그록 × 아주 — World Top Leaders 전략 회의록

일시: 2026년 9월 21일 (정리 반영: 2026-09-22)  
참여: 아주(디렉터), 제미니(아키텍트·보조), 그록(정보수집·평점·리포트 주관)

## 0. 2026-09-22 확정 사항

- 대표 사이트: **world-top-leaders**(복수) — https://world-top-leaders.netlify.app
- 테스트 사이트: **world-top-leader**(단수) — https://world-top-leader.netlify.app
- 깃허브: https://github.com/world-top-leaders/main
- 로컬 경로: `E:\world-top-leaders`
- 역할: 그록이 세계 지도자 정보 수집·평점·리포트 주관, 제미니는 Drive/문서/빌드 보조
- 회의실: 3자 참석 방식으로 제미니가 설계·구축, 결과물은 Drive/GitHub로 공유

## 1. 깃허브 및 배포 인프라

- 업로드 경로: https://github.com/world-top-leaders/main
- 운영 호스팅: Netlify `world-top-leaders.netlify.app`
- 테스트 호스팅: Netlify `world-top-leader.netlify.app`

## 2. 데이터 구조 및 랭킹 체계 (2026-09-21)

- 원본: Google Drive `AI_Leaders_Report_2026-09-21.xlsx`
- 4대 지표: 연구 100 / 사업 100 / AGI 100 / 재산 100, 산술평균
- 동점: 사업 > 연구 > AGI > 재산
- 1위 Elon Musk 94.25, 2위 Dario Amodei 88.25, 3위 Jensen Huang 87.25
- 웹용으로 xlsx와 함께 csv/json 병행

## 3. 플랫폼 확장 로드맵

- 상세 페이지: `profile.html?id=xxx` 단일 템플릿
- 미디어: 유튜브 임베드, 이미지 CDN
- 라이브 배지: ▲▼ NEW, 역할 태그, TIME100/노벨 등
- 확장: 50인 → 150인 → 300인 (1단계는 50인 사이트 안정화)

## 4. 게시판 및 분야 확장

- 엑셀 행형 아코디언 그리드
- 제보/담론을 차기 후보 모니터링에 환류
- 이후 역사·철학·예술·과학 등 순차 확장

## 5. 협업 체계

- 그록: X/뉴스 레이더, 정보 수집, 평점, 일일 리포트, GitHub 커밋
- 제미니: 팩트체크 보조, Drive 시트/문서, 웹 빌드 보조
- 아주: 중재, 로컬 E: 원본, 회의 진행
- 인프라: Jamstack, 소량 csv/json

## 6. 3자 회의실 경과 (제미니 구축)

- 로컬 웹 회의실(`app_meeting.py`), `http://127.0.0.1:5000`
- 타자 채팅, 마이크 STT, TTS 구상
- 그록은 로컬 127.0.0.1에 직접 입장하지 못하므로 회의록을 Drive/GitHub에 저장해 공유
- 목표: 3자가 같은 목적을 보고 파일을 기준으로 협업
