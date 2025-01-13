"use client";

import React from "react";
import { Modal, Progress, Tabs, Tooltip, Spin } from "antd";
import {
  BarChartOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  SoundOutlined,
  EyeOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Radar } from "@ant-design/plots";
import type { VideoAnalysis, ResultModalProps } from "@/app/types/interview";

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
        <div className="text-center py-8 text-gray-500">
          분석 결과가 없습니다
        </div>
      </div>
    );
  }

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

      <div className="flex flex-col items-center space-y-6">
        <div className="w-32">
          <Progress
            type="circle"
            percent={headPositions.center}
            format={(percent) => (
              <div className="text-sm">
                <div className="font-medium text-gray-600">중앙</div>
                <div className="text-blue-500 font-semibold">{percent}%</div>
              </div>
            )}
            strokeColor="#3B82F6"
            size={130}
          />
        </div>

        <div className="flex justify-between w-full px-8">
          <div className="w-1/3 flex justify-center">
            <Progress
              type="circle"
              percent={headPositions.left}
              format={(percent) => (
                <div className="text-xs text-center">
                  <div className="font-medium text-gray-600">왼쪽</div>
                  <div className="text-blue-500 font-semibold">{percent}%</div>
                </div>
              )}
              strokeColor="#3B82F6"
              size={130}
            />
          </div>

          <div className="w-1/3 flex justify-center">
            <Progress
              type="circle"
              percent={headPositions.right}
              format={(percent) => (
                <div className="text-xs text-center">
                  <div className="font-medium text-gray-600">오른쪽</div>
                  <div className="text-blue-500 font-semibold">{percent}%</div>
                </div>
              )}
              strokeColor="#3B82F6"
              size={130}
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
    "말하기속도" | "목소리변동성" | "추임새갯수" | "침묵갯수" | "음성높낮이_%"
  >;
}) => {
  const voiceAnalysisItems = [
    {
      label: "말하기 속도",
      value:
        voiceData.말하기속도 !== null
          ? `${voiceData.말하기속도.toFixed(1)}`
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
    {
      label: "음성 높낮이",
      value:
        voiceData["음성높낮이_%"] !== null
          ? `${voiceData["음성높낮이_%"].toFixed(1)}%`
          : "분석 결과 없음",
      tooltip: "음성의 높낮이 변화 정도",
    },
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

const EyeTrackingAnalysis = ({
  eyeTrackingData,
}: {
  eyeTrackingData: VideoAnalysis["아이트래킹_%"];
}) => {
  if (!eyeTrackingData) {
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
      <div className="bg-white p-6 rounded-2xl shadow-lg transform transition-all hover:scale-105">
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

  const chartData = Object.entries(emotionData)
    .map(([key, value]) => ({
      type: emotionLabels[key],
      value: value,
    }))
    .filter((item) => item.value > 0);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg transform transition-all hover:scale-105">
      <div className="flex items-center mb-4">
        <div className="bg-red-100 rounded-full p-3 mr-4">
          <BarChartOutlined className="text-red-500 text-2xl" />
        </div>
        <h4 className="text-xl font-bold text-gray-800">감정 분석</h4>
        <Tooltip title="면접 중 표정에서 감지된 감정 분석">
          <InfoCircleOutlined className="ml-2 text-gray-500" />
        </Tooltip>
      </div>

      <div className="mb-6" style={{ width: "100%", height: "200px" }}>
        <Radar
          data={chartData}
          xField="type"
          yField="value"
          meta={{
            value: {
              min: 0,
              max: 100,
            },
          }}
          tooltip={false}
          interactions={[]}
          xAxis={{
            line: null,
            tickLine: null,
          }}
          yAxis={{
            label: false,
            grid: {
              alternateColor: "rgba(0, 0, 0, 0.04)",
            },
          }}
          point={{ size: 2 }}
          area={{ smooth: true }}
          color="#3B82F6"
          lineStyle={{
            stroke: "#3B82F6",
            lineWidth: 2,
          }}
          areaStyle={{
            fill: "#3B82F6",
            fillOpacity: 0.15,
          }}
        />
      </div>

      <div className="space-y-3">
        {Object.entries(emotionData)
          .filter(([_, value]) => value > 0)
          .map(([emotion, value]) => (
            <div key={emotion} className="relative">
              <div className="flex justify-between text-sm mb-1">
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
                strokeWidth={8}
                className="custom-progress"
              />
            </div>
          ))}
      </div>
    </div>
  );
};

const ResultModal: React.FC<ResultModalProps> = ({ visible, onClose, analysis }) => {
  return (
    <Modal
      title={
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold">{analysis?.title}</h3>
          <p className="text-sm text-gray-500">
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
      {analysis && (
        <Tabs
          defaultActiveKey="1"
          type="card"
          items={[1, 2, 3, 4].map((num) => {
            const videoAnalysis = analysis[analysis.uid]?.[num.toString()];
            return {
              key: `tab-${num}`,
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
                      <div className="bg-blue-50 p-6 rounded-2xl shadow-lg">
                        <div className="flex items-center mb-4">
                          <div className="bg-blue-100 rounded-full p-3 mr-4">
                            <FileTextOutlined className="text-blue-500 text-2xl" />
                          </div>
                          <h4 className="text-xl font-bold text-gray-800">
                            면접 질문
                          </h4>
                          <Tooltip title="AI가 선택한 면접 질문">
                            <InfoCircleOutlined className="ml-2 text-gray-500" />
                          </Tooltip>
                        </div>
                        <p className="text-lg text-gray-700 mb-6">
                          {videoAnalysis.question}
                        </p>
                        
                        <div className="border-t border-blue-200 pt-4">
                          <div className="flex items-center mb-2">
                            <h5 className="text-lg font-semibold text-gray-800">내 답변</h5>
                            <Tooltip title="실제 면접에서 한 답변">
                              <InfoCircleOutlined className="ml-2 text-gray-500" />
                            </Tooltip>
                          </div>
                          <p className="text-gray-700">
                            {videoAnalysis.답변 || "답변 데이터가 없습니다."}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-6">
                        <EmotionAnalysis
                          emotionData={videoAnalysis["감정_%"]}
                        />
                        <HeadPositionAnalysis
                          headPositions={videoAnalysis["머리기울기_%"]}
                        />
                        <VoiceAnalysis
                          voiceData={{
                            말하기속도: videoAnalysis.말하기속도,
                            목소리변동성: videoAnalysis.목소리변동성,
                            추임새갯수: videoAnalysis.추임새갯수,
                            침묵갯수: videoAnalysis.침묵갯수,
                            "음성높낮이_%": videoAnalysis["음성높낮이_%"],
                          }}
                        />
                        <EyeTrackingAnalysis
                          eyeTrackingData={videoAnalysis["아이트래킹_%"]}
                        />
                      </div>
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
  );
};

export default ResultModal;