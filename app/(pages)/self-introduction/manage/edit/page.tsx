"use client";

import React from 'react';
import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import getCurrentUser from '@/lib/firebase/auth_state_listener';
import { useRouter } from 'next/navigation';
import { Form, Input, Typography, Modal, Button, message, Checkbox } from "antd";

const { TextArea } = Input;
const { Title, Text } = Typography;

interface Answer {
  question: string;
  answer: string;
}

const allQuestions = [
  "자기소개를 해주세요.",
  "본인의 강점과 약점을 각각 설명해주세요.",
  "회사의 비전과 본인의 목표가 어떻게 일치하는지 설명해주세요.",
  "어려움을 극복한 경험을 설명해주세요.",
  "팀워크를 발휘한 경험을 설명해주세요.",
  "리더십을 발휘한 경험을 설명해주세요.",
  "목표를 설정하고 달성한 경험을 설명해주세요.",
  "문제를 해결한 경험을 설명해주세요.",
  "업무 중 가장 큰 갈등을 해결한 경험을 설명해주세요.",
  "어떤 일을 할 때 가장 만족감을 느끼나요?",
  "스트레스 상황에서 어떻게 대처했는지 설명해주세요.",
  "자기개발을 위해 노력한 경험을 설명해주세요.",
  "실수를 통해 배운 경험을 설명해주세요.",
  "시간 관리에 대한 본인의 방법을 설명해주세요.",
  "예상치 못한 상황에서 어떻게 대처했는지 설명해주세요.",
  "다양한 의견이 충돌할 때 어떻게 조율했는지 설명해주세요.",
  "본인이 중요하게 생각하는 가치는 무엇인가요?",
  "회사에서 이루고 싶은 목표가 무엇인지 설명해주세요.",
  "새로운 아이디어나 방안을 제시했던 경험을 설명해주세요.",
  "자신이 맡은 일을 어떻게 개선하거나 혁신했는지 설명해주세요.",
  "다양한 사람들과 협업한 경험을 설명해주세요.",
  "다른 사람과의 갈등을 해결한 경험을 설명해주세요.",
  "장기적인 목표를 설정하고 어떻게 실행에 옮겼는지 설명해주세요.",
  "자신이 경험한 가장 큰 실패는 무엇이며, 그로부터 배운 점은 무엇인가요?",
  "변화에 민첩하게 적응했던 경험을 공유해주세요. 그 상황에서 어떻게 적응했으며, 어떤 결과를 가져왔나요?",
  "주어진 자원과 시간이 제한된 상황에서 우선순위를 정하고 목표를 달성했던 경험을 이야기해주세요.",
  "기존의 시스템이나 방식을 개선하기 위해 주도한 경험에 대해 설명해주세요.",
  "압박을 받을 때 어떻게 감정을 조절하고 효율적으로 일처리를 하나요?",
  "새로운 업무나 분야에 도전했을 때의 경험을 설명하고, 그 과정에서 배운 점은 무엇인가요?",
  "한정된 시간 내에 중요한 결정을 내려야 했던 경험이 있나요? 그 결정을 내리기 위한 과정과 결과에 대해 설명해주세요.",
];

const options = [
    { value: "기획·전략", label: "기획·전략" },
    { value: "마케팅·홍보·조사", label: "마케팅·홍보·조사" },
    { value: "회계·세무·재무", label: "회계·세무·재무" },
    { value: "인사·노무·HRD", label: "인사·노무·HRD" },
    { value: "총무·법무·사무", label: "총무·법무·사무" },
    { value: "IT개발·데이터", label: "IT개발·데이터" },
    { value: "디자인", label: "디자인" },
    { value: "영업·판매·무역", label: "영업·판매·무역" },
    { value: "고객상담·TM", label: "고객상담·TM" },
    { value: "구매·자재·물류", label: "구매·자재·물류" },
    { value: "상품기획·MD", label: "상품기획·MD" },
    { value: "운전·운송·배송", label: "운전·운송·배송" },
    { value: "서비스", label: "서비스" },
    { value: "생산", label: "생산" },
    { value: "건설·건축", label: "건설·건축" },
    { value: "의료", label: "의료" },
    { value: "연구·R&D", label: "연구·R&D" },
    { value: "교육", label: "교육" },
    { value: "미디어·문화·스포츠", label: "미디어·문화·스포츠" },
    { value: "금융·보험", label: "금융·보험" },
    { value: "공공·복지", label: "공공·복지" },
];


