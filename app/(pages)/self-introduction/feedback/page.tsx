'use client'
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Button, Input, Typography, Tabs, Card, Progress, Alert  } from 'antd';
import getCurrentUser from "@/lib/firebase/auth_state_listener";
import { User } from "firebase/auth";
import { LeftOutlined, 
  CodeOutlined, ProjectOutlined, DollarOutlined, TeamOutlined,
  FileTextOutlined, SketchOutlined, ShoppingOutlined,
  CustomerServiceOutlined, ShopOutlined, ShoppingCartOutlined, CarOutlined,
  CoffeeOutlined, ExperimentOutlined, BuildOutlined, MedicineBoxOutlined,
  ExperimentOutlined as ResearchIcon, ReadOutlined, PlaySquareOutlined,
  BankOutlined, SafetyOutlined, QuestionCircleOutlined, CheckCircleOutlined  
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
    feedback: string;
    similar_h2_tag: string;
    similar_question: string;
    similar_answer: string;
    similarity: number;
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

  const getColorByScore = (score: number) => {
    if (score <= 3) return '#ff4d4f';      // 빨간색 (1-3점)
    if (score <= 7) return '#ffa940';      // 주황색 (4-7점)
    return '#1890ff';                      // 파란색 (8-10점)
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
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }


  return (
    <div style={{ width: '100%', maxWidth: '1400px' }} className="mx-auto p-6">
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
              <Typography.Title level={2} className="mb-2 text-center">
                {document.title}
              </Typography.Title>
              <div className="flex items-center gap-4">
                <Typography.Text
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
                </Typography.Text>
                <Typography.Text type="secondary" className="text-sm">
                  최근 수정: {new Date(document.last_modified).toLocaleDateString()}{" "}
                  {new Date(document.last_modified).toLocaleTimeString()}
                </Typography.Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Feedback Button */}
      <div className="text-center mb-6">
        <Button
          type="primary"
          onClick={requestAIFeedback}
          loading={isLoading}
          size="large"
        >
          {isLoading ? "분석중..." : "AI 분석 요청"}
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
        className="flex transition-all duration-300 ease-in-out"
        style={{ gap: '24px' }}
      >
        {/* Left: Question and Answer */}
        <div 
          className="transition-all duration-300 ease-in-out"
          style={{ 
            width: feedbackData ? '45%' : '100%', 
            minWidth: '35%', 
            flexShrink: 0,
            position: 'sticky', // 고정 위치 설정
            top: '50px', // 뷰포트 상단에서 50px 떨어진 위치에 고정
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
              autoSize={{ minRows: 12, maxRows: 22 }}
              className="mb-4 text-base"
            />
            <Button 
              type="primary"
              onClick={handleUpdateDocument}  
            >
              수정하기
            </Button>
          </Card>
        </div>
        
        {/* Right: Feedback */}
        {feedbackData && (
          <div 
            className="transition-all duration-300 ease-in-out"
            style={{ 
              width: '60%', //너비 수정
              opacity: feedbackData ? 1 : 0,
              transform: feedbackData ? 'translateX(0)' : 'translateX(20px)'
            }}
          >
            <Card 
              title={
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '18px',
                  fontWeight: 600
                }}>
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                  <span>첨삭 결과</span>
                </div>
              } 
              className="h-full"
              headStyle={{ backgroundColor: '#eff6ff' }}
            >
              <div className="grid grid-cols-3 gap-4 mb-6">
                <Card size="small">
                  <div className="text-center">
                    <div className="text-black-500 mb-2" style={{ fontSize: '16px', fontWeight: 600 }}>관련성</div>
                    <Progress 
                      percent={feedbackData.results[parseInt(activeTab)].relevance * 10} 
                      showInfo={false}
                      strokeColor={getColorByScore(feedbackData.results[parseInt(activeTab)].relevance)}
                      trailColor="#f5f5f5"
                      strokeWidth={10}
                    />
                    <div className="text-lg font-bold mt-1">
                      {feedbackData.results[parseInt(activeTab)].relevance}/10점
                    </div>
                  </div>
                </Card>
                <Card size="small">
                  <div className="text-center">
                    <div className="text-black-500 mb-2" style={{ fontSize: '16px', fontWeight: 600 }}>구체성</div>
                    <Progress 
                      percent={feedbackData.results[parseInt(activeTab)].specificity * 10} 
                      showInfo={false}
                      strokeColor={getColorByScore(feedbackData.results[parseInt(activeTab)].specificity)}
                      trailColor="#f5f5f5"
                      strokeWidth={10}
                    />
                    <div className="text-lg font-bold mt-1">
                      {feedbackData.results[parseInt(activeTab)].specificity}/10점
                    </div>
                  </div>
                </Card>
                <Card size="small">
                  <div className="text-center">
                    <div className="text-black-500 mb-2" style={{ fontSize: '16px', fontWeight: 600 }}>설득력</div>
                    <Progress 
                      percent={feedbackData.results[parseInt(activeTab)].persuasiveness * 10} 
                      showInfo={false}
                      strokeColor={getColorByScore(feedbackData.results[parseInt(activeTab)].persuasiveness)}
                      trailColor="#f5f5f5"
                      strokeWidth={10}
                    />
                    <div className="text-lg font-bold mt-1">
                      {feedbackData.results[parseInt(activeTab)].persuasiveness}/10점
                    </div>
                  </div>
                </Card>
              </div>

                <div className="space-y-4">
                  <div>
                    <Typography.Title level={4}>상세 피드백</Typography.Title>
                    <Typography.Paragraph className="text-base">
                      {feedbackData.results[parseInt(activeTab)].feedback}
                    </Typography.Paragraph>
                  </div>

                  {/* 유사 매칭 결과 */}
                  <div className="mt-4 pt-4 border-t">
                    <Typography.Title level={4}>자기소개서 매칭 결과</Typography.Title>
                    
                    {feedbackData.results[parseInt(activeTab)].using_gpt ? (
                      <Alert
                        type="info"
                        message="자사 서버 문제로 유사도 측정이 일시적으로 불가능합니다."
                        showIcon
                      />
                    ) : (
                      feedbackData.results[parseInt(activeTab)].similarity > 0 ? (
                        <div className="space-y-4">
                          <Card size="small">
                            <div>
                              <div className="text-gray-600 font-semibold mb-1">합격한 회사</div>
                              <div className="text-lg">{feedbackData.results[parseInt(activeTab)].similar_h2_tag}</div>
                            </div>
                          </Card>

                          <Card size="small">
                            <div>
                              <div className="text-gray-600 font-semibold mb-1">유사한 문항</div>
                              <div className="text-lg">{feedbackData.results[parseInt(activeTab)].similar_question}</div>
                            </div>
                          </Card>

                          <Card size="small">
                            <div>
                              <div className="text-gray-600 font-semibold mb-1">유사한 답변</div>
                              <div className="text-lg" style={{ whiteSpace: 'pre-wrap' }}>
                                {feedbackData.results[parseInt(activeTab)].similar_answer}
                              </div>
                            </div>
                          </Card>

                          <Card size="small" className="bg-blue-50">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 font-semibold">유사도</span>
                              <span className="text-xl font-bold text-blue-600">
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
  );
}
