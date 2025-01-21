import React from 'react';
import { Typography, Input } from 'antd';
import { CodeOutlined, ProjectOutlined, DollarOutlined, TeamOutlined,
    FileTextOutlined, SketchOutlined, ShoppingOutlined,
    CustomerServiceOutlined, ShopOutlined, ShoppingCartOutlined, CarOutlined,
    CoffeeOutlined, ExperimentOutlined, BuildOutlined, MedicineBoxOutlined,
    ExperimentOutlined as ResearchIcon, ReadOutlined, PlaySquareOutlined,
    BankOutlined, SafetyOutlined, LeftOutlined, RightOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface JobStyle {
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    borderColor: string;
}

const jobStyles: { [key: string]: JobStyle } = {
    "기획·전략": { icon: <ProjectOutlined />, color: "#1890ff", bgColor: "#e6f7ff", borderColor: "#91d5ff" },
    "마케팅·홍보·조사": { icon: <ShoppingOutlined />, color: "#eb2f96", bgColor: "#fff0f6", borderColor: "#ffadd2" },
    "회계·세무·재무": { icon: <DollarOutlined />, color: "#52c41a", bgColor: "#f6ffed", borderColor: "#b7eb8f" },
    "인사·노무·HRD": { icon: <TeamOutlined />, color: "#722ed1", bgColor: "#f9f0ff", borderColor: "#d3adf7" },
    "총무·법무·사무": { icon: <FileTextOutlined />, color: "#13c2c2", bgColor: "#e6fffb", borderColor: "#87e8de" },
    "IT개발·데이터": { icon: <CodeOutlined />, color: "#2f54eb", bgColor: "#f0f5ff", borderColor: "#adc6ff" },
    "디자인": { icon: <SketchOutlined />, color: "#fa541c", bgColor: "#fff2e8", borderColor: "#ffbb96" },
    "영업·판매·무역": { icon: <ShoppingCartOutlined />, color: "#faad14", bgColor: "#fffbe6", borderColor: "#ffe58f" },
    "고객상담·TM": { icon: <CustomerServiceOutlined />, color: "#a0d911", bgColor: "#fcffe6", borderColor: "#eaff8f" },
    "구매·자재·물류": { icon: <ShopOutlined />, color: "#1890ff", bgColor: "#e6f7ff", borderColor: "#91d5ff" },
    "상품기획·MD": { icon: <ShoppingCartOutlined />, color: "#eb2f96", bgColor: "#fff0f6", borderColor: "#ffadd2" },
    "운전·운송·배송": { icon: <CarOutlined />, color: "#52c41a", bgColor: "#f6ffed", borderColor: "#b7eb8f" },
    "서비스": { icon: <CoffeeOutlined />, color: "#722ed1", bgColor: "#f9f0ff", borderColor: "#d3adf7" },
    "생산": { icon: <ExperimentOutlined />, color: "#13c2c2", bgColor: "#e6fffb", borderColor: "#87e8de" },
    "건설·건축": { icon: <BuildOutlined />, color: "#2f54eb", bgColor: "#f0f5ff", borderColor: "#adc6ff" },
    "의료": { icon: <MedicineBoxOutlined />, color: "#fa541c", bgColor: "#fff2e8", borderColor: "#ffbb96" },
    "연구·R&D": { icon: <ResearchIcon />, color: "#faad14", bgColor: "#fffbe6", borderColor: "#ffe58f" },
    "교육": { icon: <ReadOutlined />, color: "#a0d911", bgColor: "#fcffe6", borderColor: "#eaff8f" },
    "미디어·문화·스포츠": { icon: <PlaySquareOutlined />, color: "#1890ff", bgColor: "#e6f7ff", borderColor: "#91d5ff" },
    "금융·보험": { icon: <BankOutlined />, color: "#eb2f96", bgColor: "#fff0f6", borderColor: "#ffadd2" },
    "공공·복지": { icon: <SafetyOutlined />, color: "#52c41a", bgColor: "#f6ffed", borderColor: "#b7eb8f" }
  } as const;

interface Document {
    _id: string;
    title: string;
    job_code: string;
    last_modified: Date;
    data: {
        question: string;
        answer: string;
    }[];
}

interface SidebarListProps {
    loading: boolean;
    error: string | null;
    documents: Document[];
    expandedDocId: string | null;
    toggleDocument: (docId: string) => void;
    isPanelOpen: boolean;
    setIsPanelOpen: (isOpen: boolean) => void;
}

const SidebarList: React.FC<SidebarListProps> = ({
    loading,
    error,
    documents,
    expandedDocId,
    toggleDocument,
    isPanelOpen,
    setIsPanelOpen
}) => {
    return (
        <div className="relative h-full">
            <div
                className={`fixed top-[50vh] -translate-y-1/2 left-2 h-[80vh] bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] border border-gray-200 rounded-xl shadow-xl transition-all duration-300 ease-in-out overflow-hidden ${
                    isPanelOpen ? 'translate-x-0' : '-translate-x-[100%]'
                }`}
                style={{ 
                    width: 'calc(37vw - 32px)', 
                    minWidth: '280px',
                    transformStyle: 'preserve-3d',
                    perspective: '1000px'
                }}
            >
                <div 
                    className="h-full overflow-auto custom-scrollbar"
                    style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#d9d9d9 transparent'
                    }}
                >
                    <style jsx global>{`
                        .custom-scrollbar::-webkit-scrollbar {
                            width: 6px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-track {
                            background: transparent;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb {
                            background-color: #d9d9d9;
                            border-radius: 3px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                            background-color: #bfbfbf;
                        }
                    `}</style>
                    <div className="p-4">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                                내 자기소개서
                            </h2>
                        </div>
                        {loading ? (
                            <div className="text-center py-4">로딩 중...</div>
                        ) : error ? (
                            <div className="text-center text-red-500 py-4">{error}</div>
                        ) : documents.length === 0 ? (
                            <div className="text-center text-gray-500 py-4">작성된 자기소개서가 없습니다.</div>
                        ) : (
                            <div className="space-y-4">
                                {documents.map((document) => (
                                    <div key={document._id}>
                                        <div
                                            className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                                            onClick={() => toggleDocument(document._id)}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Text
                                                    className="text-xs px-2 py-1 rounded flex items-center gap-2 whitespace-nowrap"
                                                    style={{
                                                        color: jobStyles[document.job_code]?.color ?? "#666",
                                                        backgroundColor: jobStyles[document.job_code]?.bgColor ?? "#f5f5f5",
                                                        border: `1px solid ${jobStyles[document.job_code]?.borderColor ?? "#d9d9d9"}`,
                                                        width: 'fit-content',
                                                        display: 'inline-flex'
                                                    }}
                                                >
                                                    {jobStyles[document.job_code]?.icon ?? null}
                                                    {document.job_code}
                                                </Text>
                                            </div>
                                            <h3 className="text-sm font-medium text-gray-800 mb-1">
                                                {document.title.length > 20 ? `${document.title.substring(0, 20)}...` : document.title}
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                {document.last_modified.toLocaleDateString()}
                                            </p>
                                        </div>
                                        {expandedDocId === document._id && (
                                            <div className="mt-2 p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100">
                                                <div className="space-y-8">
                                                    <div className="space-y-6 bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-sm border border-gray-200">
                                                        <div className="flex items-center space-x-2 pb-3 border-b border-gray-200">
                                                            <Title level={3} className="text-xl text-gray-900 font-semibold">
                                                                공통역량 질문
                                                            </Title>
                                                        </div>
                                                        {document.data.slice(0, -1).map((item, index) => (
                                                            <div key={index} className="space-y-2">
                                                                <div className="flex items-center space-x-2">
                                                                    <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                                                                        <span className="text-gray-600 font-bold">Q</span>
                                                                    </div>
                                                                    <Text strong className="text-base text-gray-800">
                                                                        {item.question}
                                                                    </Text>
                                                                </div>
                                                                <TextArea
                                                                    value={item.answer}
                                                                    readOnly
                                                                    autoSize={{ minRows: 3, maxRows: 15 }}
                                                                    className="custom-textarea"
                                                                    style={{
                                                                        background: 'white',
                                                                        color: '#000000',
                                                                        border: '1px solid #d9d9d9',
                                                                        borderRadius: '4px',
                                                                        padding: '8px 12px',
                                                                        fontSize: '14px',
                                                                        lineHeight: '1.5',
                                                                        width: '100%'
                                                                    }}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="space-y-6 bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-sm border border-gray-200">
                                                        <div className="flex items-center space-x-2 pb-3 border-b border-gray-200">
                                                            <Title level={3} className="text-xl text-gray-900 font-semibold">
                                                                직무관련 질문
                                                            </Title>
                                                        </div>
                                                        {document.data.slice(-1).map((item, index) => (
                                                            <div key={index} className="space-y-2">
                                                                <div className="flex items-center space-x-2">
                                                                    <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                                                                        <span className="text-gray-600 font-bold">Q</span>
                                                                    </div>
                                                                    <Text strong className="text-base text-gray-800">
                                                                        {item.question}
                                                                    </Text>
                                                                </div>
                                                                <TextArea
                                                                    value={item.answer}
                                                                    readOnly
                                                                    autoSize={{ minRows: 3, maxRows: 15 }}
                                                                    className="custom-textarea"
                                                                    style={{
                                                                        background: 'white',
                                                                        color: '#000000',
                                                                        border: '1px solid #d9d9d9',
                                                                        borderRadius: '4px',
                                                                        padding: '8px 12px',
                                                                        fontSize: '14px',
                                                                        lineHeight: '1.5',
                                                                        width: '100%'
                                                                    }}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <button
                onClick={() => setIsPanelOpen(!isPanelOpen)}
                className={`fixed top-[50vh] -translate-y-1/2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-2 rounded-r-lg shadow-md transition-all duration-300 flex items-center justify-center ${
                    isPanelOpen ? 'hover:translate-x-1' : 'hover:-translate-x-1'
                }`}
                style={{
                    left: isPanelOpen ? 'calc(37.3vw - 32px)' : '0',
                    zIndex: 50,
                    width: '32px',
                    height: '40px',
                }}
            >
                {isPanelOpen ? <LeftOutlined /> : <RightOutlined />}
            </button>
        </div>
    );
};

export default SidebarList;