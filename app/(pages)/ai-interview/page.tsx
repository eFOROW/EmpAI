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
import { useRouter } from "next/navigation";
import Image from "next/image";

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
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1), 0px 8px 16px rgba(0, 0, 0, 0.1), 0px 0px 30px rgba(75,0,130,0.2), 0px 0px 30px rgba(0,0,255,0.4)"
      }} 
      className="relative bg-white rounded-xl overflow-hidden cursor-pointer group transition-shadow duration-300"
      style={{
        boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1), 0px 8px 16px rgba(0, 0, 0, 0.1), 0px 0px 30px rgba(75,0,130,0.1), 0px 0px 30px rgba(0,0,255,0.1)",
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
  const router = useRouter();

  useEffect(() => {
    getCurrentUser().then((user) => {
      setUser(user);
    });
  }, []);

  const services = [
    {
      title: "AI 면접 예상질문",
      description: "AI가 분석한 최신 면접 트렌드와 직무별 맞춤 예상 질문을 제공합니다. 취업을 준비하는 과정에서 가장 중요한 면접 준비를 도와드립니다.",
      icon: <RobotOutlined />,
      path: "/ai-interview/question"
    },
    {
      title: "AI 모의면접",
      description: "실제 면접과 같은 환경에서 AI 면접관과 1:1 모의면접을 진행해보세요. 답변을 녹화하고 실시간 피드백을 받을 수 있습니다.",
      icon: <VideoCameraOutlined />,
      path: "/ai-interview/evaluation"
    },
    {
      title: "면접 결과보기",
      description: "AI가 분석한 당신의 면접 결과를 확인하세요. 답변 내용, 목소리 톤, 표정 등을 종합적으로 분석하여 개선점을 제시합니다.",
      icon: <FileSearchOutlined />,
      path: "/ai-interview/results"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/80 via-white/50 to-purple-50/80">
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#4F46E5",
          },
        }}
      >
        {/* 히어로 섹션 개선 */}
        <div className="relative pt-20 pb-16 text-center">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-[100px]" />
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                AI 기반 면접 준비 플랫폼
              </h1>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                취업을 준비하는 모든 분들을 위한{" "}
                <span className="text-indigo-600 font-semibold">스마트한 면접 준비 솔루션</span>
                을 제공합니다.
              </p>
              <p className="mt-4 text-gray-600">
                AI의 힘을 빌려 예상질문을 분석하고, 모의면접을 통해 실력을 쌓아보세요.
              </p>
            </motion.div>

            {/* 통계 섹션 추가 */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
              {[
                { number: "96%", label: "사용자 만족도" },
                { number: "15,000+", label: "자소서 맞춤 질문" },
                { number: "24/12", label: "실시간 피드백" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-2xl md:text-3xl font-bold text-indigo-600">{stat.number}</div>
                  <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* 서비스 카드 섹션 */}
        <div className="max-w-7xl mx-auto px-4 py-16 pb-32">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900">주요 서비스</h2>
            <p className="mt-4 text-gray-600">면접 준비의 모든 단계를 AI와 함께 준비하세요</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16">
            {services.map((service, index) => (
              <ServiceCard
                key={index}
                title={service.title}
                description={service.description}
                icon={service.icon}
                onClick={() => router.push(service.path)}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </ConfigProvider>
    </div>
  );
}
