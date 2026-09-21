# GitHub → Google Drive 동기화

규칙: 파일은 항상 **GitHub에 먼저** 올린다. Drive는 복사본이다.

## 사이트
- 운영: https://world-top-leaders.netlify.app
- 테스트: https://wtl-test.netlify.app
- 리포: https://github.com/world-top-leaders/main
- Drive 폴더 ID: `1dSR2StutFYuN7imgH3RV40I8A0KdbJZm`

## 쓰기 전 시크릿 (한 번)
1. Google Cloud에서 서비스 계정 생성, Drive API 활성화
2. 서비스 계정 이메일에 Drive `world-top-leaders` 폴더 편집 권한 공유
3. 깃허브 리포 Settings → Secrets → Actions
   - `GDRIVE_SERVICE_ACCOUNT_JSON` : 서비스 계정 JSON 전체
   - `GOOGLE_DRIVE_FOLDER_ID` : `1dSR2StutFYuN7imgH3RV40I8A0KdbJZm`
4. Actions에서 `Sync docs to Google Drive` 수동 실행

JSON 키는 채팅에 붙이지 말 것. 깃허브 Secrets에만 넣는다.
