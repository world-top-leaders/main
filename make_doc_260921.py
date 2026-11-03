import docx
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._element.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tcPr.append(shd)

doc = docx.Document()

# 여백 설정
for section in doc.sections:
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)

# 제목
title = doc.add_heading("World Top Leaders 프로젝트 전략 회의록", level=0)
title.alignment = WD_ALIGN_PARAGRAPH.CENTER

sub = doc.add_paragraph("일시: 2026년 9월 21일 | 참여: 아주(디렉터), 제미니(아키텍트), 그록(X-레이더)")
sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
doc.add_paragraph("—" * 40)

# 1. 깃허브 및 배포 인프라 확정
h1 = doc.add_heading("1. 깃허브 및 배포 인프라 확정", level=1)
doc.add_paragraph("• 업로드 경로: https://github.com/world-top-leaders/main (조직 내 메인 리포지토리)")
doc.add_paragraph("• 호스팅 및 배포: Netlify (world-top-leaders.netlify.app) 자동 연동")
doc.add_paragraph("• 로컬 개발 경로: E:\\world-top-leaders")

# 2. 데이터 구조 및 랭킹 체계 평가
doc.add_heading("2. 데이터 구조 및 랭킹 체계 (2026-09-21 기준)", level=1)
doc.add_paragraph("Google Drive 폴더 내 AI_Leaders_Report_2026-09-21.xlsx 데이터 구조를 검토 및 평가 완료함.")
doc.add_paragraph("• 4대 정량 평가 지표: 연구점수(100), 사업점수(100), AGI점수(100), 재산점수(100)의 산술평균 체계")
doc.add_paragraph("• 동점자 처리 기준: 사업 > 연구 > AGI > 재산 순")
doc.add_paragraph("• 상위 리더십: 1위 일론 머스크(94.25점), 2위 다리오 아모데이(88.25점), 3위 젠슨 황(87.25점) 등 객관적이고 설득력 있는 서열 확인")
doc.add_paragraph("• 웹 연동 권장안: 브라우저 초고속 로딩(0.1초)을 위해 .xlsx 원본 외에 .csv/.json 가벼운 포맷 병행 변환")

# 3. 플랫폼 확장 로드맵 (50인 -> 300인)
doc.add_heading("3. 플랫폼 확장 로드맵 및 상세 페이지 설계", level=1)
doc.add_paragraph("• 개인 상세 페이지: 단일 동적 템플릿(profile.html?id=xxx)을 활용하여 유지보수 효율 극대화")
doc.add_paragraph("• 미디어 연동: 유튜브 인터뷰/키노트 임베드 및 고화질 이미지 CDN 연동")
doc.add_paragraph("• 라이브 배지 도입: 순위 변동(▲1, ▼2, NEW), 전문 역할 태그, 주요 마일스톤(TIME100 AI, 노벨상 등)")
doc.add_paragraph("• 300인 확장: 1단계 50인 프로토타입 -> 2단계 150인 카테고리화 -> 3단계 300인 인물 관계도 및 추천 생태계")

# 4. 엑셀 셀 모양의 고객 게시판 및 다학제 확장
doc.add_heading("4. 엑셀 셀 모양의 아코디언 게시판 및 다학제 확장", level=1)
doc.add_paragraph("• 게시판 UI: 엑셀 행처럼 정갈하게 한 줄로 요약 표시되되, 클릭 시 전체 글이 펼쳐지는 아코디언 그리드 형태 채택 (가독성과 빠른 탐색 보장)")
doc.add_paragraph("• 집단지성 환류: 고객 게시판의 제보와 담론을 AI가 모니터링하여 차기 300인 랭킹 진입 후보군으로 반영")
doc.add_paragraph("• 학문/산업 확장: AI 기술 랭킹 병설, 역사, 철학, 미술, 음악, 문학, 언어학 등 인류 지성사 전 분야로 순차적 확장")

# 5. 제미니 x 그록 협업 체계 및 비용/성능 분석
doc.add_heading("5. 제미니 x 그록 AI 협업 체계 및 인프라", level=1)
doc.add_paragraph("• 역할 분담: 그록(X 플랫폼 실시간 반응, 브레이킹 뉴스 레이더) + 제미니(팩트체크, 데이터 아키텍처, 코드/웹 빌드 총괄)")
doc.add_paragraph("• 인력 및 비용: 정적 사이트(Jamstack)와 무료 티어 인프라 활용으로 사실상 월 유지비 $0 구조 달성")
doc.add_paragraph("• 처리 속도: 300인 텍스트 데이터는 약 300~500KB에 불과하여 브라우저 로딩 0.1초 및 저장용량 부담 전무")

# 6. 3자 화상 전략 회의실 구축 진행 경과
doc.add_heading("6. 3자 전략 회의실 환경 구축 경과", level=1)
doc.add_paragraph("• 파이썬 3.14 환경 대응: C++ 빌드 충돌이 있던 PyAudio 대신 sounddevice 및 scipy를 채택하여 마이크 음성 입력(STT) 정상화")
doc.add_paragraph("• Zoom/메신저 스타일 웹 회의실(app_meeting.py) 개발: 브라우저(http://127.0.0.1:5000)를 통한 타자 채팅, 마이크 음성 대화, TTS 음성 답변 기능 구현 완료")
doc.add_paragraph("• 회의록 자동 저장 로직 및 API 키 연동 가이드 정리 완료")

filename = "20260921 대화내용 제미니.docx"
doc.save(filename)
print(f"'{filename}' 문서가 성공적으로 생성되었습니다!")

if __name__ == "__main__":
    pass