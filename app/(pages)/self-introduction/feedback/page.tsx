'use client'
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Button, Input, Typography, Tabs, Card, Progress, Alert, Spin } from 'antd';
import getCurrentUser from "@/lib/firebase/auth_state_listener";
import { User } from "firebase/auth";
import { LeftOutlined, 
  CodeOutlined, ProjectOutlined, DollarOutlined, TeamOutlined,
  FileTextOutlined, SketchOutlined, ShoppingOutlined,
  CustomerServiceOutlined, ShopOutlined, ShoppingCartOutlined, CarOutlined,
  CoffeeOutlined, ExperimentOutlined, BuildOutlined, MedicineBoxOutlined,
  ExperimentOutlined as ResearchIcon, ReadOutlined, PlaySquareOutlined,
  BankOutlined, SafetyOutlined, QuestionCircleOutlined, CheckCircleOutlined,LoadingOutlined,RobotOutlined,LinkOutlined, SearchOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;

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

// jobStyles 타입 정의
interface JobStyle {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface AIResponse {
  results: {
    relevance: number;
    specificity: number;
    persuasiveness: number;
    relevance평가: string;
    specificity평가: string;
    persuasiveness평가: string;
    similar_h2_tag: string;
    similar_question: string;
    similar_answer: string;
    similarity: number;
    reference_analysis: string;
    using_gpt?: boolean;
  }[];
}

// jobStyles 객체 정의
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

export default function FeedbackPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('0');
  const [id, setId] = useState<string | null>(null);
  const [document, setDocument] = useState<Document | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [feedbackData, setFeedbackData] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestAIFeedback = async () => {
    if (!document?._id || !user) return;
    
    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      
      // 메인 AI 서버 시도
      const response = await fetch('/api/self-introduction/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ _id: document._id })
      });
  
      if (response.ok) {
        const data = await response.json();
        setFeedbackData(data);
        return;
      }
  
      // 메인 서버 실패시 GPT로 시도
      const response_gpt = await fetch('/api/self-introduction/feedback_gpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ _id: document._id })
      });
  
      if (!response_gpt.ok) {
        throw new Error('Both AI services failed');
      }
  
      const data = await response_gpt.json();
      setFeedbackData(data);
  
    } catch (error) {
      console.error('Error:', error);
      alert('AI 분석 요청에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCurrentUser().then((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        router.push('/mypage');
        return;
      }
    });
  }, [router]);

  const handleUpdateDocument = async () => {
    if (!document?._id || !user) return;
    
    if (!document.data[parseInt(activeTab)].answer.trim()) {
      alert('답변을 입력해주세요.');
      return;
    }
    
    try {
      const token = await user.getIdToken();
      const updateData = {
        _id: document._id,
        title: document.title,
        job_code: document.job_code,
        last_modified: new Date(),
        data: document.data,
        uid: user.uid
      };
  
      const response = await fetch("/api/self-introduction", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
  
      if (response.ok) {
        alert('성공적으로 수정되었습니다.');
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData);
        alert('수정 요청에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('서버 연결에 실패했습니다.');
    }
  };


  const fetchData = useCallback(async (_id: string) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const API_URL = `/api/self-introduction?_id=${_id}`;
      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data: Document = await response.json();
        setDocument(data);
      } else {
        console.error('Failed to fetch document:', response.statusText);
        if (response.status === 401) {
          router.push('/mypage');
        } else {
          // 파라미터는 있지만 정상적으로 값을 받지 못한 경우
          router.push('/self-introduction/manage');
        }
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      // 에러 발생 시 리다이렉션
      router.push('/self-introduction/manage');
    }
  }, [user, router]);

  useEffect(() => {
    if (!user) return;

    const urlParams = new URLSearchParams(window.location.search);
    const _id = urlParams.get('_id');

    if (_id) {
      setId(_id);
      fetchData(_id);
    } else {
      router.push('/self-introduction');
    }
  }, [router, user, fetchData]);

  if (!user || !id || !document) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
        <div className="flex justify-center items-center min-h-screen">
      <Spin size="large" />
    </div>
        </div>
      </div>
    );
  }

  const getProgressColor = (score: number): string => {
    if (score <= 20) return '#DC2626'; // 빨간색
    if (score <= 40) return '#F97316'; // 주황색
    if (score <= 60) return '#FFD700'; // 초록색
    if (score <= 75) return '#22C55E'; // 초록색
    return '#3B82F6'; // 파란색
  };

  return (
    <div className='bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen'>
      <div style={{ width: '70%', paddingBottom: '2rem' }} className="mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start">
            <Button
              onClick={() => router.back()}
              icon={<LeftOutlined />}
              type="text"
              className="mr-4 hover:bg-gray-100 rounded-full h-10 w-10 flex items-center justify-center"
            />
            <div className="w-full flex justify-center">
              <div>
                <Typography.Title level={2} className="mb-3 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  {document.title}
                </Typography.Title>
                <div className="flex items-center gap-4 justify-center">
                  <Typography.Text
                    className="text-sm px-4 py-2 rounded-full flex items-center gap-2 whitespace-nowrap shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-105"
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
                  </Typography.Text>
                  <Typography.Text type="secondary" className="text-sm bg-white/70 px-4 py-2 rounded-full shadow-sm backdrop-blur-sm">
                    최근 수정: {new Date(document.last_modified).toLocaleDateString()}{" "}
                    {new Date(document.last_modified).toLocaleTimeString()}
                  </Typography.Text>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <Button
            type="primary"
            onClick={requestAIFeedback}
            loading={isLoading}
            size="large"
            className="h-14 px-10 rounded-full shadow-lg hover:scale-105 transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #4F46E5 100%)',
              border: 'none',
              fontSize: '17px',
              fontWeight: '600'
            }}
          >
            {isLoading ? (
              <span className="flex items-center gap-3">
                분석중...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <RobotOutlined style={{ fontSize: '20px' }} /> AI 분석 요청
              </span>
            )}
          </Button>
        </div>

        {/* Main Content */}
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          type="card"
          className="mb-6"
          style={{
            padding: '10px 10px 0',
            borderRadius: '8px'
          }}
          tabBarStyle={{
            margin: 0,
            background: 'transparent'
          }}
        >
          {document.data.map((item, index) => (
            <TabPane 
              tab={
                <div style={{ 
                  padding: '4px 16px',
                  fontWeight: activeTab === index.toString() ? '600' : '400',
                  fontSize: '16px',
                  transition: 'all 0.3s',
                  borderBottom: activeTab === index.toString() ? '2px solid #1890ff' : 'none'
                }}>
                  Q{index + 1}
                </div>
              }
              key={index.toString()}
            />
          ))}
        </Tabs>

        <div 
          className="flex transition-all duration-300 ease-in-out pb-8"
          style={{ gap: '24px' }}
        >
          {/* Left: Question and Answer */}
          <div 
            className="transition-all duration-300 ease-in-out"
            style={{ 
              width: feedbackData ? '45%' : '100%', 
              minWidth: '35%', 
              flexShrink: 0,
              position: 'sticky',
              top: '50px',
              alignSelf: 'start', // 높이 설정이 있을 경우 정렬 보정
            }}
          >
            <Card 
              title={
                <div style={{
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '18px',
                  fontWeight: 600
                }}>
                  <QuestionCircleOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                  {document.data[parseInt(activeTab)].question}
                </div>
              } 
              className="h-full"
              headStyle={{ backgroundColor: '#eff6ff' }}  
            >
              <Input.TextArea
                value={document.data[parseInt(activeTab)].answer}
                onChange={(e) => {
                  const newData = [...document.data];
                  newData[parseInt(activeTab)].answer = e.target.value;
                  setDocument({
                    ...document,
                    data: newData
                  });
                }}
                autoSize={{ minRows: 12, maxRows: 12 }}
                className="mb-4 text-base"
              />
              <div className="flex justify-center">
                <Button 
                  type="primary"
                  onClick={handleUpdateDocument}
                  className="h-12 px-10 rounded-xl hover:scale-105 transition-all duration-200 shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #4F46E5 100%)',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  수정하기
                </Button>
              </div>
            </Card>
          </div>
          
          {/* 오른쪽 패널: 피드백 */}
          {feedbackData && (
            <div 
              className="transition-all duration-500 ease-in-out"
              style={{ 
                width: '60%',
                opacity: feedbackData ? 1 : 0,
                transform: feedbackData ? 'translateX(0)' : 'translateX(20px)'
              }}
            >
              <Card 
                title={
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '18px',
                    fontWeight: 600
                  }}>
                    <CheckCircleOutlined style={{ color: '#10B981', fontSize: '20px' }} />
                    <span>첨삭 결과</span>
                  </div>
                } 
                className="shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm bg-white/90"
                style={{ borderRadius: '20px' }}
                headStyle={{ 
                  backgroundColor: 'rgba(239, 246, 255, 0.8)',
                  borderTopLeftRadius: '20px',
                  borderTopRightRadius: '20px',
                  borderBottom: '1px solid rgba(219, 234, 254, 0.5)'
                }}
              >
                <div className="flex justify-end gap-3 mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full shadow-sm bg-[#DC2626]" />
                  <span className="text-xs text-gray-500">미흡</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full shadow-sm bg-[#F97316]" />
                  <span className="text-xs text-gray-500">부족</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full shadow-sm bg-[#FFD700]" />
                  <span className="text-xs text-gray-500">보통</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full shadow-sm bg-[#22C55E]" />
                  <span className="text-xs text-gray-500">우수</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full shadow-sm bg-[#3B82F6]" />
                  <span className="text-xs text-gray-500">탁월</span>
                </div>
              </div>
                <div className="grid grid-cols-3 gap-6 mb-8">
                  {[
                    { title: '관련성', score: feedbackData.results[parseInt(activeTab)].relevance },
                    { title: '구체성', score: feedbackData.results[parseInt(activeTab)].specificity },
                    { title: '설득력', score: feedbackData.results[parseInt(activeTab)].persuasiveness }
                  ].map((item, index) => (
                    <Card 
                      key={index}
                      size="small"
                      className="transition-all duration-300 bg-white"
                      style={{ borderRadius: '16px' }}
                    >
                      <div className="text-center p-2">
                        <div className="text-gray-700 mb-3 font-semibold text-lg">{item.title}</div>
                        <div className="text-2xl font-bold mt-2" style={{ color: getProgressColor(item.score) }}>
                          {item.score}점
                        </div>
                        <Progress 
                          percent={item.score} 
                          showInfo={false}
                          strokeColor={getProgressColor(item.score)}
                          trailColor="#f0f0f0"
                          strokeWidth={10}
                          className="mb-2"
                        />
                      </div>
                    </Card>
                  ))}
                </div>

                {/* 상세 피드백 섹션 */}
                <div className="space-y-8">
                <div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileTextOutlined className="text-indigo-600" />
                    상세 피드백
                  </h4>
                  <div className="space-y-4">
                    {/* 관련성 피드백 */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-start gap-3 mb-3">
                        <TeamOutlined className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">관련성 평가</h5>
                          <p className="text-gray-600 leading-relaxed">
                            {feedbackData.results[parseInt(activeTab)].relevance평가}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 구체성 피드백 */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-start gap-3 mb-3">
                        <CheckCircleOutlined className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">구체성 평가</h5>
                          <p className="text-gray-600 leading-relaxed">
                            {feedbackData.results[parseInt(activeTab)].specificity평가}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 설득력 피드백 */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-start gap-3 mb-3">
                        <BuildOutlined className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">설득력 평가</h5>
                          <p className="text-gray-600 leading-relaxed">
                            {feedbackData.results[parseInt(activeTab)].persuasiveness평가}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
      

                  {/* 매칭 결과 섹션 */}
                  <div className="border-t pt-8">
                  <Typography.Title level={4} className="text-gray-800 mb-4 flex items-center gap-2">
                    <LinkOutlined style={{ color: '#4F46E5' }} />
                    자기소개서 매칭 결과
                  </Typography.Title>
                  
                  {feedbackData.results[parseInt(activeTab)].reference_analysis && (
                    <div className="mb-8">
                      <Card 
                        size="small"
                        className="hover:shadow-md transition-all duration-300 bg-indigo-50/70"
                        style={{ borderRadius: '12px' }}
                      >
                        <div>
                          <div className="text-gray-500 font-medium mb-2 flex items-center gap-2">
                            <SearchOutlined className="text-indigo-600" />
                            참고할점
                          </div>
                          <div 
                            className="text-gray-800 prose prose-sm max-w-none"
                            style={{ whiteSpace: 'pre-wrap' }}
                          >
                            {feedbackData.results[parseInt(activeTab)].reference_analysis}
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}
                  
                  {feedbackData.results[parseInt(activeTab)].using_gpt ? (
                    <Alert
                      type="info"
                      message="자사 서버 문제로 유사도 측정이 일시적으로 불가능합니다."
                      showIcon
                      className="rounded-xl shadow-sm"
                    />
                  ) : (
                    feedbackData.results[parseInt(activeTab)].similarity > 0 ? (
                      <div className="space-y-4">
                        {[
                          { title: '합격한 회사', content: feedbackData.results[parseInt(activeTab)].similar_h2_tag },
                          { title: '유사한 문항', content: feedbackData.results[parseInt(activeTab)].similar_question },
                          { title: '유사한 답변', content: feedbackData.results[parseInt(activeTab)].similar_answer }
                        ].map((item, index) => (
                          <Card 
                            key={index}
                            size="small"
                            className="hover:shadow-md transition-all duration-300 bg-gray-50/70"
                            style={{ borderRadius: '12px' }}
                          >
                            <div>
                              <div className="text-gray-500 font-medium mb-2">{item.title}</div>
                              <div className="text-gray-800" style={{ whiteSpace: 'pre-wrap' }}>
                                {item.content}
                              </div>
                            </div>
                          </Card>
                        ))}

                        <Card 
                          size="small" 
                          className="hover:shadow-md transition-all duration-300"
                          style={{ 
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #DBEAFE 0%, #E0E7FF 100%)'
                          }}
                        >
                          <div className="flex items-center justify-between p-2">
                            <span className="text-gray-700 font-medium">유사도</span>
                            <span className="text-2xl font-bold text-blue-600">
                              {feedbackData.results[parseInt(activeTab)].similarity.toFixed(1)}%
                            </span>
                          </div>
                        </Card>
                      </div>
                    ) : (
                      <Alert
                        type="info"
                        message="유사한 자기소개서가 없습니다."
                        showIcon
                        className="rounded-xl shadow-sm"
                      />
                    )
                  )}
                </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}