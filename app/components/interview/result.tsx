"use client";
import { Modal, Progress, Tabs, Tooltip, Spin } from "antd";
import {
  BarChartOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  SoundOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  PlayCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { Analysis, VideoAnalysis } from "@/app/types/interview";
import  VideoPlayer from '@/app/components/interview/videoplayer';
import React, { useState, useEffect, useMemo } from "react";
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Legend);


const emotionLabels: { [key: string]: string } = {
  Angry: "화남",
  Disgust: "혐오",
  Fear: "두려움",
  Happy: "행복",
  Sad: "슬픔",
  Surprise: "놀람",
  Neutral: "무감정",
};

const emotionColors: { [key: string]: string } = {
  Angry: "#FF4D4F",
  Disgust: "#722ED1",
  Fear: "#FFA39E",
  Happy: "#52C41A",
  Sad: "#1890FF",
  Surprise: "#FAAD14",
  Neutral: "#8C8C8C",
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
};

const HeadPositionAnalysis = ({
  headPositions,
}: {
  headPositions: VideoAnalysis["머리기울기_%"];
}) => {
  if (!headPositions) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-[0_-4px_6px_-2px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-gray-100 transform transition-all hover:scale-105 h-full flex flex-col">
        <div className="flex items-center mb-4">
          <div className="bg-green-100 rounded-full p-3 mr-4">
            <ExperimentOutlined className="text-green-500 text-2xl" />
          </div>
          <h4 className="text-xl font-bold text-gray-800">머리 기울기 분석</h4>
          <Tooltip title="면접 중 머리 기울기 방향 비율">
            <InfoCircleOutlined className="ml-2 text-gray-500" />
          </Tooltip>
        </div>
        <div className="text-center py-8 text-gray-500 flex-1 flex items-center justify-center">
          분석 결과가 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-[0_-4px_6px_-2px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-gray-100 transform transition-all hover:scale-105 h-full flex flex-col">
      <div className="flex items-center">
        <div className="bg-green-100 rounded-full p-2 mr-4">
          <ExperimentOutlined className="text-green-500 text-2xl" />
        </div>
        <h4 className="text-xl font-bold text-gray-800">머리 기울기 분석</h4>
        <Tooltip title="면접 중 머리 기울기 방향 비율">
          <InfoCircleOutlined className="ml-2 text-gray-500" />
        </Tooltip>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          <Progress
            type="circle"
            percent={headPositions.center}
            format={(percent) => (
              <div className="text-sm text-center">
                <div className="font-medium text-gray-600">중앙</div>
                <div className="text-blue-500 font-semibold">{percent}%</div>
              </div>
            )}
            strokeColor="#3B82F6"
            size={160}
          />
          
          <div className="absolute -left-14 top-5">
            <Progress
              type="dashboard"
              percent={headPositions.left}
              format={(percent) => (
                <div className="text-xs">
                  <div className="font-medium text-gray-600 text-left pl-5 pr-8">좌</div>
                  <div className="text-blue-500 font-semibold text-left pl-4 pr-8">{percent}%</div>
                </div>
              )}
              strokeColor="#3B82F6"
              size={120}
              gapDegree={180}
              gapPosition="right"
            />
          </div>
          
          <div className="absolute -right-14 top-5">
            <Progress
              type="dashboard"
              percent={headPositions.right}
              format={(percent) => (
                <div className="text-xs">
                  <div className="font-medium text-gray-600 text-right pr-5 pl-8">우</div>
                  <div className="text-blue-500 font-semibold text-right pr-4 pl-8">{percent}%</div>
                </div>
              )}
              strokeColor="#3B82F6"
              size={120}
              gapDegree={180}
              gapPosition="left"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const SpeedGauge = ({ speed }: { speed: number }) => {
  const getSpeedZone = (wpm: number) => {
    if (wpm <= 80) return { zone: '매우 느림', color: '#FF4D4F', position: 10 };
    if (wpm <= 94) return { zone: '느림', color: '#FAAD14', position: 30 };
    if (wpm <= 124) return { zone: '적정', color: '#52C41A', position: 50 };
    if (wpm <= 155) return { zone: '빠름', color: '#FAAD14', position: 70 };
    return { zone: '매우 빠름', color: '#FF4D4F', position: 90 };
  };

  const speedInfo = getSpeedZone(speed);

  return (
    <div className="bg-white p-4 rounded-lg mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600">현재 말하기 속도</span>
        <span className="text-sm font-bold text-blue-600">{speed.toFixed(0)} WPM</span>
      </div>
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
        {/* 구간별 배경 */}
        <div className="absolute h-full w-[20%] left-0" style={{ background: 'linear-gradient(90deg, #FF4D4F 0%, #FF7875 100%)' }} />
        <div className="absolute h-full w-[20%] left-[20%]" style={{ background: 'linear-gradient(90deg, #FAAD14 0%, #FFD666 100%)' }} />
        <div className="absolute h-full w-[20%] left-[40%]" style={{ background: 'linear-gradient(90deg, #52C41A 0%, #95DE64 100%)' }} />
        <div className="absolute h-full w-[20%] left-[60%]" style={{ background: 'linear-gradient(90deg, #FFD666 0%, #FAAD14 100%)' }} />
        <div className="absolute h-full w-[20%] left-[80%]" style={{ background: 'linear-gradient(90deg, #FF7875 0%, #FF4D4F 100%)' }} />
        
        {/* 현재 속도 마커 */}
        <div 
          className="absolute w-3 h-3 bg-white border-2 border-blue-600 rounded-full top-1/2 transform -translate-y-1/2 -translate-x-1/2 transition-all duration-300 shadow-md"
          style={{ left: `${speedInfo.position}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>매우 느림</span>
        <span>느림</span>
        <span>적정</span>
        <span>빠름</span>
        <span>매우 빠름</span>
      </div>
    </div>
  );
};

const VoiceAnalysis = ({
  voiceData,
}: {
  voiceData: Pick<
    VideoAnalysis,
    "말하기속도" | "목소리변동성" | "추임새갯수" | "침묵갯수"
  >;
}) => {
  const voiceAnalysisItems = [
    {
      label: "말하기 속도",
      value: voiceData.말하기속도 !== null ? `${voiceData.말하기속도.toFixed(0)} WPM` : "분석 결과 없음",
      tooltip: "발화 속도에 대한 분석",
      showValue: true,
    },
    {
      label: "목소리 변동성",
      value: voiceData.목소리변동성 || "분석 결과 없음",
      tooltip: "목소리의 톤 변화 정도",
    },
    {
      label: "추임새 횟수",
      value:
        voiceData.추임새갯수 !== null
          ? `${voiceData.추임새갯수}회`
          : "분석 결과 없음",
      tooltip: "면접 중 사용한 추임새 횟수",
    },
    {
      label: "침묵 횟수",
      value:
        voiceData.침묵갯수 !== null
          ? `${voiceData.침묵갯수}회`
          : "분석 결과 없음",
      tooltip: "면접 중 발생한 침묵 횟수",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-[0_-4px_6px_-2px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-gray-100 transform transition-all hover:scale-105">
      <div className="flex items-center mb-4">
        <div className="bg-purple-100 rounded-full p-2 mr-4">
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

const EyeTrackingAnalysis = ({
  eyeTrackingData,
}: {
  eyeTrackingData: VideoAnalysis["아이트래킹_%"];
}) => {
  if (!eyeTrackingData) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-[0_-4px_6px_-2px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-gray-100 transform transition-all hover:scale-105">
        <div className="flex items-center mb-4">
          <div className="bg-indigo-100 rounded-full p-3 mr-4">
            <EyeOutlined className="text-indigo-500 text-2xl" />
          </div>
          <h4 className="text-xl font-bold text-gray-800">시선 분석</h4>
          <Tooltip title="면접 중 시선 이동 및 눈 깜빡임 분석">
            <InfoCircleOutlined className="ml-2 text-gray-500" />
          </Tooltip>
        </div>
        <div className="text-center py-8 text-gray-500">
          분석 결과가 없습니다
        </div>
      </div>
    );
  }

  const trackingLabels: { [key: string]: string } = {
    center: "중앙",
    right: "오른쪽",
    left: "왼쪽",
    blink: "눈 깜빡임",
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-[0_-4px_6px_-2px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-gray-100 transform transition-all hover:scale-105">
      <div className="flex items-center mb-4">
        <div className="bg-indigo-100 rounded-full p-2 mr-4">
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
            <span className="text-gray-600">
              {trackingLabels[direction] || direction}
            </span>
            <span className="font-semibold text-gray-800">{value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const EmotionAnalysis = ({
  emotionData,
}: {
  emotionData: VideoAnalysis["감정_%"];
}) => {
  if (!emotionData) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-[0_-4px_6px_-2px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-gray-100 transform transition-all hover:scale-105">
        <div className="flex items-center mb-4">
          <div className="bg-red-100 rounded-full p-3 mr-4">
            <BarChartOutlined className="text-red-500 text-2xl" />
          </div>
          <h4 className="text-xl font-bold text-gray-800">감정 분석</h4>
          <Tooltip title="면접 중 표정에서 감지된 감정 분석">
            <InfoCircleOutlined className="ml-2 text-gray-500" />
          </Tooltip>
        </div>
        <div className="text-center py-8 text-gray-500">
          분석 결과가 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-[0_-4px_6px_-2px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-gray-100 transform transition-all hover:scale-105">
      <div className="flex items-center mb-3">
        <div className="bg-red-100 rounded-full p-2 mr-4">
          <BarChartOutlined className="text-red-500 text-2xl" />
        </div>
        <h4 className="text-xl font-bold text-gray-800">감정 분석</h4>
        <Tooltip title="면접 중 표정에서 감지된 감정 분석">
          <InfoCircleOutlined className="ml-2 text-gray-500" />
        </Tooltip>
      </div>

      <div className="space-y-0.5">
        {Object.entries(emotionData)
          .filter(([_, value]) => value > 0)
          .map(([emotion, value]) => (
            <div key={emotion} className="relative">
              <div className="flex justify-between text-sm mb-0.5">
                <span className="font-medium text-gray-600">
                  {emotionLabels[emotion] || emotion}
                </span>
                <span className="text-blue-600 font-semibold">
                  {value.toFixed(1)}%
                </span>
              </div>
              <Progress
                percent={value}
                showInfo={false}
                strokeColor={emotionColors[emotion]}
                strokeWidth={6}
                className="custom-progress"
              />
            </div>
          ))}
      </div>
    </div>
  );
};

const EvaluationCard = ({
  title,
  icon,
  content,
  bgColor,
  iconColor,
  isAnswerCard = false
}: {
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode | string | {
    strengths: string;
    improvements: string;
    overall: string;
  };
  bgColor: string;
  iconColor: string;
  isAnswerCard?: boolean;
}) => (
  <div className={`${bgColor} p-6 rounded-2xl shadow-[0_-4px_6px_-2px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-gray-100 flex-1 transform transition-all hover:scale-105`}>
    <div className="flex items-center mb-4">
      <div className={`${iconColor} rounded-full p-3 mr-4`}>
        {icon}
      </div>
      <h4 className="text-xl font-bold text-gray-800">{title}</h4>
    </div>
    
    {isAnswerCard ? (
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-xl">
          <div className="flex items-center mb-2">
            <h5 className="text-base font-semibold text-gray-800">나의 강점</h5>
            <Tooltip title="답변에서 발견된 강점">
              <InfoCircleOutlined className="ml-2 text-gray-400 text-sm" />
            </Tooltip>
          </div>
          <p className="text-gray-700 whitespace-pre-line">
            {(content as {strengths: string}).strengths}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl">
          <div className="flex items-center mb-2">
            <h5 className="text-base font-semibold text-gray-800">개선사항</h5>
            <Tooltip title="답변에서 개선이 필요한 부분">
              <InfoCircleOutlined className="ml-2 text-gray-400 text-sm" />
            </Tooltip>
          </div>
          <p className="text-gray-700 whitespace-pre-line">
            {(content as {improvements: string}).improvements}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl">
          <div className="flex items-center mb-2">
            <h5 className="text-base font-semibold text-gray-800">종합평가</h5>
            <Tooltip title="전반적인 답변 평가">
              <InfoCircleOutlined className="ml-2 text-gray-400 text-sm" />
            </Tooltip>
          </div>
          <p className="text-gray-700 whitespace-pre-line">
            {(content as {overall: string}).overall}
          </p>
        </div>
      </div>
    ) : (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <p className="text-gray-700 whitespace-pre-line leading-tight">{content as string}</p>
      </div>
    )}
  </div>
);

const generateAttitudeEvaluation = (scores: {
  말하기속도: number;
  "추임새/침묵": number;
  목소리변동성: number;
  표정분석: number;
  머리기울기: number;
  시선분석: number;
}, videoAnalysis: VideoAnalysis) => {
  const evaluations = [];

  // 말하기 속도 평가
  const speedEvaluation = (
    <div>
      <div className="text-lg font-semibold mb-2">【말하기 속도】</div>
      <SpeedGauge speed={Number((videoAnalysis.말하기속도 ?? 0).toFixed(0))} />
      <p className="mt-3">
        {scores.말하기속도 >= 8
          ? "적절한 속도로 말하고 있어 면접관이 내용을 이해하기 쉽습니다..."
          : scores.말하기속도 >= 5
          ? "말하기 속도가 약간 빠르거나 느립니다..."
          : "말하기 속도가 너무 빠르거나 느립니다..."}
      </p>
    </div>
  );
  evaluations.push(speedEvaluation);

  // 추임새/침묵 평가
  evaluations.push(
    <div>
      <div className="text-base font-semibold mb-2">【추임새와 침묵】</div>
      <p>
        {scores["추임새/침묵"] >= 8
          ? "추임새와 침묵을 적절히 사용하여 자연스러운 대화 흐름을 유지하고 있습니다..."
          : scores["추임새/침묵"] >= 5
          ? "추임새나 침묵이 약간 많습니다..."
          : "추임새나 침묵이 너무 많아 대화의 흐름을 방해합니다..."}
      </p>
    </div>
  );

  // 목소리 변동성 평가
  evaluations.push(
    <div>
      <div className="text-base font-semibold mb-2">【목소리 변화】</div>
      <p>
        {scores.목소리변동성 >= 8
          ? "적절한 목소리 변동성으로 생동감 있게 말하고 있습니다..."
          : scores.목소리변동성 >= 5
          ? "목소리 변동성이 약간 과도합니다..."
          : "목소리 변동성이 지나치게 과도합니다..."}
      </p>
    </div>
  );

  // 표정 분석 평가
  evaluations.push(
    <div>
      <div className="text-base font-semibold mb-2">【표정 분석】</div>
      <p>
        {scores.표정분석 >= 8
          ? "적절한 표정으로 자신감과 긍정적인 태도를 잘 표현하고 있습니다..."
          : scores.표정분석 >= 5
          ? "표정이 다소 단조롭거나 과도합니다..."
          : "부정적이거나 부적절한 표정이 많습니다..."}
      </p>
    </div>
  );

  // 머리 기울기 평가
  evaluations.push(
    <div>
      <div className="text-base font-semibold mb-2">【머리 기울기】</div>
      <p>
        {scores.머리기울기 >= 4
          ? "고개를 바르게 유지하여 자신감과 집중도를 잘 보여주고 있습니다..."
          : scores.머리기울기 >= 2
          ? "때때로 고개가 기울어집니다..."
          : "고개가 자주 기울어져 불안정해 보입니다..."}
      </p>
    </div>
  );

  // 시선분석 평가
  evaluations.push(
    <div>
      <div className="text-base font-semibold mb-2">【시선 처리】</div>
      <p>
        {scores.시선분석 >= 4
          ? "적절한 시선 처리로 집중력과 자신감을 잘 표현하고 있습니다..."
          : scores.시선분석 >= 2
          ? "시선 처리가 다소 불안정합니다..."
          : "시선 회피가 잦거나 눈 깜빡임이 과도합니다..."}
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      {evaluations.map((evaluation, index) => (
        <div key={index} className="evaluation-item">
          {evaluation}
        </div>
      ))}
    </div>
  );
};

const OverallEvaluation = ({
  attitudeEvaluation,
  answerEvaluation,
}: {
  attitudeEvaluation: React.ReactNode;
  answerEvaluation: {
    strengths: string;
    improvements: string;
    overall: string;
  };
}) => (
  <div className="space-y-6">
    <div className="flex gap-6">
      <EvaluationCard
        title="태도 평가"
        icon={<UserOutlined className="text-purple-500 text-2xl" />}
        content={attitudeEvaluation}
        bgColor="bg-purple-50"
        iconColor="bg-purple-100"
        isAnswerCard={false}
      />
      <EvaluationCard
        title="답변 평가"
        icon={<FileTextOutlined className="text-blue-500 text-2xl" />}
        content={answerEvaluation}
        bgColor="bg-blue-50"
        iconColor="bg-blue-100"
        isAnswerCard={true}
      />
    </div>
  </div>
);

interface ResultModalProps {
  visible: boolean;
  onClose: () => void;
  analysis: Analysis | null;
  averageScores: {
    말하기속도: number;
    "추임새/침묵": number;
    목소리변동성: number;
    표정분석: number;
    머리기울기: number;
    시선분석: number;
    답변평가: number;
  } | null;
}

const ScoreAnalysis = ({
  scores,
  averageScores
}: {
  scores: {
    말하기속도: number;
    "추임새/침묵": number;
    목소리변동성: number;
    표정분석: number;
    머리기울기: number;
    시선분석: number;
    답변평가: number;
  };
  averageScores: ResultModalProps['averageScores'];
}) => {
  if (!scores || !averageScores) return null;

  const getCircleColor = (score: number) => {
    if (score >= 90) return {
      '0%': '#52C41A',    // 밝은 초록
      '50%': '#73D13D',   // 중간 초록 (더 밝게)
      '100%': '#95DE64'   // 연한 초록 (더 밝게)
    };
    if (score >= 80) return {
      '0%': '#1890FF',    // 밝은 파랑
      '50%': '#40A9FF',   // 중간 파랑 (더 밝게)
      '100%': '#69C0FF'   // 연한 파랑 (더 밝게)
    };
    if (score >= 70) return {
      '0%': '#FAAD14',    // 밝은 노랑
      '50%': '#FFC53D',   // 중간 노랑 (더 밝게)
      '100%': '#FFD666'   // 연한 노랑 (더 밝게)
    };
    return {
      '0%': '#FF4D4F',    // 밝은 빨강
      '50%': '#FF7875',   // 중간 빨강 (더 밝게)
      '100%': '#FFA39E'   // 연한 빨강 (더 밝게)
    };
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return { text: '탁월', color: '#52C41A' };
    if (score >= 80) return { text: '우수', color: '#1890FF' };
    if (score >= 70) return { text: '양호', color: '#FAAD14' };
    return { text: '개선 필요', color: '#FF4D4F' };
  };

  const totalScore = Object.values(scores).reduce((acc, curr) => acc + curr, 0);
  const scorePercentage = (totalScore / 100) * 100;
  const scoreLabel = getScoreLabel(scorePercentage);
  const circleColor = getCircleColor(scorePercentage);

  const scoreItems = [
    { label: "답변 평가", value: scores.답변평가, average: averageScores.답변평가, total: 50 },
    { label: "표정 분석", value: scores.표정분석, average: averageScores.표정분석, total: 10 },
    { label: "말하기 속도", value: scores.말하기속도, average: averageScores.말하기속도, total: 10 },
    { label: "추임새/침묵", value: scores["추임새/침묵"], average: averageScores["추임새/침묵"], total: 10 },
    { label: "목소리 변동성", value: scores.목소리변동성, average: averageScores.목소리변동성, total: 10 },
    { label: "머리 기울기", value: scores.머리기울기, average: averageScores.머리기울기, total: 5 },
    { label: "시선 분석", value: scores.시선분석, average: averageScores.시선분석, total: 5 }
  ];

  // 데이터 준비
  const labels = [
    "답변평가",
    "표정분석",
    "말하기속도",
    "추임새/침묵",
    "목소리변동성",
    "머리기울기",
    "시선분석",
  ];

  // 각 항목별 만점 점수
  const maxScores = {
    답변평가: 50,
    표정분석: 10,
    말하기속도: 10,
    "추임새/침묵": 10,
    목소리변동성: 10,
    머리기울기: 5,
    시선분석: 5,
  };

  // 백분율로 변환하는 함수
  const calculatePercentage = (value: number, maxScore: number) => {
    return (value / maxScore) * 100;
  };

  const data = {
    labels,
    datasets: [
      {
        label: '현재 면접 영상',
        data: [
          calculatePercentage(scores.답변평가, maxScores.답변평가),
          calculatePercentage(scores.표정분석, maxScores.표정분석),
          calculatePercentage(scores.말하기속도, maxScores.말하기속도),
          calculatePercentage(scores["추임새/침묵"], maxScores["추임새/침묵"]),
          calculatePercentage(scores.목소리변동성, maxScores.목소리변동성),
          calculatePercentage(scores.머리기울기, maxScores.머리기울기),
          calculatePercentage(scores.시선분석, maxScores.시선분석),
        ],
        originalScores: [
          scores.답변평가,
          scores.표정분석,
          scores.말하기속도,
          scores["추임새/침묵"],
          scores.목소리변동성,
          scores.머리기울기,
          scores.시선분석,
        ],
        backgroundColor: 'rgba(64, 169, 255, 0.4)',
        borderColor: '#40A9FF',
        borderWidth: 2,
      },
      {
        label: '내 평균',
        data: [
          calculatePercentage(averageScores.답변평가, maxScores.답변평가),
          calculatePercentage(averageScores.표정분석, maxScores.표정분석),
          calculatePercentage(averageScores.말하기속도, maxScores.말하기속도),
          calculatePercentage(averageScores["추임새/침묵"], maxScores["추임새/침묵"]),
          calculatePercentage(averageScores.목소리변동성, maxScores.목소리변동성),
          calculatePercentage(averageScores.머리기울기, maxScores.머리기울기),
          calculatePercentage(averageScores.시선분석, maxScores.시선분석),
        ],
        originalScores: [
          averageScores.답변평가,
          averageScores.표정분석,
          averageScores.말하기속도,
          averageScores["추임새/침묵"],
          averageScores.목소리변동성,
          averageScores.머리기울기,
          averageScores.시선분석,
        ],
        backgroundColor: 'rgba(255, 165, 0, 0.4)',
        borderColor: '#FFA500',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    scales: {
      r: {
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20,
          display: true,
          backdropColor: 'transparent',
        },
        grid: {
          color: '#ddd',
        },
        angleLines: {
          color: '#aaa',
        },
        pointLabels: {
          color: '#333',
          font: {
            size: 12,
          },
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        enabled: false,
      },
    },
    maintainAspectRatio: true,
    responsive: true
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        <div className="flex-1 bg-white p-6 rounded-2xl shadow-[0_-4px_6px_-2px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="bg-yellow-100 rounded-full p-3 mr-4">
              <BarChartOutlined className="text-yellow-500 text-2xl" />
            </div>
            <h4 className="text-xl font-bold text-gray-800">종합 분석</h4>
            <Tooltip title="면접 전체 분석 및 평가">
              <InfoCircleOutlined className="ml-2 text-gray-500" />
            </Tooltip>
          </div>
          
          <div className="flex">           
            {/* 레이더 차트 */}
            <div className="w-[50%]">              
              <div className="space-y-4">
                <div style={{ width: '80%', margin: '0 auto' }}>
                  <Radar data={data} options={options} />
                </div>
              </div>
            </div>
            
            {/* 우측 */}
            <div className="w-[50%] space-y-2 flex flex-col justify-center">
              <div className="flex items-center mt-8">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-bold" style={{ color: Object.values(circleColor)[0] }}>
                      {scorePercentage.toFixed(0)}
                    </div>
                    <div className="text-lg mt-1" style={{ color: scoreLabel.color }}>
                      {scoreLabel.text}
                    </div>
                  </div>
                </div>
                <div className="w-px h-[60%] bg-gray-200 mx-7" />
                <div className="flex-1 bg-white p-6 rounded-xl">
                  <div className="flex items-center mb-4">
                    <h4 className="text-xl font-bold text-gray-800">종합 평가</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    (추후 업데이트 예정)
                    우수한 면접 실력을 보여주셨습니다. 대부분의 영역에서 좋은 평가를 받았으며, 일부 개선점을 보완하면 더욱 좋은 결과를 얻을 수 있습니다.
                    우수한 면접 실력을 보여주셨습니다. 대부분의 영역에서 좋은 평가를 받았으며, 일부 개선점을 보완하면 더욱 좋은 결과를 얻을 수 있습니다.
                  </p>
                </div>
              </div>
              <div className="w-[90%] mx-auto">
                {scoreItems.map(({ label, value, average, total }) => (
                  <div key={label} className="space-y-1.5 mb-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-semibold w-24">{label}</span>
                      <span className="text-gray-900 font-medium">
                        {value}/{total}점
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${(value / total) * 100}%`,
                            background: 'linear-gradient(90deg, #0E7CD2 0%, #36CFFB 100%)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface VideoPlayerProps {
  uid: string;
  filename: string;
  onLoad?: () => void;  // onLoad를 선택적 prop으로 추가
}


const ResultModal: React.FC<ResultModalProps> = ({ visible, onClose, analysis, averageScores }) => {
  const [activeTab, setActiveTab] = useState('tab-1');
  const [modalKey, setModalKey] = useState(0);

  useEffect(() => {
    if (visible) {
      setModalKey(prev => prev + 1);
      setActiveTab('tab-1');
    }
  }, [visible]);

  const tabItems = useMemo(() => {
    if (!analysis || !analysis.uid) return [];

    return [1, 2, 3, 4].map((num) => {
      const tabKey = `tab-${num}`;
      const videoAnalysis = analysis[analysis.uid][num.toString()];
      return {
        key: tabKey,
        label: (
          <span className="px-4">
            면접 {num}
            {videoAnalysis && (
              <span className="ml-2 text-green-500">●</span>
            )}
          </span>
        ),
        children: (
          <div className="p-4">
            {videoAnalysis ? (
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-[5.5] bg-blue-50 p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 rounded-full p-3 mr-4">
                        <FileTextOutlined className="text-blue-500 text-2xl" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-800">
                        면접 질문
                      </h4>
                      <Tooltip title="AI의 면접 질문">
                        <InfoCircleOutlined className="ml-2 text-gray-500" />
                      </Tooltip>
                    </div>
                    <p className="text-base text-gray-700 mb-6">
                      {videoAnalysis.question}
                    </p>
                    
                    <div className="border-t border-blue-200 mt-6 pt-6">
                      <div className="bg-white p-6 rounded-xl">
                        <div className="flex items-center mb-4">
                          <h5 className="text-lg font-semibold text-gray-800">내 답변</h5>
                          <Tooltip title="잡음에 따라 인식률이 상이할 수 있음">
                            <InfoCircleOutlined className="ml-2 text-gray-500" />
                          </Tooltip>
                        </div>
                        <p className="text-gray-700 text-base">
                          {videoAnalysis.답변 || "답변 데이터가 없습니다."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-[4.5] bg-white p-6 rounded-2xl shadow-[0_-4px_6px_-2px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-gray-100">
                    <div className="flex items-center mb-3">
                      <div className="bg-red-100 rounded-full p-2 mr-4">
                        <PlayCircleOutlined className="text-red-500 text-2xl" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-800">면접 영상</h4>
                    </div>
                    <div className="relative pt-[2%]">
                      {activeTab === tabKey && (
                        <VideoPlayer
                          key={`video-${analysis.uid}-${num}-${modalKey}`}
                          uid={analysis.uid}
                          filename={videoAnalysis.video_filename}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-6">
                  <EmotionAnalysis emotionData={videoAnalysis["감정_%"]} />
                  <HeadPositionAnalysis headPositions={videoAnalysis["머리기울기_%"]} />
                  <EyeTrackingAnalysis eyeTrackingData={videoAnalysis["아이트래킹_%"]} />
                  <VoiceAnalysis
                    voiceData={{
                      말하기속도: videoAnalysis.말하기속도,
                      목소리변동성: videoAnalysis.목소리변동성,
                      추임새갯수: videoAnalysis.추임새갯수,
                      침묵갯수: videoAnalysis.침묵갯수,
                    }}
                  />
                </div>

                <OverallEvaluation
                  attitudeEvaluation={generateAttitudeEvaluation(videoAnalysis.Score, videoAnalysis)}
                  answerEvaluation={{
                    strengths: videoAnalysis.Evaluation?.답변강점 || "답변 강점 데이터가 없습니다.",
                    improvements: videoAnalysis.Evaluation?.답변개선사항 || "개선사항 데이터가 없습니다.",
                    overall: videoAnalysis.Evaluation?.답변종합평가 || "종합 평가 데이터가 없습니다."
                  }}
                />
                
                <ScoreAnalysis scores={videoAnalysis.Score} averageScores={averageScores} />
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
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis, modalKey, activeTab]);

  return (
    <Modal
      key={modalKey}
      title={
        <div className="flex justify-between items-center pr-10">
          <h3 className="text-2xl font-bold">{analysis?.title}</h3>
          <p className="text-sm text-gray-500 ml-4">
            {analysis ? formatDate(analysis.time) : ""}
          </p>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={1400}
      footer={null}
      className="analysis-modal"
    >
      {analysis && analysis.uid && (
        <Tabs
          defaultActiveKey="1"
          type="card"
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          items={tabItems}
        />
      )}
    </Modal>
  );
};

export default ResultModal;