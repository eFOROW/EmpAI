# EmpAI

## 👨‍🏫 프로젝트 소개 [EmpAI]
**비트 고급 과정 5조**의 프로젝트로, AI를 활용한 맞춤형 취업 플랫폼입니다. 
Employment with AI

## ⏲️ 프로젝트 기간
- **기획** : 2024.11.25 - 2024.12.06
- **개발** : 2024.12.9 - 2025.2.7 (평일 38일)
- **정리** : 2025.2.7 - 2025.2.18

## 🧑‍🤝‍🧑 팀원 소개

| 이름       | 담당          |
|------------|---------------|
| [김민수](https://github.com/mayway777)| - |
| [김원형](https://github.com/eFOROW)| - |
| [이강민](https://github.com/lkmsdf159)| - |
| [장소영](https://github.com/sy56)| - |
| [정형준](https://github.com/Junghyeongjun)| - |

## 프로젝트 목표(예시)

- AI 기반의 맞춤형 취업 추천 시스템 개발
- 사용자 친화적인 인터페이스 제공
- 데이터 분석을 통한 취업 시장 트렌드 파악


## 전체 프로젝트
**웹 서버**: https://github.com/eFOROW/EmpAI

**자기소개서 피드백 LLM 서버**: https://github.com/lkmsdf159/EemAI_self-introduction_ai_server

**영상 분석 AI 서버**: 

## 설치 방법

1. 이 저장소를 클론합니다.
   ```bash
   git clone https://github.com/eFOROW/EmpAI.git
   ```
2. 필요한 패키지를 설치합니다.
   ```bash
   cd EmpAI
   npm install
   ```

## 사용 방법(Next.js)

- .env.local 파일을 설정합니다.
  ```
  NEXT_PUBLIC_FIREBASE_API_KEY=
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
  NEXT_PUBLIC_FIREBASE_APP_ID=
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
  NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=
  NEXT_PUBLIC_CLIENT_ID=
  NEXT_PUBLIC_SECRET_KEY=
  MONGODB_URI=

  # Server Url
  AI_SERVER_URL=
  LLM_SERVER_URL=
  
  # OpenAI
  OPENAI_API_KEY=
  
  # Firebase Admin SDK
  FIREBASE_CLIENT_EMAIL=
  FIREBASE_PRIVATE_KEY=
  ```

- 애플리케이션을 실행합니다.
  ```bash
  npm run build && npm run start
  ```