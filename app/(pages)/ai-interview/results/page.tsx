"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Spin,
  Progress,
  Alert,
  Button,
  Tooltip,
} from "antd";
import {
  BarChartOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  SoundOutlined,
  EyeOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import getCurrentUser from "@/lib/firebase/auth_state_listener";
import { Radar } from "@ant-design/plots";
import ResultModal from "@/app/components/interview/result";

interface AnalysisCardProps {
  title: string;
  time: string;
  videoAnalysis: {
    [key: string]:
      | {
          video_number: number;
          video_filename: string;
          question: string;
          [key: string]: any;
        }
      | undefined;
  };
  onCardClick: () => void;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({
  title,
  time,
  videoAnalysis,
  onCardClick,
}) => {
  return (
    <Card
      className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800 truncate flex-grow mr-4">
            {title}
          </h3>
        </div>

        {/* 면접 진행 상태 표시 */}
        <div className="flex justify-center space-x-8">
          {[1, 2, 3, 4].map((num) => {
            const hasData = videoAnalysis[num.toString()];
            return (
              <div key={`progress-${num}`} className="flex items-center justify-center">
                <div 
                  className={`
                    w-16 h-16 rounded-full flex items-center justify-center
                    border-[6px] shadow-md
                    ${hasData 
                      ? "border-blue-500 shadow-blue-200" 
                      : "border-orange-500 shadow-orange-200"
                    }
                  `}
                >
                  <span className="text-xl font-semibold text-gray-800">{num}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-500">{time}</p>
            <p className="text-sm font-medium text-gray-600">{/* 직무코드 */}</p>
          </div>
          <Tooltip title="분석된 면접 세부 내용 보기">
            <button 
              className="text-blue-500 hover:underline font-bold"
              onClick={(e) => {
                e.stopPropagation();
                onCardClick();
              }}
            >
              결과보기
            </button>
          </Tooltip>
        </div>
      </div>
    </Card>
  );
};

interface Analysis {
  _id: { $oid: string };
  uid: string;
  self_id: string;
  title: string;
  job_code: string;
  time: string;
  [key: string]: any;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
};

export default function AnalysisResultsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [analysisResults, setAnalysisResults] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(
    null
  );

  // 전체 면접 데이터의 평균 점수 계산
  const calculateOverallAverages = (allResults: Analysis[]) => {
    const allScores = allResults.flatMap(analysis => {
      const interviewData = analysis[analysis.uid];
      return Object.values(interviewData)
        .filter((round: any) => round?.Score && Object.values(round.Score).every(score => score !== null))
        .map((round: any) => round.Score);
    });

    if (allScores.length === 0) return null;

    const average = (arr: number[]) => 
      Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1));

    return {
      말하기속도: average(allScores.map(s => s.말하기속도)),
      "추임새/침묵": average(allScores.map(s => s["추임새/침묵"])),
      목소리변동성: average(allScores.map(s => s.목소리변동성)),
      표정분석: average(allScores.map(s => s.표정분석)),
      머리기울기: average(allScores.map(s => s.머리기울기)),
      시선분석: average(allScores.map(s => s.시선분석)),
      답변평가: average(allScores.map(s => s.답변평가))
    };
  };

  // useEffect 내부에서 데이터를 가져온 후 평균 계산
  useEffect(() => {
    const fetchUserAndAnalysis = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
          const token = await currentUser.getIdToken();
          const response = await fetch(
            `/api/interview/result_request?uid=${currentUser.uid}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch analysis results');
          }
          
          const data = await response.json();
          const sortedData = data.sort((a: Analysis, b: Analysis) => 
            new Date(b.time).getTime() - new Date(a.time).getTime()
          );
          setAnalysisResults(sortedData);
        }
      } catch (err) {
        setError("분석 결과를 불러오는데 실패했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndAnalysis();
  }, []);

  const handleLoginRedirect = () => {
    router.push("/mypage");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center bg-white p-10 rounded-2xl shadow-xl max-w-md w-full">
          <ClockCircleOutlined className="text-6xl text-blue-500 mb-6" />
          <p className="text-xl text-gray-700 mb-6">
            면접 분석 결과는 로그인 후 확인할 수 있습니다.
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
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <ClockCircleOutlined className="mr-4 text-blue-500" />
            면접 분석 결과
          </h2>
          <Button
            type="primary"
            onClick={() => router.push("/ai-interview/evaluation")}
            className="flex items-center"
          >
            새 면접 시작
          </Button>
        </div>

        <div className="mb-8 flex items-center space-x-8">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-sm text-gray-600">분석 완료 영상</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
            <span className="text-sm text-gray-600">분석 중 or 실패 영상</span>
          </div>
        </div>

        {error && (
          <Alert
            message="오류 발생"
            description={error}
            type="error"
            showIcon
            className="mb-6"
          />
        )}

        {analysisResults.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-2xl shadow-lg">
            <FileTextOutlined className="text-6xl text-gray-400 mb-6" />
            <p className="text-xl text-gray-600 mb-6">
              아직 분석된 면접 결과가 없습니다.
            </p>
            <Button
              type="primary"
              size="large"
              onClick={() => router.push("/ai-interview")}
              className="px-10 py-3"
            >
              첫 번째 면접 시작하기
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analysisResults.map((analysis) => {
                // _id.$oid가 존재하지 않을 경우를 대비해 다른 고유값도 함께 사용
                const uniqueKey =
                  analysis._id?.$oid || `${analysis.uid}-${analysis.time}`;
                return (
                  <AnalysisCard
                    key={uniqueKey}
                    title={analysis.title}
                    time={formatDate(analysis.time)}
                    videoAnalysis={analysis[analysis.uid]}
                    onCardClick={() => {
                      setSelectedAnalysis(analysis);
                      setModalVisible(true);
                    }}
                  />
                );
              })}
            </div>
          </>
        )}

        <ResultModal 
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          analysis={selectedAnalysis}
          averageScores={calculateOverallAverages(analysisResults)}
        />
      </div>
    </div>
  );
}
