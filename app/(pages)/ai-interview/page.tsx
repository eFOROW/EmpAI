"use client";

import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import getCurrentUser from "@/lib/firebase/auth_state_listener";
import { motion } from "framer-motion";
import { 
  RobotOutlined,
  VideoCameraOutlined,
  FileSearchOutlined,
  ArrowRightOutlined 
} from "@ant-design/icons";
import { ConfigProvider } from "antd";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  delay: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  icon,
  onClick,
  delay
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        scale: 1.05, // 카드 확대
        boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1), 0px 8px 16px rgba(0, 0, 0, 0.1), 0px 0px 30px rgba(75,0,130,0.2), 0px 0px 30px rgba(0,0,255,0.4)" // 호버 시 강한 그림자
      }} 
      className="relative bg-white rounded-xl overflow-hidden cursor-pointer group transition-shadow duration-300"
      style={{
        boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1), 0px 8px 16px rgba(0, 0, 0, 0.1), 0px 0px 30px rgba(75,0,130,0.1), 0px 0px 30px rgba(0,0,255,0.1)", // 평소에는 부드러운 그림자
      }}
    >
      <div className="relative p-6">
        {/* 아이콘 */}
        <motion.div 
          className="h-12 w-12 text-3xl text-purple-500"
          transition={{ duration: 0.5 }}
        >
          {icon}
        </motion.div>
        
        {/* 제목 및 설명 */}
        <h3 className="text-lg font-semibold mt-4">{title}</h3>
        <p className="text-gray-600 text-sm mt-2">{description}</p>
        
        {/* 살펴보기 버튼 */}
        <motion.div
          className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <button 
            className="flex items-center gap-2 text-sm text-gray-900 group-hover:text-blue-500"
            onClick={onClick}
          >
            살펴보기
            <ArrowRightOutlined className="transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default function Page() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getCurrentUser().then((user) => {
      setUser(user);
    });
  }, []);

  const services = [
    {
      title: "AI 면접 예상질문",
      description: "AI가 분석한 최신 면접 트렌드와 직무별 맞춤 예상 질문을 제공합니다. 취업을 준비하는 과정에서 가장 중요한 면접 준비를 도와드립니다.",
      icon: <RobotOutlined />
    },
    {
      title: "AI 모의면접",
      description: "실제 면접과 같은 환경에서 AI 면접관과 1:1 모의면접을 진행해보세요. 답변을 녹화하고 실시간 피드백을 받을 수 있습니다.",
      icon: <VideoCameraOutlined />
    },
    {
      title: "면접 결과보기",
      description: "AI가 분석한 당신의 면접 결과를 확인하세요. 답변 내용, 목소리 톤, 표정 등을 종합적으로 분석하여 개선점을 제시합니다.",
      icon: <FileSearchOutlined />
    }
  ];

  return (
    <div>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#4F46E5",
          },
        }}
      >
        <div className="min-h-screen bg-gradient-to-br flex flex-col">
          {/* 페이지 상단 설명 추가 */}
          <div className="mt-20 text-center rounded-xl mx-4">
            <h2 className="text-3xl font-semibold text-gray-900">AI 기반 면접 준비 플랫폼</h2>
            <p className="mt-4 text-lg text-gray-700">
              취업을 준비하는 모든 사람들을 위한 AI 기반 면접 준비 솔루션을 제공합니다. AI의 힘을 빌려 예상질문을 분석하고, 모의면접을 통해 실력을 쌓고, 면접 후 피드백을 통해 개선점을 찾을 수 있습니다. 이 모든 과정을 통해 면접 준비를 완벽하게 마칠 수 있습니다.
            </p>
          </div>


          {/* 서비스 카드 */}
          <div className="flex-grow w-full max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              {services.map((service, index) => (
                <ServiceCard
                  key={index}
                  title={service.title}
                  description={service.description}
                  icon={service.icon}
                  onClick={() => console.log(`Clicked ${service.title}`)}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </div>
        </div>
      </ConfigProvider>
    </div>
  );
}