const questionsData: {[key: string]: string[]} = {
    "기획·전략": [
        "지원 분야와 관련하여 대표적으로 수행한 프로젝트(업무)를 수행시기/내용/방법/성과 및 결과중심으로 기술하시오.",
        "목표를 설정하고 그 목표를 달성하기 위한 계획을 세운 경험을 말해주세요.",
        "기존의 문제를 해결하기 위한 새로운 접근 방법을 제시한 경험이 있다면 이야기해주세요.",
        "자원의 제한이 있을 때 어떻게 전략적으로 자원을 배분하여 효율적으로 목표를 달성할 수 있을까요?",
        "변화하는 환경에서 전략을 유연하게 조정한 경험이 있다면 그 과정과 결과를 설명해주세요."
    ],
    "마케팅·홍보·조사": [
        "지원 분야와 관련하여 대표적으로 수행한 프로젝트(업무)를 수행시기/내용/방법/성과 및 결과중심으로 기술하시오.",
        "제품이나 서비스의 경쟁력을 높이기 위해 홍보 전략을 어떻게 설계하고 실행했는지 구체적으로 설명해주세요.",
        "디지털 마케팅 또는 소셜 미디어 활용 경험이 있다면, 그 결과와 학습한 점을 공유해주세요.",
        "시장조사를 통해 얻은 인사이트가 실제 업무에 어떻게 활용된 경험이 있나요?",
        "타겟 시장을 정의하고, 해당 시장에 맞춘 마케팅 전략을 구상한 경험을 공유해주세요."
    ],
    "회계·세무·재무": [
        "지원 분야와 관련하여 대표적으로 수행한 프로젝트(업무)를 수행시기/내용/방법/성과 및 결과중심으로 기술하시오.",
        "세무 신고나 회계 결산 과정에서 발생할 수 있는 오류를 예방하기 위한 방법이나 절차를 설명해주세요.",
        "세법이나 회계 기준의 변화가 회사에 미친 영향을 분석하고, 그에 맞는 대응 방법을 제시한 경험이 있다면 구체적으로 설명해주세요.",
        "회계 및 재무 관련 법규의 준수를 위해 어떤 방법으로 지속적인 학습과 업데이트를 해왔는지 구체적으로 설명해주세요.",
        "회계 시스템을 개선하거나 효율성을 높이기 위한 방법을 제시한 경험이 있다면, 그 과정과 성과를 설명해주세요.",
    ],
    "인사·노무·HRD": [
        "지원 분야와 관련하여 대표적으로 수행한 프로젝트(업무)를 수행시기/내용/방법/성과 및 결과중심으로 기술하시오.",
        "인사(HR) 업무에서 가장 중요하다고 생각하는 원칙은 무엇이며, 그 원칙을 학습 또는 실무에 어떻게 적용했는지 설명해주세요.",
        "인재 채용이나 평가 시스템 개선을 위해 기여한 경험이 있다면, 그 경험을 구체적으로 설명해주세요.",
        "인사(HR)나 조직 관리를 통해 회사와 직원 모두에게 긍정적인 영향을 줄 수 있는 방안은 무엇이라고 생각하나요?",
        "인사(HR)나 노무, HRD 관련 이슈 중 하나를 선택하고, 이를 해결하기 위한 본인의 아이디어를 제안해주세요."
    ],
    "총무·법무·사무": [
        "지원 분야와 관련하여 대표적으로 수행한 프로젝트(업무)를 수행시기/내용/방법/성과 및 결과중심으로 기술하시오.",
        "효율적으로 문서를 작성하거나 데이터를 관리했던 경험을 구체적으로 설명해주세요.",
        "사무/총무 업무를 수행하며 가장 중요하다고 생각되는 역량은 무엇인가요? 본인의 강점과 연결하여 설명해주세요.",
        "정확성과 꼼꼼함이 요구되는 일을 수행했던 경험이 있다면, 그 과정과 결과를 설명해주세요.",
        "법률이나 규정이 조직의 운영에 미치는 영향을 설명하고, 그 변화에 어떻게 대응해야 한다고 생각하나요?"
    ],
    "IT개발·데이터": [
        "지원 분야와 관련하여 대표적으로 수행한 프로젝트(업무)를 수행시기/내용/방법/성과 및 결과중심으로 기술하시오.",
        "IT 기술을 활용하여 사회적 문제를 해결하거나 개선할 수 있는 방안을 제안해보세요.",
        "데이터의 보안이나 윤리적 활용과 관련하여 본인의 생각과, 이를 위해 실천할 수 있는 방법을 설명해주세요.",
        "미래의 IT 기술 또는 데이터 활용이 사회나 산업에 끼칠 긍정적인 영향을 본인의 비전과 함께 설명해주세요.",
        "IT 시스템이나 데이터 분석을 통해 업무 프로세스를 개선한 경험이 있다면, 그 과정과 결과를 설명해주세요.",
    ],
    "디자인": [
        "지원 분야와 관련하여 대표적으로 수행한 프로젝트(업무)를 수행시기/내용/방법/성과 및 결과중심으로 기술하시오.",
        "디자인을 통해 사람들의 삶이나 경험을 개선할 수 있다고 생각하는 부분은 무엇인가요?",
        "프로젝트에서 협업을 통해 성공적으로 디자인을 완성한 경험이 있다면 그 과정과 역할을 설명해주세요.",
        "새로운 디자인 트렌드나 기술을 학습하고 적용한 경험이 있다면, 그 과정을 구체적으로 설명해주세요.",
        "디자인을 통해 해결하고 싶은 사회적 문제나 개선하고 싶은 분야가 있다면 구체적으로 설명해주세요.",
    ],
    "영업·판매·무역": [
        "지원 분야와 관련하여 대표적으로 수행한 프로젝트(업무)를 수행시기/내용/방법/성과 및 결과중심으로 기술하시오.",
        "설득력 있는 커뮤니케이션을 통해 긍정적인 결과를 이끌어낸 경험이 있다면, 그 과정을 구체적으로 설명해주세요.",
        "문화적 차이나 언어적 장벽이 있는 상황에서 효과적으로 소통하거나 문제를 해결한 경험이 있다면 설명해주세요.",
        "급변하는 시장 환경에서 경쟁력을 유지하거나 강화하기 위해 본인이 중요하다고 생각하는 전략은 무엇인지 설명해주세요.",
        "다른 사람의 의견이나 피드백을 반영하여 결과물을 개선하거나 더 나은 방향으로 발전시킨 경험이 있다면 설명해주세요.",
    ],
    "고객상담·TM": [
        "지원 분야와 관련하여 대표적으로 수행한 프로젝트(업무)를 수행시기/내용/방법/성과 및 결과중심으로 기술하시오.",
        "학교나 일상에서 타인의 요구를 이해하고 이를 충족시키기 위해 노력했던 경험이 있다면 설명해주세요.",
        "다양한 사람들과 소통하며 갈등을 조정하거나 원만한 관계를 유지했던 경험이 있다면 설명해주세요.",
        "스트레스를 받는 상황에서도 차분하고 긍정적인 태도로 문제를 해결했던 경험이 있다면 설명해주세요.",
        "긴급한 상황에서 침착하게 대처하고 문제를 해결했던 경험이 있다면, 그 과정을 설명해주세요.",
    ],
    "구매·자재·물류": [
        "지원 분야와 관련하여 대표적으로 수행한 프로젝트(업무)를 수행시기/내용/방법/성과 및 결과중심으로 기술하시오.",
        "제한된 자원을 활용하여 효율적으로 문제를 해결하거나 목표를 달성했던 경험이 있다면 설명해주세요.",
        "다양한 과제를 동시에 진행하거나 우선순위를 정하여 업무를 처리했던 경험이 있다면 설명해주세요.",
        "예상치 못한 변수나 상황 변화에 유연하게 대처했던 경험이 있다면 구체적으로 설명해주세요.",
        "정확성과 꼼꼼함이 필요한 작업을 성공적으로 수행했던 경험이 있다면 그 과정을 설명해주세요.",
    ],
    "상품기획·MD": [
        "지원 분야와 관련하여 대표적으로 수행한 프로젝트(업무)를 수행시기/내용/방법/성과 및 결과중심으로 기술하시오.",
        "시장이나 트렌드 변화를 분석하고 이를 바탕으로 새로운 아이디어를 제안했던 경험이 있다면 설명해주세요.",
        "소비자 관점에서 상품의 가치를 판단하거나 개선점을 제안했던 경험이 있다면 설명해주세요.",
        "상품의 가치를 극대화하거나 판매 가능성을 높이기 위해 노력했던 경험이 있다면 설명해주세요.",
        "상품기획·MD 직무를 통해 본인이 이루고자 하는 목표와 비전을 구체적으로 설명해주세요.",
    ],
    "운전·운송·배송": [
        "지원 분야와 관련하여 대표적으로 수행한 프로젝트(업무)를 수행시기/내용/방법/성과 및 결과중심으로 기술하시오.",
        "운전·운송 업무를 통해 얻고자 하는 기술과 전문성이 있다면 무엇이며, 이를 향상시키기 위해 어떤 노력을 기울이고 싶은가요?",
        "운전·운송 업무를 통해 고객 만족을 높이기 위한 자신만의 목표와 전략은 무엇인가요?",
        "운송·배송 과정에서 새로운 기술이나 시스템을 활용하여 업무 프로세스를 개선하고자 하는 목표가 있다면 무엇인가요?",
        "운전·운송 직무에서 안전성을 더욱 강화하기 위해 어떤 개선 방안을 적용하고 싶으신가요?",
    ],
    "서비스": [
        "지원 분야와 관련하여 대표적으로 수행한 프로젝트(업무)를 수행시기/내용/방법/성과 및 결과중심으로 기술하시오.",
        "다양한 고객의 요구사항을 만족시키기 위해 어떤 방법을 사용했는지 설명해주세요.",
        "서비스를 제공하며 겪었던 가장 어려운 상황과 이를 해결하기 위해 어떤 노력을 했는지 설명해주세요.",
        "서비스 개선을 위해 새로운 아이디어를 제안했던 경험이 있다면 설명해주세요.",
        "서비스 제공 과정에서의 효율성을 높이기 위해 어떤 시스템이나 프로세스를 개선했던 경험이 있는지 설명해주세요.",
    ],
    "생산": [
        "지원 분야와 관련하여 대표적으로 수행한 프로젝트(업무)를 수행시기/내용/방법/성과 및 결과중심으로 기술하시오.",
        "생산 공정에서의 효율성을 높이기 위해 개선한 사례가 있다면 설명해주세요.",
        "생산 과정에서 발생할 수 있는 문제를 해결했던 경험이 있다면 설명해주세요.",
        "안전한 생산 환경을 유지하기 위해 어떤 노력을 기울일 수 있을지 설명해주세요.",
        "신기술 또는 새로운 생산 방식을 배우거나 적용한 경험이 있다면 설명해주세요.",
    ],
    "건설·건축": [
        "지원 분야와 관련하여 대표적으로 수행한 프로젝트(업무)를 수행시기/내용/방법/성과 및 결과중심으로 기술하시오.",
        "건설 프로젝트나 건축 설계 과정에서 창의성을 발휘했던 경험이 있다면 설명해주세요.",
        "건설·건축 직무에서 자신의 전문성을 강화하기 위해 어떤 목표를 세우고 있는지 설명해주세요.",
        "건축 설계나 시공 과정에서 효율성을 높이기 위해 어떤 방식을 적용하고 싶은지 설명해주세요.",
        "건설·건축 관련 최신 기술이나 트렌드를 학습하거나 적용한 경험이 있다면 설명해주세요.",
    ],
    "의료": [
        "지원 분야와 관련하여 대표적으로 수행한 프로젝트(업무)를 수행시기/내용/방법/성과 및 결과중심으로 기술하시오.",
        "의료 관련 최신 기술이나 트렌드를 학습하거나 활용한 경험이 있다면 설명해주세요.",
        "긴급한 의료 상황에서 침착하게 대처한 경험이 있다면 설명해주세요.",
        "의료 현장에서 환자의 안전과 품질 관리를 위해 어떤 노력을 기울일 계획인지 설명해주세요.",
        "환자에게 신뢰를 줄 수 있는 의료인이 되기 위해 자신이 갖추고자 하는 역량은 무엇인가요?",
    ],
    "연구·R&D": [
        "지원 분야와 관련하여 대표적으로 수행한 프로젝트(업무)를 수행시기/내용/방법/성과 및 결과중심으로 기술하시오.",
        "새로운 문제나 아이디어를 해결하기 위해 창의적으로 접근했던 경험이 있다면 설명해주세요.",
        "연구나 개발을 진행하면서 실패했던 경험이 있다면, 이를 극복하기 위해 어떤 노력을 했는지 구체적으로 설명해주세요.",
        "연구 과정에서 지속적으로 배우고 성장하기 위해 본인이 취했던 구체적인 노력은 무엇인가요?",
        "연구 결과가 실제로 적용되었거나 사회에 긍정적인 영향을 미친 사례가 있다면 설명해주세요.",
    ],
    "교육": [
        "지원 분야와 관련하여 대표적으로 수행한 프로젝트(업무)를 수행시기/내용/방법/성과 및 결과중심으로 기술하시오.",
        "교육 과정에서 학습자의 다양한 수준과 배경을 고려한 맞춤형 지도를 했던 경험이 있다면 설명해주세요.",
        "학생들의 동기 부여를 위해 창의적인 방법을 사용했던 경험이 있다면 설명해주세요.",
        "새로운 교육 기법이나 기술을 학습하거나 적용했던 경험이 있다면 설명해주세요.",
        "교육 분야에서 달성하고 싶은 궁극적인 목표와 이를 이루기 위한 노력은 무엇인가요?",
    ],
    "미디어·문화·스포츠": [
        "지원 분야와 관련하여 대표적으로 수행한 프로젝트(업무)를 수행시기/내용/방법/성과 및 결과중심으로 기술하시오.",
        "본인이 좋아하거나 감명받은 미디어·문화·스포츠 콘텐츠가 있다면, 이를 통해 느낀 점과 본인의 직무 목표에 어떤 영향을 미쳤는지 설명해주세요.",
        "미디어·문화·스포츠 콘텐츠를 기획하거나 제작해본 경험이 있다면, 그 과정과 결과에 대해 설명해주세요.",
        "미디어·문화·스포츠 분야에서 발생하는 윤리적 이슈를 어떻게 바라보며, 이를 해결하기 위한 본인의 역할은 무엇이라고 생각하나요?",
        "미디어·문화·스포츠 분야에서 본인의 강점을 활용하여 새로운 가치를 창출할 수 있는 방법은 무엇이라고 생각하나요?",
    ],
    "금융·보험": [
        "지원 분야와 관련하여 대표적으로 수행한 프로젝트(업무)를 수행시기/내용/방법/성과 및 결과중심으로 기술하시오.",
        "금융·보험 업무에서 발생할 수 있는 변동성을 관리하고, 지속 가능한 해결책을 제시하기 위해 어떤 전략을 사용할 계획인가요?",
        "리스크 관리가 중요한 금융·보험 분야에서 본인이 가진 강점은 무엇이며, 이를 어떻게 활용할 수 있을까요?",
        "금융·보험 분야에서 디지털 기술의 발전이 가져올 변화를 어떻게 바라보고 있으며, 이를 직무에 어떻게 적용할 수 있을까요?",
        "금융·보험 분야에서 데이터 분석과 리스크 관리를 통해 업무의 효율성을 높인 경험이 있다면 설명해주세요.",
    ],
    "공공·복지": [
        "지원 분야와 관련하여 대표적으로 수행한 프로젝트(업무)를 수행시기/내용/방법/성과 및 결과중심으로 기술하시오.",
        "공공·복지 서비스 제공 과정에서 발생할 수 있는 문제를 해결하기 위해 사용한 창의적 접근법은 무엇인가요?",
        "공공·복지 분야에서 다양한 이해관계자와 소통하며 협력했던 경험이 있다면, 그 과정과 결과를 설명해주세요.",
        "공공·복지 분야에서의 직무 윤리와 사회적 책임을 어떻게 실현해 나갈 계획인가요?",
        "사회적 약자를 위한 공공·복지 서비스 개선을 위해 본인이 제안할 수 있는 새로운 프로그램이나 정책은 무엇인가요?",
    ]
    };



