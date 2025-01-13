"use client";

import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import getCurrentUser from "@/lib/firebase/auth_state_listener";
import { motion } from "framer-motion";
import { ConfigProvider } from "antd";
import { useRouter } from "next/navigation";
import { EditOutlined, FolderOpenOutlined } from "@ant-design/icons";

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
  delay,
}) => {
  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{
        scale: 1.05,
        boxShadow:
          "0px 8px 16px rgba(0, 0, 0, 0.1), 0px 8px 16px rgba(0, 0, 0, 0.1), 0px 0px 30px rgba(0,0,255,0.2), 0px 0px 30px rgba(0,0,255,0.4), 0px 0px 30px rgba(128,128,128,0.1)",
        }}
        className="relative bg-white rounded-xl overflow-hidden cursor-pointer group transition-shadow duration-300"
        style={{
          boxShadow:
            "0px 8px 16px rgba(0, 0, 0, 0.1), 0px 8px 16px rgba(0, 0, 0, 0.1), 0px 0px 30px rgba(0,0,255,0.1), 0px 0px 30px rgba(0,0,255,0.1), 0px 0px 30px rgba(128,128,128,0.05)",
        }}

    >
      <div className="relative p-6">
        {/* 아이콘 */}
        <motion.div
          className="h-12 w-12 text-3xl text-blue-300"
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
      title: "자기소개서 등록",
      description:
        "원하는 자기소개서 질문을 선택해 답변을 작성하고 저장할 수 있는 페이지입니다. 효율적인 자기소개서 작성을 돕기 위한 직관적인 인터페이스를 제공합니다.",
      icon: <EditOutlined className="text-3xl text-blue-500" />,
      path: "/self-introduction/manage/edit",
    },
    {
      title: "자기소개서 관리",
      description:
        "저장된 자기소개서를 확인하고 AI 첨삭 및 유사 질문의 합격 자기소개서를 참고하여 수정할 수 있는 페이지입니다. 자기소개서의 완성도를 높이기 위한 다양한 도구를 제공합니다.",
      icon: <FolderOpenOutlined className="text-3xl text-blue-500" />,
      path: "/self-introduction/manage",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/80 via-white/50 to-blue-50/80">
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
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 backdrop-blur-[100px]" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                AI 기반 자기소개서 플랫폼
              </h1>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                취업의 첫 걸음을 내딛는 이들을 위한{" "}
                <span className="text-indigo-600 font-semibold">
                  자기소개서 피드백 솔루션
                </span>
                을 제공합니다.
              </p>
              <p className="mt-4 text-gray-600">
                AI가 분석해주는 자기소개서, 경쟁력을 높이는 비법을 만나보세요!
              </p>
            </motion.div>
            
            {/* 통계 섹션 추가 */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
              {[
                { number: "92%", label: "사용자 만족도" },
                { number: "15,000+", label: "합격 자소서" },
                { number: "25/1", label: "AI 지원" },
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
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 pb-32">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-gray-900">주요 서비스</h2>
              <p className="mt-4 text-lg text-gray-600">
              자기소개서 작성의 모든 단계를 AI와 함께 준비하세요
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
              {services.map((service, index) => (
                <ServiceCard
                  key={index}
                  title={service.title}
                  description={service.description}
                  icon={service.icon}
                  delay={index * 0.1}
                  onClick={() => router.push(service.path)}
                />
              ))}
            </div>
          </div>
        </div>
      </ConfigProvider>
    </div>
  );
}
