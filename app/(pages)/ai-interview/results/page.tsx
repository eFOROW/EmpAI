'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Card, Spin, Progress, Tabs, Alert, Button, Tooltip } from 'antd';
import { 
  BarChartOutlined, 
  ClockCircleOutlined, 
  FileTextOutlined, 
  ExperimentOutlined,
  SoundOutlined,
  EyeOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import getCurrentUser from "@/lib/firebase/auth_state_listener";

interface AnalysisCardProps {
  title: string;
  time: string;
  videoAnalysis: {
    [key: string]: {
      video_number: number;
      video_filename: string;
      question: string;
      [key: string]: any;
    } | undefined;
  };
  onCardClick: () => void;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({
  title,
  time,
  videoAnalysis,
  onCardClick
}) => {
  return (
    <Card
      hoverable
      className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
      onClick={onCardClick}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 truncate flex-grow mr-4">
            {title}
          </h3>
          <div className="bg-blue-100 rounded-full p-2">
            <ClockCircleOutlined className="text-blue-500" />
          </div>
        </div>
        <p className="text-sm text-gray-500">{time}</p>
        
        {/* 면접 진행 상태 표시 */}
        <div className="flex space-x-3">
          {[1, 2, 3, 4].map((num) => {
            const hasData = videoAnalysis[num.toString()];
            return (
              <div
                key={num}
                className={`
                  flex-1 h-2 rounded-full 
                  ${hasData ? 'bg-blue-500' : 'bg-orange-500'}
                `}
              />
            );
          })}
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-gray-600">
            {/* 직무코드 */}
          </p>
          <Tooltip title="분석된 면접 세부 내용 보기">
            <button className="text-blue-500 hover:underline">
              자세히 보기
            </button>
          </Tooltip>
        </div>
      </div>
    </Card>
  );
};

interface VideoAnalysis {
  video_number: number;
  video_filename: string;
  question: string;
  답변: string | null;
  ["감정_%"]: {
    Angry: number;
    Disgust: number;
    Fear: number;
    Happy: number;
    Sad: number;
    Surprise: number;
    Neutral: number;
  };
  ["머리기울기_%"]: {
    center: number;
    right: number;
    left: number;
  };
  ["아이트래킹_%"]: {
    center: number;
    right: number;
    left: number;
    blink: number;
  };
  말하기속도: number | null;
  평속대비차이: number | null;
  추임새갯수: number;
  침묵갯수: number;
  목소리변동성: string;
  ["음성높낮이_%"]: number;
}

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
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
};

const EmotionAnalysisChart = ({ emotions }: { emotions: VideoAnalysis["감정_%"] }) => {
  const emotionLabels: { [key: string]: string } = {
    Angry: '화남', 
    Disgust: '혐오', 
    Fear: '두려움', 
    Happy: '행복', 
    Sad: '슬픔', 
    Surprise: '놀람', 
    Neutral: '무감정'
  };

  const emotionColors: { [key: string]: string } = {
    Angry: '#EF4444',
    Disgust: '#6366F1',
    Fear: '#F43F5E',
    Happy: '#10B981',
    Sad: '#3B82F6',
    Surprise: '#F59E0B',
    Neutral: '#8B5CF6'
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg transform transition-all hover:scale-105">
      <div className="flex items-center mb-4">
        <div className="bg-blue-100 rounded-full p-3 mr-4">
          <BarChartOutlined className="text-blue-500 text-2xl" />
        </div>
        <h4 className="text-xl font-bold text-gray-800">감정 분석</h4>
        <Tooltip title="AI가 분석한 면접 중 감정 분포">
          <InfoCircleOutlined className="ml-2 text-gray-500" />
        </Tooltip>
      </div>
      <div className="space-y-4">
        {Object.entries(emotions).map(([emotion, value]) => (
          <div key={emotion} className="relative">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-600">
                {emotionLabels[emotion] || emotion}
              </span>
              <span className="text-blue-600 font-semibold">{value.toFixed(1)}%</span>
            </div>
            <Progress 
              percent={value} 
              showInfo={false}
              strokeColor={emotionColors[emotion]}
              strokeWidth={10}
              className="custom-progress"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const HeadPositionAnalysis = ({ headPositions }: { headPositions: VideoAnalysis["머리기울기_%"] }) => {
  const positionLabels: { [key: string]: string } = {
    center: '중앙',
    right: '오른쪽',
    left: '왼쪽'
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg transform transition-all hover:scale-105">
      <div className="flex items-center mb-4">
        <div className="bg-green-100 rounded-full p-3 mr-4">
          <ExperimentOutlined className="text-green-500 text-2xl" />
        </div>
        <h4 className="text-xl font-bold text-gray-800">머리 기울기 분석</h4>
        <Tooltip title="면접 중 머리 기울기 방향 비율">
          <InfoCircleOutlined className="ml-2 text-gray-500" />
        </Tooltip>
      </div>
      <div className="flex justify-around">
        {Object.entries(headPositions).map(([direction, value]) => (
          <div key={direction} className="text-center">
            <Progress
              type="circle"
              percent={value}
              format={percent => (
                <div className="text-sm">
                  <div className="font-medium text-gray-600">
                    {positionLabels[direction] || direction}
                  </div>
                  <div className="text-blue-500 font-semibold">{percent}%</div>
                </div>
              )}
              strokeColor="#3B82F6"
              strokeWidth={10}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const VoiceAnalysis = ({ voiceData }: { 
  voiceData: Pick<
    VideoAnalysis, 
    '말하기속도' | '목소리변동성' | '추임새갯수' | '침묵갯수' | '음성높낮이_%'
  > 
}) => {
  const voiceAnalysisItems = [
    { 
      label: '말하기 속도', 
      value: voiceData.말하기속도 ? `${voiceData.말하기속도.toFixed(1)}` : '분석 중',
      tooltip: '발화 속도에 대한 분석'
    },
    { 
      label: '목소리 변동성', 
      value: voiceData.목소리변동성,
      tooltip: '목소리의 톤 변화 정도'
    },
    { 
      label: '추임새 횟수', 
      value: `${voiceData.추임새갯수}회`,
      tooltip: '면접 중 사용한 추임새 횟수'
    },
    { 
      label: '침묵 횟수', 
      value: `${voiceData.침묵갯수}회`,
      tooltip: '면접 중 발생한 침묵 횟수'
    },
    { 
      label: '음성 높낮이', 
      value: `${voiceData['음성높낮이_%'].toFixed(1)}%`,
      tooltip: '음성의 높낮이 변화 정도'
    }
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg transform transition-all hover:scale-105">
      <div className="flex items-center mb-4">
        <div className="bg-purple-100 rounded-full p-3 mr-4">
          <SoundOutlined className="text-purple-500 text-2xl" />
        </div>
        <h4 className="text-xl font-bold text-gray-800">음성 분석</h4>
      </div>
      <div className="space-y-4">
        {voiceAnalysisItems.map(({ label, value, tooltip }) => (
          <div 
            key={label} 
            className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">{label}</span>
              <Tooltip title={tooltip}>
                <InfoCircleOutlined className="text-gray-400 text-sm" />
              </Tooltip>
            </div>
            <span className="font-semibold text-gray-800">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const EyeTrackingAnalysis = ({ eyeTrackingData }: { eyeTrackingData: VideoAnalysis["아이트래킹_%"] }) => {
  const trackingLabels: { [key: string]: string } = {
    center: '중앙',
    right: '오른쪽',
    left: '왼쪽',
    blink: '눈 깜빡임'
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg transform transition-all hover:scale-105">
      <div className="flex items-center mb-4">
        <div className="bg-indigo-100 rounded-full p-3 mr-4">
          <EyeOutlined className="text-indigo-500 text-2xl" />
        </div>
        <h4 className="text-xl font-bold text-gray-800">시선 분석</h4>
        <Tooltip title="면접 중 시선 이동 및 눈 깜빡임 분석">
          <InfoCircleOutlined className="ml-2 text-gray-500" />
        </Tooltip>
      </div>
      <div className="space-y-4">
        {Object.entries(eyeTrackingData).map(([direction, value]) => (
          <div 
            key={direction} 
            className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span className="text-gray-600">{trackingLabels[direction] || direction}</span>
            <span className="font-semibold text-gray-800">{value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function AnalysisResultsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [analysisResults, setAnalysisResults] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);

  useEffect(() => {
    const fetchUserAndAnalysis = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
          const response = await fetch(`/api/interview-result?uid=${currentUser.uid}`);
          const data = await response.json();
          setAnalysisResults(data);
        }
      } catch (err) {
        setError('분석 결과를 불러오는데 실패했습니다.');
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
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <ClockCircleOutlined className="mr-4 text-blue-500" />
            면접 분석 결과
          </h2>
          <Button 
            type="primary" 
            onClick={() => router.push('/ai-interview/evaluation')}
            className="flex items-center"
          >
            새 면접 시작
          </Button>
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
            onClick={() => router.push('/ai-interview')}
            className="px-10 py-3"
          >
            첫 번째 면접 시작하기
          </Button>
        </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analysisResults.map((analysis) => (
              <AnalysisCard
                key={analysis._id.$oid}
                title={analysis.title}
                time={formatDate(analysis.time)}
                videoAnalysis={analysis[analysis.uid]}
                onCardClick={() => {
                  setSelectedAnalysis(analysis);
                  setModalVisible(true);
                }}
              />
            ))}
          </div>
        )}

        <Modal
          title={
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold">{selectedAnalysis?.title}</h3>
              <p className="text-sm text-gray-500">
                {selectedAnalysis ? formatDate(selectedAnalysis.time) : ''}
              </p>
            </div>
          }
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          width={1400}
          footer={null}
          className="analysis-modal"
        >
          {selectedAnalysis && (
            <Tabs
              defaultActiveKey="1"
              type="card"
              items={[1, 2, 3, 4].map((num) => {
                const videoAnalysis = selectedAnalysis[selectedAnalysis.uid]?.[num.toString()];
                return {
                  key: num.toString(),
                  label: (
                    <span className="px-4">
                      면접 {num}
                      {videoAnalysis && 
                        <span className="ml-2 text-green-500">●</span>
                      }
                    </span>
                  ),
                  children: (
                    <div className="p-4">
                      {videoAnalysis ? (
                        <div className="grid grid-cols-2 gap-6">
                          <div className="col-span-2 bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl shadow-md">
                            <div className="flex items-center mb-4">
                              <div className="bg-blue-200 rounded-full p-3 mr-4">
                                <FileTextOutlined className="text-blue-600 text-2xl" />
                              </div>
                              <h3 className="text-xl font-bold text-gray-800">면접 질문</h3>
                            </div>
                            <p className="text-gray-700 text-base">{videoAnalysis.question}</p>
                          </div>

                          <EmotionAnalysisChart emotions={videoAnalysis["감정_%"]} />
                          
                          <HeadPositionAnalysis headPositions={videoAnalysis["머리기울기_%"]} />

                          <VoiceAnalysis voiceData={{
                            말하기속도: videoAnalysis.말하기속도,
                            목소리변동성: videoAnalysis.목소리변동성,
                            추임새갯수: videoAnalysis.추임새갯수,
                            침묵갯수: videoAnalysis.침묵갯수,
                            '음성높낮이_%': videoAnalysis['음성높낮이_%']
                          }} />

                          <EyeTrackingAnalysis eyeTrackingData={videoAnalysis["아이트래킹_%"]} />
                        </div>
                      ) : (
                        <div className="text-center py-16">
                          <Spin size="large" />
                          <p className="mt-4 text-gray-500">분석 중입니다...</p>
                        </div>
                      )}
                    </div>
                  ),
                };
              })}
            />
          )}
        </Modal>
      </div>
    </div>
  );
}