const ManagePage: React.FC = () => {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [answers, setAnswers] = useState<Answer[]>([]);

    const [title, setTitle] = useState('')

    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]); // 선택된 질문
    const [isFormGenerated, setIsFormGenerated] = useState(false); // 질문 생성 여부
    const [messageApi, contextHolder] = message.useMessage();
    
    const [selectedValue, setSelectedValue] = useState(''); // 직무 선택
    const [selectJobQ, setSelectJobQ] = useState(''); // 선택된 질문
    const [jobAnswer, setJobAnswer] = useState(''); // 답변


    // 모달 열기/닫기 핸들러
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);


    useEffect(() => {
        getCurrentUser().then((user) => {
          if (!user) {
            router.push('/mypage');
          } else {
            setUser(user);
          }
        });
        if (selectedValue) {
            const questions = questionsData[selectedValue] || [];
            setSelectedQuestions(questions);
            setSelectJobQ(questions[0] || ''); // 첫 번째 질문을 기본값으로 설정
        } else {
            setSelectedQuestions([]);
            setSelectJobQ('');
        }
    }, [router, selectedValue]);

    const handleTitleChange = (e:any) => {
        setTitle(e.target.value);
    };

    const handleSelectChange = (e:any) => {
        setSelectedValue(e.target.value); // 직무 선택 변경
    };

    const handleSelectJobChange = (e:any) => {
        setSelectJobQ(e.target.value); // 질문 선택 변경
    };

    const handleJobAnswerChange = (value:any) => {
        setJobAnswer(value); // 답변 변경
    };

    const warning = () => {
        messageApi.open({
        type: 'warning',
        content: '최대 3개까지 선택 가능합니다.',
        });
    };

    const handleAnswerChange = (index: number, value: string) => {
        const newAnswers = [...answers];
        newAnswers[index].answer = value;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        try {
            // 필수 입력값 검증
            if (!title) {
                messageApi.error('제목을 입력해주세요.');
                return;
            }

            if (!selectedValue) {
                messageApi.error('직무를 선택해주세요.');
                return;
            }

            // answers 배열의 모든 답변이 입력되었는지 확인
            const isAllAnswersFilled = answers.every(answer => answer.answer.trim() !== '');
            if (!isAllAnswersFilled) {
                messageApi.error('모든 공통역량 질문에 답변을 입력해주세요.');
                return;
            }

            const token = await user?.getIdToken();
            
            // 기존 answers 배열 복사
            let allAnswers = [...answers];

            // 직무 관련 질문과 답변이 모두 있을 때만 추가
            if (selectJobQ && jobAnswer.trim()) {
                allAnswers.push({
                    question: selectJobQ,
                    answer: jobAnswer.trim()
                });
            }

            const response = await fetch('/api/self-introduction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    job_code: selectedValue,
                    data: allAnswers,
                    uid: user?.uid
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create document');
            }

            messageApi.success('성공적으로 저장되었습니다.');
            router.push('/self-introduction/manage');
        } catch (error) {
            console.error('Error creating document:', error);
            messageApi.error('저장 중 오류가 발생했습니다.');
        }
    };

    const handleGenerateForm = () => {
        if (selectedQuestions.length === 3) {
        setAnswers(
            selectedQuestions.map((question) => ({
            question,
            answer: "",
            }))
        );
        setIsFormGenerated(true); // 질문 폼 생성 상태 업데이트
        }
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-white">
            <div className="w-full h-screen px-6 flex justify-center items-start mt-10">
                {!isFormGenerated && (
                    <div className="relative w-full max-w-3xl min-h-[450px] p-10 bg-white rounded-2xl shadow-[0_4px_30px_0_rgba(173,235,250,0.8)] flex flex-col items-center space-y-8 border border-blue-200 mt-20">
                        {/* 상단 타이틀 및 설명 추가 */}
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-gray-800 mt-5 mb-12">자기소개서 등록</h1>
                            <p className="text-lg text-gray-600 max-w-lg mx-auto mt-15">
                                자신을 소개하는 중요한 문서를 쉽게 작성해보세요. 질문을 선택하고 
                                답변을 통해 나만의 자기소개서를 만들어보세요!
                            </p>
                        </div>

                        {/* 버튼 및 폼 내용 */}
                        <div className="flex flex-col items-center space-y-6 w-full">
                            <Button
                                onClick={openModal}
                                className="bg-gradient-to-r from-[#00b0f3] to-[#001fb6] text-white hover:from-[#00aaff] hover:to-[#003366] 
                                transition-all duration-300 ease-in-out py-7 px-12 text-xl rounded-full shadow-md hover:shadow-2xl focus:outline-none 
                                focus:ring-2 focus:ring-blue-500"
                                style={{ marginTop: '60px' }}  // 버튼을 약간 아래로 내리기 위한 margin-top 추가
                            >
                                질문 선택하기
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal styling */}
            <Modal
                title={
                    <div className="text-2xl font-bold text-gray-800 pb-2 border-b">
                        질문 선택
                    </div>
                }
                open={isModalOpen}
                onCancel={closeModal}
                footer={[
                    <Button 
                        key="close"
                        disabled={selectedQuestions.length !== 3}
                        className={`mt-4 py-3 px-8 rounded-lg text-white text-lg transition-all duration-300 ${
                            selectedQuestions.length === 3 
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg" 
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                        onClick={() => {
                            closeModal();
                            handleGenerateForm();
                        }}
                        style={{ width: '30%' }}
                    >
                        생성하기
                    </Button>
                ]}
                centered
                width={700}
                className="rounded-2xl"
            >
                {/* 질문 선택 내용 카드 */}
                <div
                    style={{
                        flexDirection: "row", // 수직으로 항목 정렬
                        gap: "12px", // 항목 간 간격
                        maxWidth: "700px",
                        maxHeight: "700px", // 최대 높이 조정
                        overflowY: "auto", // 세로 스크롤만 허용
                    }}
                >{contextHolder}
                    <Checkbox.Group
                        value={selectedQuestions}
                        onChange={(values) => {
                            // 선택된 질문이 3개 이하일 경우에만 업데이트
                            if (values.length <= 3) {
                                setSelectedQuestions(values);
                            } else {
                                warning();
                            }
                        }}
                        style={{
                            display: "flex",
                            flexDirection: "row", // 세로로 항목 정렬
                            gap: "10px", // 항목 간의 간격
                            overflowY: "auto", // 세로 스크롤을 활성화
                            maxWidth: "700px",
                            maxHeight: "550px", // 높이를 지정해 스크롤을 추가할 공간 확보
                        }}
                    >
                        {allQuestions.map((question, index) => (
                            <Checkbox
                                key={index}
                                value={question}
                                style={{
                                    width: "610px",
                                    padding: "15px 15px", // 체크박스 패딩
                                    borderRadius: "6px", // 둥근 테두리
                                    border: "1px solid #e5e7eb", // 체크박스 경계선
                                    transition: "all 0.3s", // 애니메이션
                                    fontSize: "18px", // 글자 크기 조정
                                }}
                            >{question}</Checkbox>
                        ))}
                    </Checkbox.Group>
                    <p
                        style={{
                            marginTop: "12px",
                            fontSize: "12px",
                            color: "#888", // 안내문구 색상
                        }}
                    >3개의 질문을 선택하세요.</p>
                </div>

            </Modal>

            {/* Form styling */}
            {isFormGenerated && (
                <div className="w-full max-w-4xl px-4 mt-8">
                    <Form layout="vertical" className="bg-white rounded-xl shadow-lg p-8 space-y-6 border border-gray-100">
                        {/* 제목 섹션 */}
                        <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center space-x-2 pb-3 border-b border-gray-200">
                                <span className="text-gray-500">
                                    <i className="fas fa-heading"></i> {/* 제목 아이콘 */}
                                </span>
                                <Title level={3} className="text-xl text-gray-900 font-semibold">
                                    제목
                                </Title>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-gray-500">
                                    <i className="fas fa-edit"></i> {/* 입력 아이콘 */}
                                </span>
                                <Input
                                    value={title}
                                    onChange={handleTitleChange}
                                    placeholder="제목을 입력하세요"
                                    className="w-full p-3 text-lg border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white shadow-sm"
                                />
                            </div>
                        </div>

                        {/* 공통역량 질문 섹션 */}
                        <div className="space-y-8 mt-10 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                            <Title level={3} className="text-xl text-gray-900 font-semibold border-b pb-3">
                                공통역량 질문
                            </Title>
                            {answers.map((answer, index) => (
                                <Form.Item
                                    key={index}
                                    label={
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                                                <span className="text-gray-600 font-bold">Q</span>
                                            </div>
                                            <Text strong className="text-base text-gray-800">
                                                {answer.question}
                                            </Text>
                                        </div>
                                    }
                                    className="space-y-2"
                                >
                                    <TextArea
                                        value={answer.answer}
                                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                                        rows={6}
                                        maxLength={550}
                                        showCount
                                        className="w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-shadow bg-white text-gray-700 placeholder-gray-400"
                                        placeholder="여기에 내용을 입력하세요."
                                    />
                                </Form.Item>
                            ))}
                        </div>
                        {/* 직무관련 질문 섹션 */}
                        <div className="space-y-8 mt-10 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                            <Title level={3} className="text-xl text-gray-900 font-semibold border-b pb-3">
                                직무관련 질문
                            </Title>

                            {/* 드롭다운 섹션 */}
                            <div className="flex gap-6 items-center">
                                {/* 직무 선택 */}
                                <div className="flex items-center w-1/3">
                                    <span className="mr-2 text-gray-500">
                                        <i className="fas fa-briefcase"></i> {/* 직무 아이콘 */}
                                    </span>
                                    <select
                                        className="w-full p-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white"
                                        value={selectedValue}
                                        onChange={handleSelectChange}
                                    >
                                        <option value="">직무를 선택하세요</option>
                                        {options.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* 직무 관련 질문 선택 */}
                                {selectedValue && (
                                    <div className="flex items-center w-2/3">
                                        <span className="mr-2 text-gray-500">
                                            <i className="fas fa-question-circle"></i> {/* 질문 아이콘 */}
                                        </span>
                                        <select
                                            className="w-full p-3 text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white"
                                            value={selectJobQ}
                                            onChange={handleSelectJobChange}
                                        >
                                            {selectedQuestions.map((question, index) => (
                                                <option key={index} value={question}>
                                                    {question}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* 직무 관련 질문 답변 */}
                            {selectJobQ && (
                                <div className="space-y-2 mt-6">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                                            <span className="text-gray-600 font-bold">Q</span>
                                        </div>
                                        <Text strong className="text-base text-gray-800">
                                            {selectJobQ}
                                        </Text>
                                    </div>
                                    <TextArea
                                        value={jobAnswer}
                                        onChange={(e) => handleJobAnswerChange(e.target.value)}
                                        rows={6}
                                        maxLength={550}
                                        showCount
                                        className="w-full rounded-md border border-gray-300 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white text-gray-700 placeholder-gray-400 shadow-sm"
                                        placeholder="여기에 내용을 입력하세요."
                                    />
                                </div>
                            )}
                        </div>

                        {/* 버튼 그룹 */}
                        <div className="flex justify-center gap-4 mt-8">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="py-3 px-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-lg rounded-lg 
                                shadow-md hover:shadow-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-700"
                            >
                                제출하기
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push('/self-introduction/manage')}
                                className="py-3 px-8 bg-gray-500 text-white text-lg rounded-lg shadow-md hover:shadow-lg 
                                transition-all duration-300 hover:bg-gray-600"
                            >
                                취소
                            </button>
                        </div>
                    </Form>
                </div>
            )}
        </div>
    );
};

export default ManagePage;