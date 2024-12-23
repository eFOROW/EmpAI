"use client";

import { useState, useEffect } from "react";
import { Modal, Button, message, Checkbox } from "antd";
import { User } from "firebase/auth";
import getCurrentUser from '@/lib/firebase/auth_state_listener';
import { useRouter } from 'next/navigation';

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

const ManagePage = () => {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]); // 선택된 질문
    const [isFormGenerated, setIsFormGenerated] = useState(false); // 질문 생성 여부
    const [messageApi, contextHolder] = message.useMessage();


    // 모달 열기/닫기 핸들러
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);


    useEffect(() => {
        getCurrentUser().then((user) => {
          if (!user) {
            // 유저가 null인 경우 '/'로 리다이렉트
            router.push('/');
          } else {
            setUser(user);
          }
        });
    }, [router]);

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
        const formattedData = {
        uid: user.uid,
        title: "자기소개서",  // 제목
        job_code: "IT",  // 직무 코드
        last_modified: new Date().toISOString(),  // 현재 날짜로 설정
        data: answers.map((item, index) => ({
            question: item.question,
            answer: item.answer,
        })),
        };
  
        try {
            const response = await fetch('/api/self-introduction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formattedData),
            });
        
            const result = await response.json();
            console.log('서버 응답:', result);
            router.push('/self-introduction/manage')
        } catch (error) {
            console.error('API 요청 오류:', error);
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
        <div
        className="flex flex-col items-center justify-start min-h-screen p-4"
        >
            <div
                style={{ visibility: isFormGenerated ? 'collapse' : 'visible' }}
            >
                {/* 질문 선택 */}
                <h1 className="text-2xl font-bold mb-4 text-left border-b border-gray-300 pb-2">
                    자기소개서 등록
                </h1>
                {/* 모달 열기 버튼 */}
                <Button
                    type="primary"
                    onClick={openModal}
                    className="bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 ease-in-out py-5 px-10 text-xl rounded-xl shadow-lg transform-none"
                >
                질문 선택
                </Button>
            </div>

            <Modal
                title={<span style={{ fontSize: '23px', fontWeight: 'bold' }}>질문 선택</span>} 
                open={isModalOpen}
                onCancel={closeModal}
                footer={[
                    <Button 
                        key="close"
                        disabled={selectedQuestions.length !== 3}
                        className={`mt-4 py-2 px-4 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            selectedQuestions.length === 3 ? "bg-blue-500 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
                        }`}
                        onClick={() => {
                            closeModal();
                            handleGenerateForm();
                        }}
                        style={{ width: '30%' }}
                    >생성</Button>,
                ]}
                centered
                width={700} // 원하는 너비 설정
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

            {/* 생성된 질문과 텍스트박스 */}
            {isFormGenerated && (
                <form className="z-10">
                    <h1 className="text-2xl font-bold mb-4 text-left border-b border-gray-300 pb-2">
                        자기소개서 작성
                    </h1>
                {answers.map((answer, index) => (
                    <div
                    key={index}
                    style={{
                        display: "flex",
                        flexDirection: "column", // 세로로 배치
                        marginBottom: "15px", // 아래 간격
                        marginTop: "35px", // 위 간격
                    }}
                    >
                    {/* 질문 레이블 */}
                    <label
                        style={{
                        marginBottom: "5px",
                        textAlign: "left", // 왼쪽 정렬
                        width: "600px", // textarea와 동일한 너비
                        wordWrap: "break-word", // 텍스트가 길면 줄 바꿈
                        }}
                    >
                        {answer.question}
                    </label>
                    
                    {/* 텍스트박스 */}
                    <textarea
                        value={answer.answer}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        rows={4}
                        style={{
                        height: "200px",
                        width: "800px", // 원하는 너비로 설정
                        marginTop: "5px", // 질문과 텍스트박스 간 간격
                        border: "1px solid black", // 검정 테두리
                        borderRadius: "5px", // 둥근 테두리 (선택 사항)
                        padding: "8px", // 내부 여백
                        display: "block", // 블록 레벨 요소로 설정
                        }}
                    />
                    <div className="text-sm text-gray-500 mt-2">
                        (공백포함) {answer.answer.length}자
                    </div>
                    </div>
                ))}

                <div
                    style={{
                    display: "flex", // 버튼을 한 줄에 배치
                    justifyContent: "center", // 버튼 중앙 정렬
                    gap: "10px", // 버튼 간 간격
                    marginTop: "20px", // 위쪽 간격
                    }}
                >
                    <button
                    type="button"
                    onClick={handleSubmit}
                    className="py-2 px-4 bg-blue-500 text-white rounded-lg"
                    >
                    제출
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsFormGenerated(false)}
                        className="py-2 px-4 bg-gray-500 text-white rounded-lg"
                    >
                    취소
                    </button>
                </div>
                </form>
            )}
        </div>
    );
};

export default ManagePage;