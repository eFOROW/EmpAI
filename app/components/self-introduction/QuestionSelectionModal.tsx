import React from 'react';
import { Modal, Button, message } from 'antd';
import { FolderOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons';
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
            if (customQuestions.includes(newQuestion.trim())) {
                messageApi.warning('이미 존재하는 질문입니다.');
                return;
            }
            customQuestions.push(newQuestion.trim());
            setNewQuestion('');
            messageApi.success('질문이 추가되었습니다.');
        }
    };

    const handleQuestionSelect = (question: string) => {
        const updatedSelection = selectedQuestions.includes(question)
            ? selectedQuestions.filter(q => q !== question)
            : [...selectedQuestions, question];

        if (updatedSelection.length <= 5) {
            setSelectedQuestions(updatedSelection);
        } else {
            messageApi.warning('최대 5개까지 선택 가능합니다.');
        }
    };

    const handleConfirm = () => {
        if (selectedQuestions.length >= 2 && selectedQuestions.length <= 5) {
            onQuestionsConfirmed(selectedQuestions);
            onClose();
        } else {
            messageApi.warning('2~5개의 질문을 선택해주세요.');
        }
    };

    return (
        <Modal
            title={
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-gray-800">
                            공통역량질문 선택
                        </h2>
                        <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-full">
                            {selectedQuestions.length}/5
                        </span>
                    </div>
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={1000}
            centered
            className="rounded-lg"
        >
            {contextHolder}
            <div className="flex h-[500px]">
                {/* 좌측 탭 메뉴 */}
                <div className="w-48 border-r border-gray-100">
                    <div 
                        onClick={() => setActiveTab('common')}
                        className={`flex items-center gap-3 p-4 cursor-pointer transition-all
                            ${activeTab === 'common' 
                                ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-500' 
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <FolderOutlined />
                        <div>
                            <div className="font-medium">기업 기출 질문</div>
                            <div className="text-xs text-gray-500">{commonQuestions.length}개의 질문</div>
                        </div>
                    </div>

                    <div 
                        onClick={() => setActiveTab('custom')}
                        className={`flex items-center gap-3 p-4 cursor-pointer transition-all
                            ${activeTab === 'custom' 
                                ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-500' 
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <EditOutlined />
                        <div>
                            <div className="font-medium">내가 만든 질문</div>
                            <div className="text-xs text-gray-500">{customQuestions.length}개의 질문</div>
                        </div>
                    </div>
                </div>

                {/* 우측 컨텐츠 */}
                <div className="flex-1 p-6">
                    {activeTab === 'custom' && (
                        <div className="mb-4 flex gap-2">
                            <input
                                type="text"
                                value={newQuestion}
                                onChange={(e) => setNewQuestion(e.target.value)}
                                placeholder="추가하고 싶은 질문을 입력해주세요"
                                className="flex-1 px-4 py-2 text-gray-700 border border-gray-200 rounded-lg 
                                         focus:outline-none focus:border-blue-500"
                            />
                            <Button
                                onClick={handleAddQuestion}
                                type="default"
                                className="px-4"
                            >
                                등록하기
                            </Button>
                        </div>
                    )}

                    <div className="space-y-2 overflow-y-auto h-[90%]">
                        {(activeTab === 'common' ? commonQuestions : customQuestions).map((question, index) => (
                            <div
                                key={index}
                                onClick={() => handleQuestionSelect(question)}
                                className={`w-[95%] p-4 rounded-lg transition-all flex items-center gap-3
                                    ${selectedQuestions.includes(question)
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-50 hover:bg-gray-100'
                                    }`}
                            >
                                <span className="flex-shrink-0">
                                    {selectedQuestions.includes(question) && <CheckOutlined />}
                                </span>
                                <span className="text-sm">{question}</span>
                            </div>
                        ))}
                    </div>

                    {/* 하단 버튼 */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                                {selectedQuestions.length}개 선택됨
                            </span>
                            <Button
                                type="primary"
                                onClick={handleConfirm}
                                disabled={selectedQuestions.length < 2 || selectedQuestions.length > 5}
                                className="px-8 h-10 bg-blue-500 hover:bg-blue-600 text-white"
                            >
                                작성하기
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default QuestionSelectionModal;