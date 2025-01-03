'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { Button } from "antd";
import getCurrentUser from "@/lib/firebase/auth_state_listener";
import { DeviceCheck } from "@/app/components/interview/DeviceCheck";
import { Select_Self_Intro } from "@/app/components/interview/selectselfintro";
import { InterviewProgress } from "@/app/components/interview/Progess";

// 인터뷰 데이터 인터페이스 (타입 정의)
interface InterviewData {
  userUid: string;      // 로그인한 사용자 UID
  resumeUid: string;    // 자기소개서 UID
  job_code: string;
  resume_title: string; // 자기소개서 제목
  questions: string[];
  videoFiles: File[];
}

interface PageProps {
  searchParams: {
    jobCode?: string;
    company?: string;
  };
}

export default function Page({ searchParams }: PageProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [step, setStep] = useState<"device-check" | "select-intro" | "progress">("device-check");
  const [loading, setLoading] = useState(true);
  const [selectedIntroData, setSelectedIntroData] = useState<InterviewData | null>(null);

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

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      {user ? (
        <div>
          {step === "device-check" && (
            <DeviceCheck
              user={user}
              stream={stream}
              setStream={setStream}
              onComplete={() => setStep("select-intro")}
            />
          )}

          {/* Select_Self_Intro 컴포넌트에 job_code와 company 전달 */}
          {step === "select-intro" && (
            <Select_Self_Intro
              job_Code={jobCode}  // 추가된 prop
              company={company}    // 추가된 prop
              onSelect={(introData) => {
                const completeIntroData: InterviewData = {
                  userUid: user.uid,
                  resumeUid: introData.resumeUid,
                  job_code: introData.job_code,
                  resume_title: introData.resume_title || "자기소개서",
                  questions: introData.data.map(item => item.question),
                  videoFiles: []
                };
                
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