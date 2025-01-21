# 맞춤형 취업 플랫폼 EmpAI

**비트 고급 과정 5조**의 프로젝트로, AI를 활용한 맞춤형 취업 플랫폼입니다. 

## 팀원들

| 이름     | 역할          |
|----------|---------------|
| 김민수   | -             |
| 김원형   | -             |
| 이강민   | -             |
| 장소영   | -             |
| 정형준   | -             | 

## 프로젝트 목표

- AI 기반의 맞춤형 취업 추천 시스템 개발
- 사용자 친화적인 인터페이스 제공
- 데이터 분석을 통한 취업 시장 트렌드 파악

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

## 사용 방법

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
  npm start
  ```
