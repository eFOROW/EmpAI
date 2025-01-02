//  page.tsx(question)

"use client";

import { useState, useEffect  } from "react";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import getCurrentUser from "@/lib/firebase/auth_state_listener";

const interviewQuestions = [
  {
    id: "1",
    category: "자기소개",
    level: "기본",
    question: "1분 자기소개 부탁드립니다.",
    tips: [
      "간단한 인사로 시작하여 이름, 지원 직무 언급",
      "핵심 역량과 경험을 2-3가지로 압축하여 전달",
      "해당 직무에 대한 열정과 포부로 마무리"
    ],
    example: "안녕하세요. ○○ 직무에 지원한 △△△입니다. 저는 □□ 프로젝트에서 팀장을 맡아 ◇◇한 성과를 이끌어낸 경험이 있습니다..."
  },
  {
    id: "2",
    category: "직무 역량",
    level: "심화",
    question: "본인의 강점과 약점은 무엇인가요?",
    tips: [
      "직무와 연관된 구체적인 강점 제시",
      "약점은 극복하기 위해 노력하는 부분으로 설명",
      "실제 경험과 연결하여 구체적으로 설명"
    ],
    example: "저의 가장 큰 강점은 문제 해결 능력입니다. 학부 프로젝트에서 발생한 ○○ 문제를 △△한 방식으로 해결한 경험이 있습니다..."
  },
  {
    id: "3",
    category: "직무 이해",
    level: "기본",
    question: "우리 회사에 지원한 이유는 무엇인가요?",
    tips: [
      "회사의 비전과 가치관에 대한 이해도 표현",
      "구체적인 사업 분야나 프로젝트에 대한 관심 언급",
      "자신의 경력 목표와의 연관성 설명"
    ],
    example: "귀사의 혁신적인 기술력과 글로벌 시장에서의 성장 가능성에 큰 매력을 느꼈습니다..."
  },
  {
    id: "4",
    category: "팀워크",
    level: "심화",
    question: "팀 프로젝트에서 갈등을 해결한 경험이 있나요?",
    tips: [
      "구체적인 상황과 문제점 설명",
      "본인의 역할과 해결 과정 강조",
      "결과와 배운 점 공유"
    ],
    example: "학부 프로젝트에서 팀원들과 개발 방향성에 대한 의견 차이가 있었습니다..."
  },
  {
    id: "5",
    category: "문제해결",
    level: "심화",
    question: "가장 어려웠던 문제를 해결한 경험을 말씀해주세요.",
    tips: [
      "구체적인 문제 상황 설명",
      "해결 과정에서의 본인의 역할과 접근 방식",
      "결과와 영향력 강조"
    ],
    example: "프로젝트 진행 중 성능 이슈가 발생했을 때..."
  },
  {
    id: "6",
    category: "성장가능성",
    level: "기본",
    question: "향후 5년 후의 목표는 무엇인가요?",
    tips: [
      "현실적이면서도 진취적인 목표 설정",
      "구체적인 성장 계획 제시",
      "회사와 함께 성장하고자 하는 의지 표현"
    ],
    example: "5년 후에는 팀의 핵심 개발자로 성장하여 주니어 개발자들을 이끌어주는 시니어 개발자가 되고 싶습니다..."
  },
  {
    id: "7",
    category: "직무 이해",
    level: "심화",
    question: "우리 회사의 경쟁사 대비 강점은 무엇이라고 생각하시나요?",
    tips: [
      "회사와 업계에 대한 사전 조사 필요",
      "객관적인 시장 분석 제시",
      "긍정적인 관점에서 답변"
    ],
    example: "귀사는 특히 AI 기술 분야에서 독보적인 경쟁력을 보유하고 있다고 생각합니다..."
  },
  {
    id: "8",
    category: "직무 역량",
    level: "기본",
    question: "개발자로서 가장 중요하다고 생각하는 역량은 무엇인가요?",
    tips: [
      "직무 특성을 잘 이해하고 있음을 보여주기",
      "실제 경험과 연계하여 설명",
      "지속적인 학습과 성장 강조"
    ],
    example: "개발자에게 가장 중요한 역량은 문제 해결 능력과 지속적인 학습 능력이라고 생각합니다..."
  },
  {
    id: "9",
    category: "문제해결",
    level: "기본",
    question: "업무 중 실수를 한 경험이 있다면 어떻게 대처하셨나요?",
    tips: [
      "정직하게 실수를 인정하는 태도",
      "문제 해결을 위한 구체적인 행동",
      "이를 통해 배운 점 강조"
    ],
    example: "프로젝트 중요 데이터를 실수로 삭제한 경험이 있습니다. 즉시 상황을 팀장님께 보고하고..."
  },
  {
    id: "10",
    category: "팀워크",
    level: "기본",
    question: "동료와의 의견 충돌 시 어떻게 해결하시나요?",
    tips: [
      "상대방의 의견을 존중하는 태도",
      "논리적인 토론 과정 설명",
      "합의점 도출 방법 제시"
    ],
    example: "먼저 상대방의 의견을 경청하고, 서로의 관점을 이해하려 노력합니다..."
  },
  {
    id: "11",
    category: "성장가능성",
    level: "심화",
    question: "최근에 학습한 새로운 기술이나 지식은 무엇인가요?",
    tips: [
      "구체적인 학습 내용 설명",
      "학습 동기와 과정 설명",
      "실무 적용 가능성 언급"
    ],
    example: "최근 Docker와 쿠버네티스에 대해 학습하였습니다. 이를 통해 컨테이너화된 애플리케이션 배포에 대한 이해도를 높였습니다..."
  },
  {
    id: "12",
    category: "자기소개",
    level: "심화",
    question: "지금까지 수행한 프로젝트 중 가장 기억에 남는 것은 무엇인가요?",
    tips: [
      "프로젝트의 목적과 역할 명확히 설명",
      "직면한 어려움과 극복 과정 설명",
      "성과와 배운 점 강조"
    ],
    example: "대학교 졸업 프로젝트로 진행했던 실시간 화상 채팅 애플리케이션이 가장 기억에 남습니다..."
  },
  {
    id: "13",
    category: "직무 이해",
    level: "심화",
    question: "우리 회사의 제품/서비스 중 개선하고 싶은 점이 있다면?",
    tips: [
      "제품/서비스에 대한 깊은 이해 표현",
      "건설적인 제안하기",
      "실현 가능한 개선 방안 제시"
    ],
    example: "귀사의 모바일 앱 사용성 측면에서 몇 가지 개선점을 발견했습니다..."
  },
  {
    id: "14",
    category: "문제해결",
    level: "심화",
    question: "업무 중 마감 기한을 맞추기 어려운 상황이 발생했다면 어떻게 대처하시겠습니까?",
    tips: [
      "우선순위 설정 방법 설명",
      "팀 내 커뮤니케이션 강조",
      "대안 제시 능력 표현"
    ],
    example: "먼저 프로젝트 매니저와 상황을 공유하고, 작업의 우선순위를 재조정합니다..."
  },
  {
    id: "15",
    category: "팀워크",
    level: "심화",
    question: "팀 내에서 소통이 잘 되지 않는 동료가 있다면 어떻게 대처하시겠습니까?",
    tips: [
      "적극적인 소통 시도 방법 설명",
      "상대방의 입장 고려",
      "팀 전체의 이익 고려"
    ],
    example: "먼저 해당 동료와 1:1 미팅을 통해 소통의 어려움에 대해 이야기를 나누고..."
  },
  {
    id: "16",
    category: "직무 역량",
    level: "심화",
    question: "새로운 기술 스택을 도입해야 하는 상황이라면 어떤 기준으로 결정하시겠습니까?",
    tips: [
      "기술 선정 기준 제시",
      "리스크 분석 능력 표현",
      "팀 역량 고려 방안 설명"
    ],
    example: "기술의 안정성, 커뮤니티 활성도, 학습 곡선, 팀의 수용 가능성 등을 종합적으로 고려합니다..."
  },
  {
    id: "17",
    category: "성장가능성",
    level: "기본",
    question: "업무 외 시간에 자기계발을 위해 어떤 노력을 하시나요?",
    tips: [
      "구체적인 학습 방법 제시",
      "지속적인 성장 의지 표현",
      "실질적인 성과 언급"
    ],
    example: "개발 관련 온라인 강의를 수강하고, 기술 블로그를 운영하며 지식을 공유하고 있습니다..."
  },
  {
    id: "18",
    category: "직무 이해",
    level: "기본",
    question: "개발자로서 일하면서 가장 보람을 느끼는 순간은 언제인가요?",
    tips: [
      "구체적인 경험 사례 제시",
      "직무에 대한 애정 표현",
      "가치 실현에 대한 의지 표현"
    ],
    example: "사용자들이 제가 개발한 기능을 유용하게 사용한다는 피드백을 받았을 때 가장 보람을 느낍니다..."
  },
  {
    id: "19",
    category: "문제해결",
    level: "기본",
    question: "프로젝트 진행 중 예상치 못한 문제가 발생했을 때의 대처 방법은?",
    tips: [
      "문제 분석 능력 표현",
      "해결을 위한 단계적 접근법 설명",
      "팀워크 강조"
    ],
    example: "먼저 문제의 원인을 파악하고, 팀원들과 브레인스토밍을 통해 해결 방안을 모색합니다..."
  },
  {
    id: "20",
    category: "성장가능성",
    level: "심화",
    question: "기술 트렌드 변화에 어떻게 대응하시나요?",
    tips: [
      "정보 수집 방법 설명",
      "학습 전략 제시",
      "실무 적용 방안 설명"
    ],
    example: "기술 블로그, 컨퍼런스 참가, 오픈소스 프로젝트 참여 등을 통해 최신 트렌드를 파악하고 있습니다..."
  }
];

