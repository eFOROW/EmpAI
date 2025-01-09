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
        "기획 업무에서 가장 중요한 점은 무엇인가요?",
        "전략 수립 시 어떤 데이터를 분석하나요?",
        "프로젝트 기획 시 팀원과의 협업 방식은 어떤가요?",
        "기획을 할 때 가장 큰 어려움은 무엇인가요?",
        "기획 업무에서 성과를 측정하는 방법은 무엇인가요?"
    ],
    "마케팅·홍보·조사": [
        "마케팅 캠페인에서 가장 중요한 요소는 무엇인가요?",
        "온라인 광고의 효과를 어떻게 측정하나요?",
        "소셜 미디어 마케팅에서 주의할 점은 무엇인가요?",
        "브랜드 인지도 향상을 위한 전략은 무엇인가요?",
        "마케팅 전략을 수립할 때 고려해야 할 주요 요소는 무엇인가요?"
    ],
    "회계·세무·재무": [
        "회계 업무에서 자주 사용하는 프로그램은 무엇인가요?",
        "세무 신고 시 가장 중요한 부분은 무엇인가요?",
        "재무 분석 시 가장 중요한 지표는 무엇인가요?",
        "기업의 재무 상태를 평가하는 방법은 무엇인가요?",
        "회계 감사 준비 과정에서 중요하게 생각하는 사항은 무엇인가요?"
    ],
    "인사·노무·HRD": [
        "인사 관리에서 가장 중요한 업무는 무엇인가요?",
        "직원 교육 및 개발을 어떻게 진행하나요?",
        "조직 내 갈등을 어떻게 해결하나요?",
        "채용 시 가장 중요한 요소는 무엇인가요?",
        "노사 관계에서 중요한 점은 무엇인가요?"
    ],
    "총무·법무·사무": [
        "법적 문제가 발생했을 때 어떻게 대처하나요?",
        "회사의 계약서를 작성할 때 중요한 사항은 무엇인가요?",
        "사무실 환경을 효율적으로 관리하는 방법은 무엇인가요?",
        "행정 업무에서 가장 많이 발생하는 오류는 무엇인가요?",
        "회사에서 발생할 수 있는 법적 리스크는 무엇인가요?"
    ],
    "IT개발·데이터": [
        "프로그래밍 언어를 선택할 때 어떤 요소를 고려하나요?",
        "대규모 데이터베이스를 관리할 때 가장 중요한 점은 무엇인가요?",
        "개발 중 버그를 어떻게 효율적으로 수정하나요?",
        "클라우드 서비스를 사용할 때의 장점과 단점은 무엇인가요?",
        "애플리케이션 보안을 강화하는 방법은 무엇인가요?"
    ],
    "디자인": [
        "디자인 작업에서 가장 중요한 요소는 무엇인가요?",
        "UX/UI 디자인에서 사용자의 경험을 고려하는 방법은 무엇인가요?",
        "디자인 도구로 주로 사용하는 프로그램은 무엇인가요?",
        "사용자 피드백을 디자인에 반영하는 방법은 무엇인가요?",
        "프로젝트의 디자인을 최적화하는 방법은 무엇인가요?"
    ],
    "영업·판매·무역": [
        "영업 목표를 설정할 때 고려하는 주요 요소는 무엇인가요?",
        "고객과의 신뢰를 구축하는 방법은 무엇인가요?",
        "판매 전략을 수립할 때 고려해야 할 주요 요소는 무엇인가요?",
        "무역 업무에서의 리스크 관리 방법은 무엇인가요?",
        "고객의 요구 사항을 파악하는 방법은 무엇인가요?"
    ],
    "고객상담·TM": [
        "고객의 불만을 처리할 때 가장 중요한 점은 무엇인가요?",
        "고객과의 효과적인 소통 방법은 무엇인가요?",
        "상담 시 가장 중요한 감정 관리 방법은 무엇인가요?",
        "고객 만족도를 측정하는 방법은 무엇인가요?",
        "효율적인 시간 관리를 위한 상담 전략은 무엇인가요?"
    ],
    "구매·자재·물류": [
        "구매 프로세스를 최적화하는 방법은 무엇인가요?",
        "자재 관리 시 중요한 점은 무엇인가요?",
        "효율적인 물류 시스템을 구축하는 방법은 무엇인가요?",
        "공급망 관리에서 발생할 수 있는 문제는 무엇인가요?",
        "물류 비용 절감을 위한 전략은 무엇인가요?"
    ],
    "상품기획·MD": [
        "상품 기획 시 가장 중요한 고려사항은 무엇인가요?",
        "MD 업무에서 중요한 데이터 분석 방법은 무엇인가요?",
        "소비자 트렌드를 파악하는 방법은 무엇인가요?",
        "효율적인 상품 라인업을 구성하는 방법은 무엇인가요?",
        "상품의 성공 여부를 평가하는 지표는 무엇인가요?"
    ],
    "운전·운송·배송": [
        "운전 업무에서 가장 중요한 안전 수칙은 무엇인가요?",
        "배송 효율성을 높이는 방법은 무엇인가요?",
        "운송 경로를 최적화하는 방법은 무엇인가요?",
        "배송 중 발생할 수 있는 문제를 어떻게 해결하나요?",
        "운전 중 스트레스를 관리하는 방법은 무엇인가요?"
    ],
    "서비스": [
        "서비스 품질을 향상시키는 방법은 무엇인가요?",
        "고객의 불만을 처리하는 방법은 무엇인가요?",
        "효율적인 서비스 제공을 위한 시스템은 무엇인가요?",
        "서비스 산업에서의 경쟁력을 높이는 방법은 무엇인가요?",
        "서비스 교육 프로그램을 어떻게 운영하나요?"
    ],
    "생산": [
        "생산 공정에서의 주요 효율성 개선 방법은 무엇인가요?",
        "품질 관리를 위한 중요 기준은 무엇인가요?",
        "생산 과정에서 발생할 수 있는 문제를 예방하는 방법은 무엇인가요?",
        "제조업에서의 리드 타임을 단축하는 방법은 무엇인가요?",
        "원자재 조달을 최적화하는 방법은 무엇인가요?"
    ],
    "건설·건축": [
        "건설 프로젝트에서 가장 중요한 관리 요소는 무엇인가요?",
        "건축 설계 시 고려해야 할 주요 사항은 무엇인가요?",
        "건설 현장에서 발생할 수 있는 리스크를 어떻게 관리하나요?",
        "건설 자재의 효율적인 관리 방법은 무엇인가요?",
        "건축물의 안전성을 확보하는 방법은 무엇인가요?"
    ],
    "의료": [
        "의료 현장에서 가장 중요한 윤리적 문제는 무엇인가요?",
        "환자 관리에서 가장 중요한 부분은 무엇인가요?",
        "의료 기기를 관리할 때 중요한 점은 무엇인가요?",
        "의료 현장의 안전 관리 방법은 무엇인가요?",
        "환자와의 의사소통에서 중요한 점은 무엇인가요?"
    ],
    "연구·R&D": [
        "R&D 프로젝트에서 가장 중요한 요소는 무엇인가요?",
        "기술 혁신을 이루기 위한 연구 전략은 무엇인가요?",
        "연구 결과를 어떻게 상용화하나요?",
        "연구에서 발생할 수 있는 윤리적 문제를 어떻게 해결하나요?",
        "효율적인 실험 설계를 위한 주요 요소는 무엇인가요?"
    ],
    "교육": [
        "효과적인 교육 프로그램을 설계하는 방법은 무엇인가요?",
        "학생의 학습 능력을 평가하는 방법은 무엇인가요?",
        "교육 현장에서 가장 중요한 관리 포인트는 무엇인가요?",
        "디지털 교육 도구의 활용 방안은 무엇인가요?",
        "교육의 효과를 어떻게 측정하나요?"
    ],
    "미디어·문화·스포츠": [
        "미디어 콘텐츠 기획 시 가장 중요한 요소는 무엇인가요?",
        "문화 산업의 트렌드를 파악하는 방법은 무엇인가요?",
        "스포츠 마케팅에서 가장 중요한 전략은 무엇인가요?",
        "미디어 산업에서 기술 발전이 미치는 영향은 무엇인가요?",
        "문화 프로그램의 성공을 평가하는 방법은 무엇인가요?"
    ],
    "금융·보험": [
        "금융 상품을 설계할 때 고려해야 할 요소는 무엇인가요?",
        "위험 관리에서 가장 중요한 전략은 무엇인가요?",
        "보험 상품의 판매 전략은 무엇인가요?",
        "금융 시장의 최신 동향을 어떻게 파악하나요?",
        "투자 분석 시 가장 중요한 지표는 무엇인가요?"
    ],
    "공공·복지": [
        "공공 정책 수립 시 가장 중요한 고려 사항은 무엇인가요?",
        "복지 서비스의 효과를 평가하는 방법은 무엇인가요?",
        "사회적 약자를 위한 정책을 어떻게 개선할 수 있나요?",
        "공공 부문에서의 예산 관리는 어떻게 이루어지나요?",
        "복지 사업의 성공적인 실행을 위한 전략은 무엇인가요?"
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
            const token = await user?.getIdToken(); // 현재 사용자의 토큰 가져오기
            const response = await fetch('/api/self-introduction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // 토큰을 Authorization 헤더에 추가
                },
                body: JSON.stringify({
                    title,
                    job_code: selectedValue,
                    data: answers.map((answer) => ({
                        question: answer.question,
                        answer: answer.answer
                    })),
                    uid: user?.uid
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create document');
            }

            router.push('/self-introduction/manage');
        } catch (error) {
            console.error('Error creating document:', error);
            // 에러 처리 로직 추가
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
            <div className="w-full max-w-4xl px-4 mt-8">
                {!isFormGenerated && (
                    <div className="flex flex-col items-center space-y-6 bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                        <h1 className="text-3xl font-bold text-gray-800 mb-6">
                            자기소개서 등록
                        </h1>
                        <Button
                            onClick={openModal}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 
                            transition-all duration-300 ease-in-out py-6 px-12 text-xl rounded-xl shadow-md hover:shadow-lg"
                        >
                            질문 선택하기
                        </Button>
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
                        <div className="space-y-4">
                            <Title level={3} className="text-gray-800 border-b border-gray-200 pb-3">
                                제목
                            </Title>
                            <Input
                                value={title}
                                onChange={handleTitleChange}
                                placeholder="제목을 입력하세요"
                                className="w-full p-3 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* 공통역량 질문 섹션 */}
                        <div className="space-y-6 mt-8">
                            <Title level={3} className="text-gray-800 border-b border-gray-200 pb-3">
                                공통역량 질문
                            </Title>
                            {answers.map((answer, index) => (
                                <Form.Item
                                    key={index}
                                    label={
                                        <Text strong className="text-lg text-gray-700">
                                            {answer.question}
                                        </Text>
                                    }
                                >
                                    <TextArea
                                        value={answer.answer}
                                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                                        rows={6}
                                        maxLength={550}
                                        showCount
                                        className="rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="여기에 내용을 입력하세요."
                                    />
                                </Form.Item>
                            ))}
                        </div>

                        {/* 직무관련 질문 섹션 */}
                        <div className="space-y-6 mt-8">
                            <Title level={3} className="text-gray-800 border-b border-gray-200 pb-3">
                                직무관련 질문
                            </Title>
                            <div className="flex gap-4">
                                <select
                                    className="w-1/3 p-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                                {selectedValue && (
                                    <select
                                        className="w-2/3 p-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={selectJobQ}
                                        onChange={handleSelectJobChange}
                                    >
                                        {selectedQuestions.map((question, index) => (
                                            <option key={index} value={question}>
                                                {question}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {selectJobQ && (
                                <TextArea
                                    value={jobAnswer}
                                    onChange={(e) => handleJobAnswerChange(e.target.value)}
                                    rows={6}
                                    maxLength={550}
                                    showCount
                                    className="mt-4 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="여기에 내용을 입력하세요."
                                />
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