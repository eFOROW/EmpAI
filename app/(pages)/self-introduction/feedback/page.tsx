'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Button, Input, Typography } from 'antd';
import { LeftOutlined, 
  CodeOutlined, ProjectOutlined, DollarOutlined, TeamOutlined,
  FileTextOutlined, SketchOutlined, ShoppingOutlined,
  CustomerServiceOutlined, ShopOutlined, ShoppingCartOutlined, CarOutlined,
  CoffeeOutlined, ExperimentOutlined, BuildOutlined, MedicineBoxOutlined,
  ExperimentOutlined as ResearchIcon, ReadOutlined, PlaySquareOutlined,
  BankOutlined, SafetyOutlined
} from '@ant-design/icons';
import getCurrentUser from "@/lib/firebase/auth_state_listener";
import { User } from "firebase/auth";

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

const response = {
  "result": [
      {
          "relevance": 8,
          "specificity": 5,
          "persuasiveness": 6,
          "feedback": "자기소개는 질문의 핵심을 잘 이해하고 IT와 마케팅 분야 경험과 직무 내용을 설명하는데 효율적입니다. 하지만 구체적인 사례나 실제 경험보다는 일반적인 표현이 많아 특정 기회에 대한 강력한 영향을 줄 수 있는 방안을 제시하지 못합니다.",
          "Pass_question": "문장 구조와 문법적 정확성은 매우 우수하며 맞춤법 오류 없음.",
          "Pass_answer": ""
      },
      {
          "relevance": 8,
          "specificity": 5,
          "persuasiveness": 6,
          "feedback": "자기소개는 질문의 핵심을 잘 이해하고 IT와 마케팅 분야 경험과 직무 내용을 설명하는데 효율적입니다. 하지만 구체적인 사례나 실제 경험보다는 일반적인 표현이 많아 특정 기회에 대한 강력한 영향을 줄 수 있는 방안을 제시하지 못합니다.",
          "Pass_question": "문장 구조와 문법적 정확성은 매우 우수하며 맞춤법 오류 없음.",
          "Pass_answer": ""
      },
      {
          "relevance": 8,
          "specificity": 5,
          "persuasiveness": 6,
          "feedback": "자기소개는 질문의 핵심을 잘 이해하고 IT와 마케팅 분야 경험과 직무 내용을 설명하는데 효율적입니다. 하지만 구체적인 사례나 실제 경험보다는 일반적인 표현이 많아 특정 기회에 대한 강력한 영향을 줄 수 있는 방안을 제시하지 못합니다.",
          "Pass_question": "문장 구조와 문법적 정확성은 매우 우수하며 맞춤법 오류 없음.",
          "Pass_answer": ""
      },
      {
          "relevance": 8,
          "specificity": 5,
          "persuasiveness": 6,
          "feedback": "자기소개는 질문의 핵심을 잘 이해하고 IT와 마케팅 분야 경험과 직무 내용을 설명하는데 효율적입니다. 하지만 구체적인 사례나 실제 경험보다는 일반적인 표현이 많아 특정 기회에 대한 강력한 영향을 줄 수 있는 방안을 제시하지 못합니다.",
          "Pass_question": "문장 구조와 문법적 정확성은 매우 우수하며 맞춤법 오류 없음.",
          "Pass_answer": ""
      }
  ]
};

export default function FeedbackPage() {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [document, setDocument] = useState<Document | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 사용자 인증 상태 확인
    getCurrentUser().then((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        router.push('/mypage'); // 로그인되지 않은 경우 리다이렉트
        return;
      }
    });
  }, [router]);

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
          router.push('/mypage'); // 인증 실패시 로그인 페이지로
        }
      }
    } catch (error) {
      console.error('Error fetching document:', error);
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
    <div style={{ width: '100%', minWidth: '800px', maxWidth: '1400px' }} className="p-6 mx-auto mt-8">
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

      <div className="space-y-6">
        {/* 각 문항에 대해 왼쪽과 오른쪽을 수평으로 배치 */}
        {document.data.map((item, index) => (
          <div key={index} className="flex gap-8 mb-6 mr-10">
            {/* 왼쪽 : 원본 자기소개서 */}
            <div className="flex-1 flex flex-col">
              <Typography.Title level={4} className="mb-2">
                Q{index + 1}. {item.question}
              </Typography.Title>
              <Input.TextArea
                value={item.answer}
                readOnly
                autoSize={{ minRows: 8, maxRows: 8 }}
                className="hover:border-blue-300"
                style={{
                  resize: 'none',
                  backgroundColor: '#fff',
                  minHeight: '250px', // 고정된 최소 높이 설정
                  maxHeight: '250px', // 고정된 최대 높이 설정
                  height: '100%', // 부모 컨테이너에 맞춰서 높이를 100%로 설정
                }}
              />
            </div>

            {/* 오른쪽 : 첨삭 결과 */}
            <div className="flex-1 flex flex-col ml-10">
              <Typography.Title level={4} className="mb-2">
                첨삭 결과 #{index + 1}
              </Typography.Title>
              <div className="p-4 bg-white shadow-sm border border-gray-200 rounded-lg">
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>
                    <strong>관련성:</strong> {response.result[index]?.relevance}
                  </li>
                  <li>
                    <strong>구체성:</strong> {response.result[index]?.specificity}
                  </li>
                  <li>
                    <strong>설득력:</strong> {response.result[index]?.persuasiveness}
                  </li>
                  <li>
                    <strong>피드백:</strong> {response.result[index]?.feedback}
                  </li>
                  <li>
                    <strong>문장 구조 평가:</strong> {response.result[index]?.Pass_question}
                  </li>
                  {response.result[index]?.Pass_answer && (
                    <li>
                      <strong>추가 답변:</strong> {response.result[index]?.Pass_answer}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}