const categories = [
  "전체",
  "자기소개",
  "직무 역량",
  "직무 이해",
  "팀워크",
  "문제해결",
  "성장가능성"
];

const levels = ["전체", "기본", "심화"];

type QuestionCardProps = {
  question: {
    category: string;
    level: string;
    question: string;
    tips: string[];
    example: string;
  };
  isOpen: boolean;
  onToggle: () => void;
};

const QuestionCard: React.FC<QuestionCardProps> = ({ question, isOpen, onToggle }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 hover:shadow-md transition-all duration-200">
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 text-left flex justify-between items-start hover:bg-gray-50 transition-colors"
      >
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <span className="px-3 py-1 text-sm rounded-full bg-blue-50 text-blue-600 font-medium">
              {question.category}
            </span>
            <span className="px-3 py-1 text-sm rounded-full bg-gray-50 text-gray-600 font-medium">
              {question.level}
            </span>
          </div>
          <span className="text-lg font-semibold text-gray-800">{question.question}</span>
        </div>
        <span className="text-2xl text-gray-400 transition-transform duration-200" style={{
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>
          ⌵
        </span>
      </button>
      
      {isOpen && (
        <div className="px-6 py-5 border-t border-gray-100 bg-gray-50">
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-blue-600 mb-4 flex items-center gap-2">
                <span className="text-xl">💡</span> 답변 꿀팁
              </h3>
              <ul className="space-y-3">
                {question.tips.map((tip: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-blue-500 font-bold">•</span>
                    <span className="text-gray-700 leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-green-600 mb-4 flex items-center gap-2">
                <span className="text-xl">📝</span> 답변 예시
              </h3>
              <p className="text-gray-700 leading-relaxed">{question.example}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function InterviewPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedLevel, setSelectedLevel] = useState("전체");
  const [openQuestionId, setOpenQuestionId] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Auth error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center">
        <p className="text-lg mb-2">해당 서비스는 로그인 후 사용 가능합니다.</p>
        <button
          onClick={() => router.push("/mypage")}
          type="button"
          className="mt-4 px-8 h-10 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          로그인 하러 가기
        </button>
      </div>
    );
  }
  const filteredQuestions = interviewQuestions.filter(q => {
    if (selectedCategory !== "전체" && q.category !== selectedCategory) return false;
    if (selectedLevel !== "전체" && q.level !== selectedLevel) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">면접 예상 질문</h1>
          <p className="text-lg text-gray-600">실전 면접을 위한 예상 질문과 모범 답안을 준비했습니다</p>
        </div>
  
        <div className="bg-white rounded-2xl shadow-md mb-8 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-3">카테고리</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${selectedCategory === category 
                        ? "bg-blue-500 text-white shadow-sm" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-3">난이도</h3>
              <div className="flex gap-2">
                {levels.map(level => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${selectedLevel === level
                        ? "bg-blue-500 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
  
        <div className="bg-white rounded-2xl shadow-md">
          <div className="h-[650px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <div className="p-6">
              {filteredQuestions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  isOpen={openQuestionId === question.id}
                  onToggle={() => setOpenQuestionId(
                    openQuestionId === question.id ? null : question.id
                  )}
                />
              ))}
              {filteredQuestions.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">해당하는 질문이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
