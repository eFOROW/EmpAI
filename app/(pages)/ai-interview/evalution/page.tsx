// page.tsx(evalution)

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { Button } from "antd";
import getCurrentUser from "@/lib/firebase/auth_state_listener";
import { DeviceCheck } from "@/app/components/interview/DeviceCheck";
import { Select_Self_Intro } from "@/app/components/interview/selectselfintro";

export default function Page() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [step, setStep] = useState<"device-check" | "select-intro" | "interview">("device-check");
    const [loading, setLoading] = useState(true); // 로딩 상태 추가
    const [selectedIntroData, setSelectedIntroData] = useState<InterviewData | null>(null);

    interface InterviewData {
        uid: string;
        job_code: string;
        data: {
          question: string;
          answer: string;
        }[];
      }
      

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
                setLoading(false); // 로딩 완료
            });
    }, []);

    const handleLoginRedirect = () => {
        router.push("/mypage");
    };

    // 로딩 중일 때 표시할 내용
    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">
            <p>로딩중...</p>
        </div>;
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
                  onComplete={() => setStep("select-intro")} // device-check -> select-intro로 변경
                />
              )}
              {step === "select-intro" && (
                <div>
                    <Select_Self_Intro
                    onSelect={(introData) => {
                        setSelectedIntroData(introData);  // 선택된 자기소개서 데이터 저장
                        setStep("interview");  // 인터뷰 단계로 이동
                    }}
                    onBack={() => setStep("device-check")}  // 디바이스 체크 단계로 돌아가기
                    />
                </div>
                )}
              {step === "interview" && (
                <div>
                  <h1>Interview 화면</h1>
                  <Button onClick={() => setStep("select-intro")}> {/* select-intro로 돌아가기 */}
                    뒤로가기
                  </Button>
                </div>
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