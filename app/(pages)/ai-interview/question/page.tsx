"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { 
  ChevronDown, 
  Filter, 
  Search, 
  BookOpen, 
  Star, 
  Award,
  FileText,
  Layers 
} from "lucide-react";
import getCurrentUser from "@/lib/firebase/auth_state_listener";


const interviewQuestions = [
  {
    id: "1",
    category: "자기소개",
    level: "기본",
    question: "자기소개 부탁드립니다.",
    tips: [
      "간단한 인사로 시작하여 이름, 지원 직무 언급",
      "핵심 역량과 경험을 2-3가지로 압축하여 전달",
      "해당 직무에 대한 열정과 포부로 마무리"
    ],
    example: `안녕하세요, 저는 [이름]입니다. 
    [전공 또는 직무 관련 소개]을 전공하며, [관련된 활동/경험]을 통해 전문성을 키워왔습니다. 
    문제 해결 능력과 팀워크를 중시하며, 변화에 적응하는 능력을 발전시키고 있습니다. 
    앞으로도 지속적인 학습과 성장을 통해 더 나은 전문가로 성장하고자 합니다.`
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
    example: `저의 강점은 커뮤니케이션 능력과 문제 해결 능력입니다. 
    팀원들과 원활한 소통을 통해 협업하며, 복잡한 문제를 효율적으로 해결하는 데 강점을 가지고 있습니다. 
    약점으로는 처음부터 모든 것을 완벽하게 수행하려는 성향이 있어, 
    이를 개선하기 위해 적극적으로 피드백을 받고 성장하려고 합니다.`
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
    example: `저는 [회사명]의 비전과 가치를 통해 성장의 기회를 얻고자 지원하게 되었습니다. 
    특히 [회사의 특정 서비스/프로젝트]가 제 관심 분야와 맞아떨어지며, 
    더 나아가 조직과 함께 발전할 수 있는 기회를 제공해 주리라 기대합니다.`
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
    example: `네, 팀 프로젝트에서 갈등을 해결한 경험이 있습니다. 
    과거 프로젝트에서 의견 차이가 있었을 때 팀원들과 충분히 소통하며 서로의 입장을 이해하고 협력하여 문제를 해결했습니다. 
    예를 들어, 서로 다른 의견이 부딪혔을 때, 팀원들과의 대화를 통해 공통의 목표를 설정하고 해결 방안을 찾았습니다. 
    이를 통해 팀워크를 강화하고 최종 결과물을 성공적으로 마무리할 수 있었습니다.`
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
    example: `가장 어려웠던 문제는 [구체적인 상황]이었습니다. 팀 프로젝트에서 예상치 못한 기술적 문제로 인해 
    진행이 어려웠던 상황에서, 팀원들과 함께 다양한 해결 방안을 논의하며 문제를 해결했습니다. 
    서로의 의견을 조율하고, 리서치와 반복된 테스트를 통해 문제의 원인을 분석하고 최적의 해결책을 도출했습니다. 
    결국 프로젝트를 성공적으로 마무리할 수 있었고, 문제 해결 능력이 크게 향상되었습니다.`
  },
  {
    id: "6",
    category: "성장가능성",
    level: "기본",
    question: "향후 5년 간의 목표는 무엇인가요?",
    tips: [
      "현실적이면서도 진취적인 목표 설정",
      "구체적인 성장 계획 제시",
      "회사와 함께 성장하고자 하는 의지 표현"
    ],
    example: `향후 5년 안에 전문성을 더욱 강화하고 리더십 역량을 개발하는 것이 제 목표입니다. 
    직무와 관련된 다양한 경험을 통해 새로운 기술을 습득하고, 점차 더 큰 책임을 맡으며 성장하고 싶습니다. 
    또한, 조직과 함께 성장하며 성과를 만들어내는 데 기여하는 것이 제 비전입니다.`
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
    example: `귀사의 경쟁사 대비 가장 큰 강점은 [구체적인 강점, 예: 고객 맞춤 서비스, 기술 혁신, 전문성 등]입니다.
     특히, [회사의 특정 서비스/프로젝트]에서 경쟁사보다 높은 수준의 [특정 가치, 품질, 지원 등]을 제공하여 차별화된 경험을 고객에게 제공하고 있습니다. 
     이러한 강점을 바탕으로 지속적으로 성장하고 혁신하는 모습이 회사의 경쟁력을 더욱 높이고 있다고 생각합니다.`
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
    example: `개발자로서 가장 중요하다고 생각하는 역량은 문제 해결 능력입니다. 
    새로운 기술이나 복잡한 문제에 직면했을 때, 빠르게 분석하고 최적의 해결책을 찾아내는 능력이 필요합니다. 
    또한, 커뮤니케이션과 협업 능력도 중요하다고 생각합니다. 팀원들과의 소통을 통해 함께 성장하고, 
    프로젝트의 방향을 명확히 하는 데 도움을 줍니다.

`
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
    example: `업무 중 실수를 한 경험이 있습니다. 문제 발생 후 빠르게 상황을 분석하고 팀원들과 함께 문제를 해결하기 위해 노력했습니다. 
    실수를 반복하지 않기 위해 해당 작업에 대한 추가 검토와 개선 방안을 마련했습니다. 
    이러한 경험을 통해 더 신중하게 업무를 수행하고, 개선된 프로세스를 적용하여 문제를 예방하려 노력하고 있습니다.`
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
    example: `동료와 의견 충돌이 발생하면 먼저 상대의 의견을 충분히 경청하고 이해하려고 합니다. 
    서로의 입장을 존중하며 논의하고, 공통의 목표를 설정하여 합의점을 찾기 위해 노력합니다. 
    결과적으로 서로의 차이를 인정하고 협력하는 방향으로 문제를 해결하려 합니다. 
    이런 방식으로 팀워크를 강화하고, 더 효과적인 결과를 도출할 수 있었습니다.`
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
    example: `최근에는 [구체적인 기술 또는 지식]을 학습했습니다. 
    예를 들어, [신기술 또는 언어]를 활용하여 [프로젝트 또는 과제]를 통해 실습하며 깊은 이해를 쌓았습니다. 
    이를 통해 실무에 적용할 수 있는 역량이 향상되었으며, 새로운 기술을 지속적으로 학습하며 더 넓은 분야에서 성장하고자 합니다.`
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
    example: `가장 기억에 남는 프로젝트는 [프로젝트명]입니다.
     이 프로젝트는 [구체적인 상황]에서 시작되었으며, 도전적이었지만 팀원들과 함께 문제를 해결하며 큰 성과를 이뤘습니다. 
     특히, [특정 기술이나 결과]를 통해 더 나은 시스템을 구축하고, 사용자에게 긍정적인 반응을 얻었던 경험이 인상 깊었습니다.`
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
    example: `우리 회사의 제품/서비스 중 개선하고 싶은 점은 [구체적인 개선 사항]입니다.
     예를 들어, [기능 추가/성능 향상/사용자 경험 개선 등]을 통해 더 나은 사용자 경험을 제공할 수 있을 것 같습니다. 
     이를 통해 고객 만족도를 더욱 높이고, 더 경쟁력 있는 서비스를 제공할 수 있을 것입니다.`
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
    example: `마감 기한을 맞추기 어려운 상황이 발생하면, 먼저 문제의 원인을 분석하고 우선순위를 재조정합니다. 
    필요한 경우 팀원이나 상사에게 상황을 빠르게 공유하여 협력을 요청하거나 추가적인 자원을 확보합니다. 
    동시에, 가능한 최적의 해결 방안을 실행하며, 이후에는 이러한 상황을 예방하기 위해 업무 계획과 시간을 더 철저히 관리하려고 노력합니다.`
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
    example: `소통이 잘 되지 않는 동료가 있다면 먼저 대화를 통해 그 원인을 파악하려고 합니다. 
    상대방의 입장과 의견을 존중하며, 열린 자세로 다가가는 것이 중요하다고 생각합니다. 
    또한, 업무에 필요한 사항은 명확하게 정리하여 전달하고, 서로의 기대치를 조율하려 노력합니다. 
    이를 통해 신뢰를 쌓고, 더 나은 협업 환경을 만들고자 합니다.`
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
    example: `새로운 기술 스택을 도입해야 한다면, 우선 프로젝트의 요구 사항과 목표에 얼마나 부합하는지를 평가합니다. 
    이후 기술의 안정성과 커뮤니티 지원 수준, 학습 곡선, 팀원들의 숙련도 등을 고려합니다. 
    또한, 도입했을 때의 장기적인 유지보수 가능성과 비용 효율성을 검토하여 최적의 선택을 내리고자 합니다.`
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
    example: `업무 외 시간에는 [직무 또는 관심 분야]와 관련된 기술이나 지식을 학습하기 위해 
    [구체적인 활동, 예: 온라인 강의, 자격증 공부]에 시간을 투자하고 있습니다. 
    또한, [개인 프로젝트/책 읽기/세미나 참석] 등을 통해 최신 트렌드를 따라가고 역량을 강화하려 노력합니다. 
    이러한 자기계발을 통해 업무에서도 더 나은 성과를 내는 데 기여하고 있습니다.`
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
    example: `개발자로서 가장 보람을 느끼는 순간은 제가 만든 결과물이 사용자에게 실질적인 가치를 제공했을 때입니다. 
    특히, [구체적인 사례, 예: 문제를 해결하거나 업무를 효율화한 경험]에서 사용자로부터 긍정적인 피드백을 받았을 때 큰 보람을 느꼈습니다. 
    이러한 경험은 제 기술과 노력이 실제로 사람들에게 도움을 줄 수 있다는 확신을 심어줍니다.`
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
    example: `프로젝트 중 예상치 못한 문제가 발생하면 먼저 문제의 원인을 신속히 분석하고, 
    팀원들과 함께 해결 방안을 논의합니다. 
    필요시 우선순위를 재조정하거나 대안을 마련하여 프로젝트 일정에 미치는 영향을 최소화하려고 합니다. 
    또한, 유사한 문제가 반복되지 않도록 사전 점검 프로세스를 강화하고, 
    경험을 통해 더 나은 문제 해결 능력을 갖추기 위해 노력합니다.`
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
    example: `기술 트렌드 변화에 대응하기 위해 관련 자료와 뉴스를 꾸준히 탐독하며 최신 기술 동향을 파악합니다. 
    또한, [온라인 강의, 세미나, 기술 커뮤니티 활동 등]을 통해 새로운 기술을 학습하고 실무에 적용할 방법을 모색합니다. 
    이런 노력을 통해 변화에 능동적으로 적응하며, 지속적으로 성장할 수 있도록 준비하고 있습니다.`
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
    <div className="bg-white rounded-2xl border border-gray-200 mb-4 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors group"
      >
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs rounded-full bg-blue-50 text-blue-600 font-medium">
              {question.category}
            </span>
            <span className="px-3 py-1 text-xs rounded-full bg-green-50 text-green-600 font-medium">
              {question.level}
            </span>
          </div>
          <span className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
            {question.question}
          </span>
        </div>
        <ChevronDown 
          className={`w-6 h-6 text-gray-400 transition-transform duration-300 
            ${isOpen ? 'rotate-180' : 'rotate-0'}`} 
        />
      </button>
      
      {isOpen && (
        <div className="px-6 py-5 bg-gray-50 border-t border-gray-200">
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-blue-600 mb-4 flex items-center gap-3">
                <Star className="w-5 h-5 text-blue-500" /> 답변 꿀팁
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
            
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-green-600 mb-4 flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-green-500" /> 답변 예시
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {question.example}
              </p>
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
  const [searchTerm, setSearchTerm] = useState("");

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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-white px-4">
        <Award className="w-24 h-24 text-blue-500 mb-6" />
        <p className="text-2xl font-bold text-gray-800 mb-4">로그인이 필요한 서비스입니다</p>
        <button
          onClick={() => router.push("/mypage")}
          className="px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-md"
        >
          <Star className="w-5 h-5" /> 로그인 하러 가기
        </button>
      </div>
    );
  }

  const filteredQuestions = interviewQuestions.filter(q => {
    const matchCategory = selectedCategory === "전체" || q.category === selectedCategory;
    const matchLevel = selectedLevel === "전체" || q.level === selectedLevel;
    const matchSearch = searchTerm === "" || 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.category.includes(searchTerm);
    
    return matchCategory && matchLevel && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* 헤더 섹션 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400 mb-3">
            면접 질문 가이드
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            실전 면접을 위한 맞춤형 질문과 전략적인 모범 답변을 제공합니다
          </p>
        </div>
  
        {/* 필터링 섹션 */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 p-6 border border-gray-100">
          <div className="grid md:grid-cols-3 gap-6">
            {/* 카테고리 필터 */}
            <div className="relative">
              <label className="text-sm font-semibold text-gray-600 mb-3 block">
                카테고리 필터
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
                      ${selectedCategory === category 
                        ? "bg-blue-500 text-white shadow-md" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                  >
                    <Filter className="w-4 h-4" /> {category}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 난이도 필터 */}
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-3 block">
                난이도 필터
              </label>
              <div className="flex flex-wrap gap-2">
                {levels.map(level => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${selectedLevel === level
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
  
            {/* 질문 검색 */}
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-3 block">
                질문 검색
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="질문을 검색해보세요"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-300 transition-all"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
  
        {/* 질문 리스트 섹션 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="h-[650px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <div className="p-6">
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    isOpen={openQuestionId === question.id}
                    onToggle={() => setOpenQuestionId(
                      openQuestionId === question.id ? null : question.id
                    )}
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <Search className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                  <p className="text-xl text-gray-500 font-medium">
                    검색 결과가 없습니다
                  </p>
                  <p className="text-gray-400 mt-2">
                    다른 키워드로 다시 검색해보세요
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}