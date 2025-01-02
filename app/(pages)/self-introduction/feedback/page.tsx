'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Input, Typography, Card } from 'antd';
import { LeftOutlined, 
  CodeOutlined, ProjectOutlined, DollarOutlined, TeamOutlined,
  FileTextOutlined, DesktopOutlined, SketchOutlined, ShoppingOutlined,
  CustomerServiceOutlined, ShopOutlined, ShoppingCartOutlined, CarOutlined,
  CoffeeOutlined, ExperimentOutlined, BuildOutlined, MedicineBoxOutlined,
  ExperimentOutlined as ResearchIcon, ReadOutlined, PlaySquareOutlined,
  BankOutlined, SafetyOutlined
} from '@ant-design/icons';

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

export default function FeedbackPage() {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [document, setDocument] = useState<Document | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const _id = urlParams.get('_id');

    if (_id) {
      setId(_id);
      fetchData(_id);
    } else {
      router.push('/self-introduction');
    }
  }, [router]);

  const fetchData = async (_id: string) => {
    try {
      const API_URL = `/api/self-introduction?_id=${_id}`;
      const response = await fetch(API_URL);
      if (response.ok) {
        const data: Document = await response.json();
        setDocument(data);
      } else {
        console.error('Failed to fetch document:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching document:', error);
    }
  };

  if (!id || !document) {
    return <div>Loading...</div>;
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

      <div className="grid grid-cols-2 gap-8">
        {/* 왼쪽: 원본 자기소개서 */}
        <div className="space-y-6">
          {document.data.map((item, index) => (
            <div key={index} className="space-y-2">
              <Typography.Title level={4} className="mb-2 px-4">
                Q{index + 1}. {item.question}
              </Typography.Title>
              <Input.TextArea
                value={item.answer}
                readOnly
                autoSize={{ minRows: 8, maxRows: 8 }}
                className="hover:border-blue-300"
                style={{ 
                  resize: 'none',
                  backgroundColor: '#fff'
                }}
              />
            </div>
          ))}
        </div>

        {/* 오른쪽: 첨삭 결과 */}
        <div className="space-y-6">
          <Typography.Title level={3} className="mb-4">첨삭 결과</Typography.Title>
          <div className="flex flex-col items-center justify-center h-[200px] bg-gray-50 rounded border border-gray-200">
            <Typography.Text type="secondary" className="text-lg">
              첨삭 결과 표시
            </Typography.Text>
          </div>
        </div>
      </div>
    </div>
  );
}
