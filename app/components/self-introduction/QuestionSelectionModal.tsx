import React from 'react';
import { Modal, Button, Checkbox, message } from 'antd';

interface QuestionSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedQuestions: string[];
    setSelectedQuestions: (questions: string[]) => void;
    onQuestionsConfirmed: (questions: string[]) => void;
}

const commonQuestions = [
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
    "한정된 시간 내에 중요한 결정을 내려야 했던 경험이 있나요? 그 결정을 내리기 위한 과정과 결과에 대해 설명해주세요."
];

const customQuestions: string[] = [
    "자유형식",
];

const QuestionSelectionModal: React.FC<QuestionSelectionModalProps> = ({
    isOpen,
    onClose,
    selectedQuestions,
    setSelectedQuestions,
    onQuestionsConfirmed
}) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [activeTab, setActiveTab] = React.useState<'common' | 'custom'>('common');
    const [newQuestion, setNewQuestion] = React.useState('');

    const handleAddQuestion = () => {
        if (newQuestion.trim()) {
            customQuestions.push(newQuestion.trim());
            setNewQuestion('');
        }
    };

    const handleCheckboxChange = (values: string[]) => {
        // 현재 선택된 질문들과 새로 선택된 질문들을 합치기
        const currentSelected = selectedQuestions.filter(q => 
            (activeTab === 'common' ? customQuestions : commonQuestions).includes(q)
        );
        const newSelected = Array.from(new Set([...currentSelected, ...values]));
        
        if (newSelected.length <= 5) {
            setSelectedQuestions(newSelected);
        } else {
            warning();
        }
    };

    const warning = () => {
        messageApi.open({
            type: 'warning',
            content: '총 2~5개까지 선택 가능합니다.',
            duration: 2,
        });
    };

    const handleConfirm = () => {
        if (selectedQuestions.length >= 2 && selectedQuestions.length <= 6) {
            onQuestionsConfirmed(selectedQuestions);
            onClose();
        } else {
            messageApi.warning('2~5개의 질문을 선택해주세요.');
        }
    };

    return (
        <Modal
            title="공통역량질문 선택"
            open={isOpen}
            onCancel={onClose}
            footer={[
                <div key="footer" className="flex justify-end items-center px-4 py-3">
                    <div className="flex gap-2">
                        <span className="text-sm text-gray-600 flex items-center">
                            {selectedQuestions.length}개 선택
                        </span>
                        <Button
                            type="primary"
                            disabled={selectedQuestions.length < 2 || selectedQuestions.length > 6}
                            className="bg-blue-500"
                            onClick={handleConfirm}
                        >
                            작성하기
                        </Button>
                    </div>
                </div>
            ]}
            centered
            width={1000}
            className="rounded-xl [&_.ant-modal-content]:px-0 [&_.ant-modal-header]:pl-6 [&_.ant-modal-title]:text-lg [&_.ant-modal-title]:font-bold"
        >
            {contextHolder}
            <div className="flex" style={{ height: '500px' }}>
                {/* 좌측 메뉴 */}
                <div className="w-48 border-r pr-4 pt-[4%]">
                    <div 
                        className={`p-3 cursor-pointer mb-2 relative ${
                            activeTab === 'common' ? 'text-blue-600' : 'text-gray-500'
                        }`}
                        onClick={() => setActiveTab('common')}
                    >
                        {activeTab === 'common' && (
                            <div className="absolute left-0 top-0 w-1 h-full bg-[#3B5FE0]" />
                        )}
                        <div className="text-base font-bold">기업 기출 질문</div>
                    </div>
                    <div 
                        className={`p-3 cursor-pointer relative ${
                            activeTab === 'custom' ? 'text-blue-600' : 'text-gray-500'
                        }`}
                        onClick={() => setActiveTab('custom')}
                    >
                        {activeTab === 'custom' && (
                            <div className="absolute left-0 top-0 w-1 h-full bg-[#3B5FE0]" />
                        )}
                        <div className="text-base font-bold">내가 만든 질문</div>
                    </div>
                </div>

                {/* 우측 질문 목록 */}
                <div className="flex-1 pl-4 overflow-y-auto bg-gray-50 p-4 rounded-lg">
                    {activeTab === 'custom' && (
                        <div className="mb-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newQuestion}
                                    onChange={(e) => setNewQuestion(e.target.value)}
                                    placeholder="추가하고 싶은 질문을 입력해주세요."
                                    className="flex-1 p-1.5 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
                                />
                                <Button
                                    onClick={handleAddQuestion}
                                    className="bg-gray-100 hover:bg-gray-200"
                                >
                                    등록하기
                                </Button>
                            </div>
                        </div>
                    )}
                    
                    <div className="text-sm text-gray-500 mb-2">
                        {activeTab === 'common' ? `${commonQuestions.length}개의 질문` : `${customQuestions.length}개의 질문`}
                    </div>
                    
                    <Checkbox.Group
                        value={selectedQuestions.filter(q => 
                            (activeTab === 'common' ? commonQuestions : customQuestions).includes(q)
                        )}
                        onChange={handleCheckboxChange}
                    >
                        <div className="flex flex-col gap-2">
                            {(activeTab === 'common' ? commonQuestions : customQuestions).map((question, index) => (
                                <Checkbox
                                    key={`${activeTab}-${index}`}
                                    value={question}
                                    className="w-full [&>span:first-child]:hidden"
                                >
                                    <div className={`w-full p-4 rounded-lg ${
                                        selectedQuestions.includes(question) 
                                        ? 'bg-[#3B5FE0] text-white' 
                                        : 'bg-white hover:bg-gray-100'
                                    } flex items-center gap-2 cursor-pointer shadow-sm`}>
                                        {selectedQuestions.includes(question) && (
                                            <span className="text-white">✓</span>
                                        )}
                                        {question}
                                    </div>
                                </Checkbox>
                            ))}
                        </div>
                    </Checkbox.Group>
                </div>
            </div>
        </Modal>
    );
};

export default QuestionSelectionModal; 