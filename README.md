# EmpAI
**비트 고급과정**의 프로젝트로, AI를 활용한 맞춤형 취업 플랫폼입니다. 
Employment with AI

AI 취업 플랫폼(EmpAI)은 맞춤형 채용정보 및 자기소개서, 면접서비스를 제공하는 플랫폼이다.
기존 취업 준비 과정에서는 지도 기반의 기업 탐색 기능이 부족하여 원하는 지역의 기업 정보를 직접 주소를 복사해 별도의 지도 서비스에 입력해야 하는 번거로움이 있었고, AI 모의면접의 경우 단순 수치 결과에 그쳐 구체적 개선점을 제시하지 못해 면접 준비에 어려움이 있다.
이러한 문제점을 해결하기 위해 본 프로젝트는 AI를 활용한 모의면접 시스템을 도입, 사용자가 실시한 면접 영상을 분석하여 강점과 약점을 세밀하게 파악하고 구체적인 피드백을 제공한다.    또한, LLM 기반의 자기소개서 분석 모델을 통해 사용자가 작성한 자기소개서를 유사 합격자기소개서와 매칭하여 효과적인 첨삭 피드백을 지원하며, 지도 기반 기업 탐색 기능을 도입해 원하는 지역의 기업 정보를 한눈에 확인할 수 있도록 하여 시간과 노력을 대폭 절감한다. 이와 같이 본 솔루션은 취업 준비 전반의 불편함을 해소하고, 면접 및 서류 준비 과정에서 실질적인 경쟁력을 갖출 수 있도록 돕는 혁신적인 통합 플랫폼이다.

## ⏲️ 프로젝트 기간
- **주제선정 & 기획**    : 2024.11.25 - 2024.12.06
- **공부 & 개발**    : 2024.12.09 - 2025.02.07 (평일 38일)
- **문서화 & 정리**  : 2025.02.07 - 2025.02.18

## 🧑‍🤝‍🧑 팀원 소개

| 이름       | 담당                                       | 학과(2024)              |
|------------|--------------------------------------------|-------------------|
| [김민수](https://github.com/mayway777) | Team LeadㆍFull-StackㆍAI Video Analysis     | 컴퓨터정보ㆍ보안전공 4학년 |
| [김원형](https://github.com/eFOROW)    | Technical LeadㆍFull-StackㆍCloud Infra & Deployment | 컴퓨터ㆍ소프트웨어전공 2학년 |
| [이강민](https://github.com/lkmsdf159)  | Frontend DeveloperㆍRAG-based AI Feedback     | AIㆍ빅데이터학과 3학년 |
| [장소영](https://github.com/sy56)        | Frontend DeveloperㆍQA Engineer               | 컴퓨터정보ㆍ보안전공 3학년 |
| [정형준](https://github.com/Junghyeongjun) | External API IntegrationㆍPrompt Engineer          | 컴퓨터정보ㆍ보안전공 3학년 |


### 설계의 주안점

- AI 모의면접 : 면접 영상을 분석하여 음성 및 영상정보로 평가하고 피드백을 제공
- 면접 평가 개선 : 비언어적 행동뿐만 아니라 답변의 내용에 대한 피드백을 제공하여 개선
- 자기소개서 첨삭 : LLM을 통해 자기소개서를 평가 및 합격자소서와 비교하여 피드백을 제공
- 지도 기반 기업 탐색 : 지도와 연동된 기업 정보를 제공하여 직관적 검색이 가능


### 기대효과

- 면접 역량 강화 : AI 모의면접 및 평가를 통해 면접 실력을 빠르게 분석하고 보완
- 자기소개서 개선 : LLM 첨삭과 합격자소서 비교로 서류 경쟁력을 높임
- 정보 접근성 향상 : 지도 연동 채용공고 검색으로 번거로운 탐색 과정을 대폭 간소화
- 통합 취업 준비 : 모든 기능을 하나로 통합해 취업 준비 전반의 효율성을 극대화


### 사용 기술

- 개발 환경 : Windows 10 / Gabia Cloud / MongoDB Altas / Node.js / Nginx / CUDA
- 개발 도구 : Visual Studio Code, PuTTY, FileZilla, Ngrok
- 개발 언어 : TypeScript, JavaScript, Python
- 프레임워크 : Next.js, FastAPI, TensorFlow, PyTorch
- 라이브러리 : React, TailwindCSS, Gemma, LangChain, ollama, openCV, Whisper, MediaPipe
- 외부서비스 : Naver API, Google Analytics API, Saramin API, OpenAI API, Firebase Auth


## 전체 프로젝트
**웹 서버** : https://github.com/eFOROW/EmpAI

**자기소개서 피드백 LLM 서버** : https://github.com/lkmsdf159/EemAI_self-introduction_ai_server

**영상 분석 AI 서버** : https://github.com/mayway777/AI_Interview_Server

(LOC 91k)

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
