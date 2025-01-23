'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { Button } from "antd";
import getCurrentUser from "@/lib/firebase/auth_state_listener";
import { DeviceCheck } from "@/app/components/interview/DeviceCheck";
import { Select_Self_Intro } from "@/app/components/interview/selectselfintro";
import { InterviewProgress } from "@/app/components/interview/Progess";
import { ClockCircleOutlined } from "@ant-design/icons";

interface InterviewData {
  userUid: string;      
  resumeUid: string;    
  job_code: string;
  company?: string; 
  resume_title: string;
  data: {              // 자기소개서 질문-답변 데이터 추가
    question: string;
    answer: string;
  }[];
  questions: string[]; // AI가 생성한 질문들을 위한 배열
  videoFiles: File[];
  generatedQuestions?: string[];
  interviewMode: 'practice' | 'mock';
}


interface PageProps {
  searchParams: {
    jobCode?: string;
    company?: string;
    onSelect: (introData: InterviewData, interviewMode: 'practice' | 'mock') => void;
    onBack: () => void;
  };
}


interface AnalysisResponse {
  status: string;
}

export default function Page({ searchParams }: PageProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [step, setStep] = useState<"device-check" | "select-intro" | "progress">("device-check");
  const [loading, setLoading] = useState(true);
  const [selectedIntroData, setSelectedIntroData] = useState<InterviewData | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');

  const { jobCode, company } = searchParams;

  // 사용자 인증 상태 확인
  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        setUser(user);
      })
      .catch((error) => {
        console.error("Auth error:", error);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 로그인 페이지로 리다이렉트
  const handleLoginRedirect = () => {
    router.push("/mypage");
  };

  // 로딩 중 화면
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>로딩중...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center bg-white p-10 rounded-2xl shadow-xl max-w-md w-full">
          <ClockCircleOutlined className="text-6xl text-blue-500 mb-6" />
          <p className="text-xl text-gray-700 mb-6">
            면접 평가는 로그인 후 진행할 수 있습니다.
          </p>
          <Button
            type="primary"
            size="large"
            onClick={handleLoginRedirect}
            className="px-10 py-3 text-base"
          >
            로그인 하러 가기
          </Button>
        </div>
      </div>
    );
  }

  return (
  <div className="flex flex-col items-center min-h-screen p-4">
    {user ? (
      <div>
        {step === "device-check" && (
          <DeviceCheck
            user={user}
            stream={stream}
            setStream={setStream}
            onComplete={(response: AnalysisResponse) => {
              setAnalysisStatus(response.status);  // DeviceCheck의 status 저장
              setStep("select-intro");
            }}
          />
        )}

        {step === "select-intro" && (
          <Select_Self_Intro
            job_Code={jobCode}
            company={company}
            status={analysisStatus}  // 저장된 status를 자소서 선택 컴포넌트로 전달
            onSelect={(introData,interviewMode) => {
              const completeIntroData: InterviewData = {
                userUid: user.uid,
                resumeUid: introData.resumeUid,
                job_code: introData.job_code,
                data: introData.data,
                company: company || undefined,
                resume_title: introData.resume_title || "자기소개서",
                questions: introData.data.map((item) => item.question),
                generatedQuestions: introData.generatedQuestions || [],
                videoFiles: [],
                interviewMode: interviewMode
                
              };
              console.log('Page 컴포넌트가 생성한 completeIntroData:', completeIntroData);
              setSelectedIntroData(completeIntroData);
              setStep("progress");
            }}
            onBack={() => setStep("device-check")}
          />
        )}

          {step === "progress" && selectedIntroData && stream && (
            <InterviewProgress
              stream={stream}
              interviewData={selectedIntroData}
              status={analysisStatus}  // status 전달 추가
            />
          )}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-lg mb-2">해당 서비스는 로그인 후 사용 가능합니다.</p>
          <Button
            onClick={handleLoginRedirect}
            type="primary"
            className="mt-4 px-8 h-10"
          >
            로그인 하러 가기
          </Button>
        </div>
      )}
    </div>
  );
}