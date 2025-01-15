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
import type { VideoAnalysis, ResultModalProps } from "@/app/types/interview";
import  VideoPlayer from '@/app/components/interview/videoplayer';
import React, { useState, useEffect, useMemo } from "react";


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
      value:
        voiceData.말하기속도 !== null
          ? `${voiceData.말하기속도.toFixed(0)+" WPM"}`
          : "분석 결과 없음",
      tooltip: "발화 속도에 대한 분석",
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
  content: string | {
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
}) => {
  const evaluations = [];

  // 말하기 속도 평가
  evaluations.push(
    "【말하기 속도】\n" + (scores.말하기속도 >= 8
      ? "적절한 속도로 말하고 있어 면접관이 내용을 이해하기 쉽습니다. 말하기 속도가 너무 빠르거나 느리면 면접관이 내용을 놓칠 수 있으니, 이 점을 잘 유지하세요. 지속적으로 자신만의 자연스러운 말하기 속도를 유지하는 것이 중요합니다."
      : scores.말하기속도 >= 5
      ? "말하기 속도가 약간 빠르거나 느립니다. 속도 조절에 주의를 기울이세요. 면접관이 내용을 정확히 파악할 수 있도록 일정한 속도를 유지하려는 노력이 필요합니다."
      : "말하기 속도가 너무 빠르거나 느립니다. 면접관의 이해를 돕기 위해 속도 조절이 필요합니다. 너무 빠르면 내용을 놓칠 수 있고, 너무 느리면 지루함을 유발할 수 있으니 균형을 맞추는 것이 중요합니다."
    )
  );

  // 추임새/침묵 갯수 평가
  evaluations.push(
    "【추임새와 침묵】\n" + (scores["추임새/침묵"] >= 8
      ? "추임새와 침묵을 적절히 사용하여 자연스러운 대화 흐름을 유지하고 있습니다. 이는 면접관과의 원활한 소통에 크게 기여하며, 긴장을 완화시키는 데 도움이 됩니다. 이러한 적절한 사용은 당신의 대화 능력을 잘 보여줍니다."
      : scores["추임새/침묵"] >= 5
      ? "추임새나 침묵이 약간 많습니다. 줄이려는 노력이 필요합니다. 너무 많은 추임새는 대화의 흐름을 방해할 수 있으니, 보다 신중하게 선택하여 사용하는 것이 좋습니다."
      : "추임새나 침묵이 너무 많아 대화의 흐름을 방해합니다. 이를 줄이는 연습이 필요합니다. 자연스러운 대화를 위해 불필요한 추임새와 침묵을 피하는 것이 좋습니다."
    )
  );

  // 목소리 변동성 평가
  evaluations.push(
    "【목소리 변화】\n" + (scores.목소리변동성 >= 8
      ? "적절한 목소리 변동성으로 생동감 있게 말하고 있습니다. 이는 면접관에게 긍정적인 인상을 주며, 듣는 이의 관심을 끌기에 충분합니다. 목소리의 높낮이를 효과적으로 활용하고 있어 매우 좋습니다."
      : scores.목소리변동성 >= 5
      ? "목소리 변동성이 약간 과도합니다. 더 자연스러운 억양을 연습하세요. 목소리의 높낮이를 적절하게 조절하여 대화의 리듬을 맞추는 것이 중요합니다."
      : "목소리 변동성이 지나치게 과도합니다. 청취자의 집중을 방해할 수 있으니 개선이 필요합니다. 목소리의 자연스러운 흐름을 유지하여 보다 신뢰감 있는 대화를 이끌어 나가세요."
    )
  );

  // 표정 분석 평가
  evaluations.push(
    "【표정 분석】\n" + (scores.표정분석 >= 8
      ? "적절한 표정으로 자신감과 긍정적인 태도를 잘 표현하고 있습니다. 이는 면접관에게 긍정적인 인상을 주고, 신뢰성을 높이는 데 도움이 됩니다. 표정을 통해 전달되는 감정이 효과적으로 표현되고 있습니다."
      : scores.표정분석 >= 5
      ? "표정이 다소 단조롭거나 과도합니다. 더 자연스러운 표정 관리가 필요합니다. 적절한 표정을 통해 자신의 감정과 태도를 조절하며, 면접관과의 비언어적 소통을 향상시켜 보세요."
      : "부정적이거나 부적절한 표정이 많습니다. 표정 관리에 주의를 기울이세요. 부정적인 표정은 면접관에게 좋지 않은 인상을 줄 수 있으니, 긍정적이고 자연스러운 표정을 유지하는 것이 중요합니다."
    )
  );

  // 머리 기울기 평가
  evaluations.push(
    "【머리 기울기】\n" + (scores.머리기울기 >= 4
      ? "고개를 바르게 유지하여 자신감과 집중도를 잘 보여주고 있습니다. 이는 면접관에게 신뢰감을 주고, 대화의 집중도를 높이는 데 기여합니다. 안정적인 자세가 긍정적인 인상을 남깁니다."
      : scores.머리기울기 >= 2
      ? "때때로 고개가 기울어집니다. 더 안정적인 자세를 유지하려 노력하세요. 고개를 바르게 유지하는 것은 자신감을 나타내는 중요한 요소입니다. 자세를 바로 잡아 더욱 긴장감 없는 모습을 보여주세요."
      : "고개가 자주 기울어져 불안정해 보입니다. 자세 교정이 필요합니다. 안정적인 자세는 면접관에게 긍정적인 인상을 줄 수 있으며, 자신감 있는 태도를 전달하는 데 중요합니다."
    )
  );

  // 시선분석 평가
  evaluations.push(
    "【시선 처리】\n" + (scores.시선분석 >= 4
      ? "적절한 시선 처리로 집중력과 자신감을 잘 표현하고 있습니다. 이는 면접관과의 연결을 강화하고, 대화의 신뢰성을 높이는 데 도움이 됩니다. 자연스럽게 면접관을 바라보며 소통하고 있습니다."
      : scores.시선분석 >= 2
      ? "시선 처리가 다소 불안정합니다. 더 일관된 시선 유지를 연습하세요. 일관된 시선 처리는 대화의 집중도를 높이는 데 중요하며, 면접관과의 신뢰 관계를 형성하는 데 기여합니다."
      : "시선 회피가 잦거나 눈 깜빡임이 과도합니다. 시선 관리에 주의를 기울이세요. 안정된 시선 처리는 면접에서의 자신감과 진정성을 전달하는 데 중요한 역할을 합니다."
    )
  );

  return evaluations.join("\n\n");
};

const OverallEvaluation = ({
  attitudeEvaluation,
  answerEvaluation,
}: {
  attitudeEvaluation: string;
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

const ScoreAnalysis = ({
  scores,
  analysis
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
  analysis: any;
}) => {
  const calculateAverageScores = () => {
    const allScores = Object.values(analysis).map(interview => 
      interview && typeof interview === 'object' ? 
        Object.values(interview).map(round => round?.Score) : 
        []
    ).flat().filter(score => {
      return score && Object.values(score).every(val => val !== null);
    });

    const recentScores = allScores.slice(-10);

    if (recentScores.length === 0) return null;

    return {
      말하기속도: average(recentScores.map(s => s.말하기속도)),
      "추임새/침묵": average(recentScores.map(s => s["추임새/침묵"])),
      목소리변동성: average(recentScores.map(s => s.목소리변동성)),
      표정분석: average(recentScores.map(s => s.표정분석)),
      머리기울기: average(recentScores.map(s => s.머리기울기)),
      시선분석: average(recentScores.map(s => s.시선분석)),
      답변평가: average(recentScores.map(s => s.답변평가))
    };
  };

  const average = (arr: number[]) => 
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const averageScores = calculateAverageScores();

  const scoreItems = [
    { label: "답변 평가", value: scores.답변평가, maxScore: 50 },
    { label: "표정 분석", value: scores.표정분석, maxScore: 10 },
    { label: "말하기 속도", value: scores.말하기속도, maxScore: 10 },
    { label: "추임새/침묵", value: scores["추임새/침묵"], maxScore: 10 },
    { label: "목소리 변동성", value: scores.목소리변동성, maxScore: 10 },
    { label: "머리 기울기", value: scores.머리기울기, maxScore: 5 },
    { label: "시선 분석", value: scores.시선분석, maxScore: 5 },
  ];

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const maxPossibleScore = 100;
  const percentage = Math.round((totalScore / maxPossibleScore) * 100);

  const getCircleColor = (score: number) => {
    if (score >= 90) return {
      '0%': '#52C41A',    // 밝은 초록
      '50%': '#73D13D',   // 중간 초록 (더 밝게)
      '100%': '#95DE64'   // 연한 초록 (더 밝게)
    };
    if (score >= 80) return {
      '0%': '#1890FF',    // 은 파랑
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

  return (
    <div className="bg-white p-6 rounded-2xl shadow-[0_-4px_6px_-2px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-gray-100">
      <div className="flex items-center mb-6">
        <div className="bg-yellow-100 rounded-full p-3 mr-4">
          <BarChartOutlined className="text-yellow-500 text-2xl" />
        </div>
        <h4 className="text-xl font-bold text-gray-800">종합 분석 점수</h4>
        <Tooltip title="각 항목별 분석 점수">
          <InfoCircleOutlined className="ml-2 text-gray-500" />
        </Tooltip>
      </div>

      <div className="flex relative">
        <div className="w-1/3 flex flex-col items-center justify-center relative">
          <Progress
            type="circle"
            percent={percentage}
            size={250}
            strokeColor={getCircleColor(percentage)}
            strokeWidth={12}
            format={() => (
              <div className="text-center">
                <div className="text-5xl font-bold" style={{ color: getScoreLabel(percentage).color }}>
                  {percentage}
                </div>
                <div className="text-lg font-semibold mt-1" style={{ color: getScoreLabel(percentage).color }}>
                  {getScoreLabel(percentage).text}
                </div>
              </div>
            )}
          />
          <div 
            className="absolute w-[220px] h-[220px] rounded-full"
            style={{
              background: `conic-gradient(from 0deg, ${getScoreLabel(percentage).color}22 0%, transparent ${percentage}%, transparent 100%)`,
              filter: 'blur(8px)',
              zIndex: -1
            }}
          />
        </div>

        <div className="w-px bg-gray-300 mx-8" />

        <div className="flex-1 space-y-4">
          <div className="flex justify-end gap-4 mb-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{background: 'linear-gradient(90deg, #0E7CD2 0%, #36CFFB 100%)'}}></div>
              <span className="text-gray-600">현재 면접 영상</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{background: 'linear-gradient(90deg, #FF6347 0%, #FFA500 100%)'}}></div>
              <span className="text-gray-600">최근 10회 평균</span>
            </div>
          </div>
          
          {scoreItems.map(({ label, value, maxScore }) => (
            <div key={label} className="relative">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-semibold text-gray-800 w-24">{label}</span>
                <span className="font-normal text-gray-800">
                  {value}/{maxScore}점
                </span>
              </div>
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${(value / maxScore) * 100}%`,
                    background: 'linear-gradient(90deg, #0E7CD2 0%, #36CFFB 100%)',
                  }}
                />
              </div>
              {averageScores && (
                <div className="relative h-2 mt-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${(averageScores[label.replace(/ /g, '') as keyof typeof averageScores] / maxScore) * 100}%`,
                      background: 'linear-gradient(90deg, #FF6347 0%, #FFA500 100%)',
                    }}
                  />
                </div>
              )}
            </div>
          ))}
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


const ResultModal: React.FC<ResultModalProps> = ({ visible, onClose, analysis }) => {
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
                  attitudeEvaluation={generateAttitudeEvaluation(videoAnalysis.Score)}
                  answerEvaluation={{
                    strengths: videoAnalysis.Evaluation?.답변강점 || "답변 강점 데이터가 없습니다.",
                    improvements: videoAnalysis.Evaluation?.답변개선사항 || "개선사항 데이터가 없습니다.",
                    overall: videoAnalysis.Evaluation?.답변종합평가 || "종합 평가 데이터가 없습니다."
                  }}
                />
                
                <ScoreAnalysis scores={videoAnalysis.Score} analysis={analysis} />
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