"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Spin,
  Alert,
  Button,
  Tooltip,
  Pagination,
  Modal,
  message,
} from "antd";
import {
  ClockCircleOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  RightOutlined,
  PieChartOutlined,
  StarOutlined,
  TrophyOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import getCurrentUser from "@/lib/firebase/auth_state_listener";
import ResultModal from "@/app/components/interview/result";
import { HelpCircle } from "lucide-react";

const GradeInfoPopover = () => {
  const [isOpen, setIsOpen] = useState(false);

  const gradeInfos = [
    { grade: "S", label: "매우 우수", range: "80~100점" },
    { grade: "A", label: "우수", range: "60~79점" },
    { grade: "B", label: "개선 필요", range: "40~59점" },
    { grade: "C", label: "매우 미흡", range: "0~39점" },
  ];

  const getGradeStyle = (grade: string) => {
    switch (grade) {
      case "S":
        return {
          background: "linear-gradient(135deg, #DBEAFE, #93C5FD)",
          border: "1px solid #BFDBFE",
        };
      case "A":
        return {
          background: "linear-gradient(135deg, #D1FAE5, #6EE7B7)",
          border: "1px solid #A7F3D0",
        };
      case "B":
        return {
          background: "linear-gradient(135deg, #FEF3C7, #FCD34D)",
          border: "1px solid #FDE68A",
        };
      case "C":
        return {
          background: "linear-gradient(135deg, #FEE2E2, #FCA5A5)",
          border: "1px solid #FECACA",
        };
      default:
        return {
          background: "linear-gradient(135deg, #F1F5F9, #CBD5E1)",
          border: "1px solid #E2E8F0",
        };
    }
  };

  return (
    <div className="relative inline-block">
      {/* 물음표 버튼과 텍스트 */}
      <button
        className="inline-flex items-center justify-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-50 px-3 py-1.5"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <HelpCircle size={20} />
        <span className="text-lg font-medium">점수등급기준</span>
      </button>

      {/* 팝오버 */}
      {isOpen && (
        <div className="absolute z-50 right-0 mt-2">
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-5 w-72">
            {/* 상단 화살표 */}
            <div className="absolute -top-2 right-4">
              <div className="w-2 h-2 bg-white border-l border-t border-gray-200 transform -rotate-45" />
            </div>

            {/* 등급 정보 */}
            <div className="space-y-3">
              <div className="text-base font-semibold text-gray-700 mb-3">
                등급 기준
              </div>
              {gradeInfos.map((info) => (
                <div
                  key={info.grade}
                  className="flex items-center justify-between py-1.5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center text-gray-600 text-sm font-bold"
                      style={getGradeStyle(info.grade)}
                    >
                      {info.grade}
                    </div>
                    <span className="text-sm text-gray-600">{info.label}</span>
                  </div>
                  <span className="text-sm text-gray-500">{info.range}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const calculateOverallAverages = (allResults: Analysis[]) => {
  const allScores = allResults.flatMap((analysis) => {
    const interviewData = analysis[analysis.uid];
    return Object.values(interviewData)
      .filter(
        (round: any) =>
          round?.Score &&
          Object.values(round.Score).every((score) => score !== null)
      )
      .map((round: any) => round.Score);
  });

  if (allScores.length === 0) return null;

  const average = (arr: number[]) =>
    Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1));

  return {
    말하기속도: average(allScores.map((s) => s.말하기속도)),
    "추임새/침묵": average(allScores.map((s) => s["추임새/침묵"])),
    목소리변동성: average(allScores.map((s) => s.목소리변동성)),
    표정분석: average(allScores.map((s) => s.표정분석)),
    머리기울기: average(allScores.map((s) => s.머리기울기)),
    시선분석: average(allScores.map((s) => s.시선분석)),
    답변평가: average(allScores.map((s) => s.답변평가)),
  };
};

interface ScoreLabelInfo {
  label: string;
  colors: {
    base: string;
    light: string;
    dark: string;
    text: string;
    border: string;
    glow: string;
    shine: string;
    accent: string;
  };
}

const getScoreLabelInfo = (score: number | null) => {
  if (score === null) {
    return {
      label: "분석 대기",
      grade: "P",
      colors: {
        primary: "#94A3B8",
        glass: "rgba(255, 255, 255, 0.3)",
        border: "rgba(255, 255, 255, 0.4)",
        accent: "rgba(241, 245, 249, 0.95)",
        text: "#475569",
        glow: "#94A3B8",
        shine: "rgba(255, 255, 255, 0.8)",
      },
    };
  }

  if (score >= 80) {
    return {
      label: "매우 우수",
      grade: "S",
      colors: {
        primary: "#1E40AF",
        glass: "rgba(219, 234, 254, 0.3)",
        border: "rgba(147, 197, 253, 0.4)",
        accent: "rgba(219, 234, 254, 0.95)",
        text: "#1E3A8A",
        glow: "#3B82F6",
        shine: "rgba(191, 219, 254, 0.9)",
      },
    };
  } else if (score >= 60) {
    return {
      label: "우수",
      grade: "A",
      colors: {
        primary: "#065F46",
        glass: "rgba(209, 250, 229, 0.3)",
        border: "rgba(110, 231, 183, 0.4)",
        accent: "rgba(209, 250, 229, 0.95)",
        text: "#065F46",
        glow: "#10B981",
        shine: "rgba(167, 243, 208, 0.9)",
      },
    };
  } else if (score >= 40) {
    return {
      label: "개선 필요",
      grade: "B",
      colors: {
        primary: "#92400E",
        glass: "rgba(254, 243, 199, 0.3)",
        border: "rgba(252, 211, 77, 0.4)",
        accent: "rgba(254, 243, 199, 0.95)",
        text: "#92400E",
        glow: "#F59E0B",
        shine: "rgba(253, 230, 138, 0.9)",
      },
    };
  } else {
    return {
      label: "매우 미흡",
      grade: "C",
      colors: {
        primary: "#991B1B",
        glass: "rgba(254, 226, 226, 0.3)",
        border: "rgba(252, 165, 165, 0.4)",
        accent: "rgba(254, 226, 226, 0.95)",
        text: "#991B1B",
        glow: "#EF4444",
        shine: "rgba(254, 202, 202, 0.9)",
      },
    };
  }
};

const EvaluationScore = ({ score }: { score: number | null }) => {
  const info = getScoreLabelInfo(score);

  return (
    <div className="group relative w-full aspect-square p-2">
      {/* 배경 그라데이션 */}
      <div
        className="absolute inset-0 rounded-xl bg-gradient-to-br"
        style={{
          background: `linear-gradient(135deg, ${info.colors.glow}30, transparent 60%)`,
        }}
      />

      {/* 메인 컨테이너 */}
      <div className="absolute inset-0">
        {/* 글래스 카드 */}
        <div
          className="absolute inset-0 rounded-xl backdrop-blur-xl"
          style={{
            backgroundColor: info.colors.glass,
            border: `1px solid ${info.colors.border}`,
            boxShadow: `
                 0 4px 24px -1px ${info.colors.glow}30,
                 inset 0 1px 2px ${info.colors.border}
               `,
          }}
        >
          {/* 강화된 유리 반사 효과 */}
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            {/* 메인 반사 */}
            <div
              className="absolute inset-0 opacity-80"
              style={{
                background: `
                     linear-gradient(135deg, 
                       ${info.colors.shine} -10%, 
                       transparent 30%,
                       transparent 60%,
                       ${info.colors.shine}40 120%
                     )
                   `,
              }}
            />

            {/* 상단 하이라이트 */}
            <div
              className="absolute -top-1/2 left-1/2 w-full h-full -translate-x-1/2 transform rotate-[-20deg]"
              style={{
                background: `linear-gradient(to bottom, ${info.colors.shine}, transparent)`,
              }}
            />

            {/* 측면 반사 */}
            <div
              className="absolute top-0 right-0 w-1/3 h-full"
              style={{
                background: `linear-gradient(to left, ${info.colors.shine}40, transparent)`,
              }}
            />

            {/* 깊이감을 위한 그라데이션 */}
            <div
              className="absolute inset-0"
              style={{
                background: `
                     radial-gradient(circle at 30% 30%,
                       transparent 0%,
                       ${info.colors.glass} 120%
                     )
                   `,
              }}
            />
          </div>

          {/* 상단 등급 */}
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
            <div
              className="px-4 py-1 rounded-full backdrop-blur-xl bg-white/90"
              style={{
                border: `1px solid ${info.colors.border}`,
                boxShadow: `
                     0 2px 10px -1px ${info.colors.glow}40,
                     inset 0 1px 2px ${info.colors.shine}
                   `,
              }}
            >
              <span
                className="text-xs font-bold"
                style={{ color: info.colors.text }}
              >
                {info.grade}
              </span>
            </div>
          </div>

          {/* 점수 표시 */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              textShadow: `0 2px 4px ${info.colors.glow}40`,
            }}
          >
            <span
              className="text-2xl font-bold"
              style={{ color: info.colors.primary }}
            >
              {score !== null ? `${score}점` : "-"}
            </span>
          </div>

          {/* 하단 라벨 */}
          <div className="absolute bottom-0 left-0 right-0">
            <div
              className="w-full py-1 flex justify-center backdrop-blur-xl"
              style={{
                backgroundColor: info.colors.accent,
                borderBottomLeftRadius: "0.75rem",
                borderBottomRightRadius: "0.75rem",
                borderTop: `1px solid ${info.colors.border}`,
              }}
            >
              <span
                className="text-[10px] font-bold"
                style={{ color: info.colors.text }}
              >
                {info.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AnalysisCardProps {
  title: string;
  time: string;
  videoAnalysis: {
    [key: string]:
      | {
          video_number: number;
          video_filename: string;
          question: string;
          Score?: {
            말하기속도: number;
            "추임새/침묵": number;
            목소리변동성: number;
            표정분석: number;
            머리기울기: number;
            시선분석: number;
            답변평가: number;
          };
          [key: string]: any;
        }
      | undefined;
  };
  onCardClick: () => void;
  onDelete: (id: string, uid: string) => void;
  analysisId: string; // MongoDB ID 문자열
  uid: string;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({
  title,
  time,
  videoAnalysis,
  onCardClick,
  onDelete,
  analysisId,
  uid,
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!analysisId) {
      console.error("Invalid analysisId:", analysisId);
      message.error("삭제할 수 없는 분석입니다.");
      return;
    }

    Modal.confirm({
      title: "면접 결과 삭제",
      icon: <ExclamationCircleOutlined />,
      content:
        "이 면접 결과를 정말 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.",
      okText: "삭제",
      okType: "danger",
      cancelText: "취소",
      onOk() {
        // console.log("Deleting analysis:", {
        //   analysisId: analysisId, // $oid 값만 넘겨줌
        //   uid,
        // });
        onDelete(analysisId, uid); // analysisId.$oid 값만 넘기기
      },
    });
  };

  const calculateTotalScore = (roundData: any) => {
    if (!roundData?.Score) return null;

    const scores = [
      roundData.Score.말하기속도,
      roundData.Score["추임새/침묵"],
      roundData.Score.목소리변동성,
      roundData.Score.표정분석,
      roundData.Score.머리기울기,
      roundData.Score.시선분석,
      roundData.Score.답변평가,
    ];

    const validScores = scores.filter(
      (score) => score !== null && !isNaN(score)
    );
    if (validScores.length === 0) return null;

    return Math.round(validScores.reduce((a, b) => a + b, 0));
  };

  return (
    <Card
      className="rounded-xl overflow-hidden transition-all duration-500 shadow-lg backdrop-blur-sm"
      style={{
        background:
          "linear-gradient(to right, rgba(255,255,255,0.9), rgba(248,250,252,0.9))",
        boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Delete button positioned absolutely */}
      <Tooltip title="면접 결과 삭제" placement="left">
        <Button
          type="text"
          danger
          icon={<DeleteOutlined className="text-lg" />}
          className="absolute top-0 right-0 p-3 hover:bg-red-50 z-20"
          style={{
            position: "absolute",
            width: "50px",
            height: "50px",
            borderRadius: "0 0 0 12px",
          }}
          onClick={handleDelete}
        />
      </Tooltip>

      <div className="space-y-3">
        {/* 헤더 섹션 */}
        {/* 헤더 섹션 */}
        <div className="relative px-4 pt-4 pb-2">
          <div className="absolute top-0 left-4 right-4 h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 opacity-80"></div>
          <div className="flex flex-col space-y-1">
            {/* 시간을 우측 정렬로 표시 */}
            <div className="flex justify-end">
              <div className="flex items-center text-gray-500">
                <ClockCircleOutlined className="text-sm opacity-70 mr-1" />
                <p className="text-xs font-medium tracking-tight">{time}</p>
              </div>
            </div>
            {/* 제목 */}
            <h3 className="text-lg font-extrabold text-gray-800 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-indigo-600">
              {title}
            </h3>
            <div className="h-[1px] w-full bg-gradient-to-r from-sky-200/50 to-indigo-200/50 opacity-50 mt-1"></div>
          </div>
        </div>

        {/* 분석 상태 표시 */}
        <div className="grid grid-cols-4 gap-1.5">
          {Object.keys(videoAnalysis).map((key) => {
            const roundData = videoAnalysis[key];
            const isAnalyzed = roundData?.Score !== undefined;

            return (
              <div
                key={`status-${key}`}
                className={`
                  flex flex-col items-center p-2 rounded-lg
                  transition-all duration-300 hover:scale-[1.02]
                  ${
                    isAnalyzed
                      ? "bg-gradient-to-br from-sky-50 to-indigo-50 text-sky-600 border border-sky-100"
                      : "bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 border border-amber-100"
                  }
                `}
              >
                <span className="text-xs font-semibold mb-1">질문 {key}</span>
                <div className="flex items-center text-[10px] font-medium">
                  {isAnalyzed ? (
                    <>
                      <CheckCircleOutlined className="mr-0.5 animate-fadeIn" />
                      <span>분석완료</span>
                    </>
                  ) : (
                    <>
                      <SyncOutlined spin className="mr-0.5" />
                      <span>분석중</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 메달 표시 섹션 */}
        <div className="grid grid-cols-4 gap-1.5">
          {Object.keys(videoAnalysis).map((key) => {
            const roundData = videoAnalysis[key];
            const totalScore = roundData
              ? calculateTotalScore(roundData)
              : null;

            return (
              <div key={`round-${key}`}>
                <EvaluationScore score={totalScore} />
              </div>
            );
          })}
        </div>

        {/* 상세보기 버튼 */}
        <button
          className="
            w-full px-3 py-2 mt-2
            bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500
            text-white rounded-lg
            transition-all duration-300
            flex items-center justify-center
            space-x-2 text-sm font-medium
            group
            relative overflow-hidden
          "
          onClick={(e) => {
            e.stopPropagation();
            onCardClick();
          }}
        >
          <span className="relative z-10">결과 상세보기</span>
          <RightOutlined className="relative z-10 group-hover:translate-x-1 transition-transform" />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
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

const calculateTotalScores = (analysis: Analysis | null) => {
  if (!analysis) return null;

  const interviewData = analysis[analysis.uid];
  const allScores = Object.values(interviewData)
    .filter((round: any) => round?.Score)
    .map((round: any) => {
      const scores = [
        round.Score.말하기속도,
        round.Score["추임새/침묵"],
        round.Score.목소리변동성,
        round.Score.표정분석,
        round.Score.머리기울기,
        round.Score.시선분석,
        round.Score.답변평가,
      ];

      return {
        말하기속도: round.Score.말하기속도,
        "추임새/침묵": round.Score["추임새/침묵"],
        목소리변동성: round.Score.목소리변동성,
        표정분석: round.Score.표정분석,
        머리기울기: round.Score.머리기울기,
        시선분석: round.Score.시선분석,
        답변평가: round.Score.답변평가,
      };
    });

  if (allScores.length === 0) return null;

  // 첫 번째 라운드의 점수를 반환 (모달에서 사용)
  return allScores[0];
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
  const [globalAverages, setGlobalAverages] = useState<{
    태도평가: number;
    답변평가: number;
    총점수: number;
    timestamp?: Date;
    date?: {
      year: number;
      month: number;
      day: number;
    };
    데이터수?: number;
  } | null>(null);
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const handleDeleteAnalysis = async (analysisId: string, uid: string) => {
    if (!analysisId) {
      message.error("유효하지 않은 분석 ID입니다.");
      return;
    }

    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        message.error("로그인이 필요합니다.");
        return;
      }

      const token = await currentUser.getIdToken();
      const response = await fetch(`/api/interview/result_request`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          analysisId,
          uid: currentUser.uid,
        }),
      });

      if (!response.ok) {
        throw new Error("삭제 요청 실패");
      }

      // 서버 응답이 성공일 때 UI 업데이트
      setAnalysisResults((prevResults) => {
        const updatedResults = prevResults.filter((result) => {
          const resultId = result._id?.$oid || result._id;
          return resultId !== analysisId;
        });

        // 현재 페이지의 아이템 수 계산
        const currentPageItems = updatedResults.slice(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage
        );

        // 현재 페이지가 비어있다면 이전 페이지로 이동
        if (currentPageItems.length === 0 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }

        return updatedResults;
      });

      message.success("성공적으로 삭제되었습니다!");
    } catch (error) {
      console.error("삭제 에러:", error);
      message.error("삭제 중 문제가 발생했습니다.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
          const token = await currentUser.getIdToken();

          const [userResponse, globalResponse] = await Promise.all([
            fetch(`/api/interview/result_request?uid=${currentUser.uid}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
            fetch(`/api/interview/global_averages`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

          if (!userResponse.ok || !globalResponse.ok) {
            throw new Error("데이터를 불러오는데 실패했습니다");
          }

          const userData = await userResponse.json();
          const globalData = await globalResponse.json();

          // 결과가 배열인지 확인
          if (!Array.isArray(userData)) {
            throw new Error("잘못된 분석 결과 형식");
          }

          // timestamp 기준으로 정렬
          const sortedData = userData.sort(
            (a: Analysis, b: Analysis) =>
              new Date(b.time).getTime() - new Date(a.time).getTime()
          );

          setAnalysisResults(sortedData);
          setGlobalAverages(globalData);
        }
      } catch (err) {
        console.error("Error details:", err);
        setError("분석 결과를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 페이지네이션 로직
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedResults = analysisResults.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(analysisResults.length / itemsPerPage);

  const handleLoginRedirect = () => {
    router.push("/mypage");
  };

  const calculatePerformanceStats = () => {
    if (analysisResults.length === 0 || !globalAverages) return null;

    // 내 평균 계산
    const myAverages = analysisResults.flatMap((analysis) => {
      const interviewData = analysis[analysis.uid];
      if (!interviewData) return [];

      return Object.values(interviewData)
        .filter((round: any) => {
          // Score 객체가 있는지 확인
          if (!round?.Score) return false;

          // 필요한 모든 필드가 존재하고 유효한 값인지 확인
          const requiredFields = [
            "말하기속도",
            "추임새/침묵",
            "목소리변동성",
            "표정분석",
            "머리기울기",
            "시선분석",
            "답변평가",
          ];

          return requiredFields.every((field) => {
            const value = round.Score[field];
            return value !== undefined && value !== null && !isNaN(value);
          });
        })
        .map((round: any) => {
          // 태도 평가 항목들만 필터링하여 계산
          const attitudeScores = [
            round.Score.말하기속도,
            round.Score["추임새/침묵"],
            round.Score.목소리변동성,
            round.Score.표정분석,
            round.Score.머리기울기,
            round.Score.시선분석,
          ];

          // 태도 점수 총합 계산
          const totalAttitudeScore = Math.round(
            attitudeScores.reduce((a, b) => a + b, 0)
          );

          return {
            attitudeScore: totalAttitudeScore,
            answerScore: round.Score.답변평가,
          };
        });
    });

    const average = (scores: number[]) =>
      scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) /
          10
        : 0;

    const myAvg = {
      attitudeScore: average(myAverages.map((score) => score.attitudeScore)),
      answerScore: average(myAverages.map((score) => score.answerScore)),
    };

    return [
      {
        icon: <StarOutlined />,
        label: "태도 평가",
        value: myAvg.attitudeScore,
        globalValue: globalAverages.태도평가,
      },
      {
        icon: <TrophyOutlined />,
        label: "답변 평가",
        value: myAvg.answerScore,
        globalValue: globalAverages.답변평가,
      },
    ];
  };

  const performanceStats = calculatePerformanceStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Spin size="large" className="custom-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center bg-white p-10 rounded-2xl shadow-2xl max-w-md w-full transform transition-all hover:scale-105">
          <ClockCircleOutlined className="text-6xl text-blue-500 mb-6 animate-pulse" />
          <p className="text-xl text-gray-700 mb-6">
            면접 분석 결과는 로그인 후 확인할 수 있습니다.
          </p>
          <Button
            type="primary"
            size="large"
            onClick={handleLoginRedirect}
            className="px-10 py-3 text-base hover:scale-105 transition-transform"
          >
            로그인 하러 가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pt-8">
      <div className="max-w-[1420px] mx-auto px-8 space-y-4">
        {/* 메인 대시보드 카드 */}
        <div className="relative bg-white/80 rounded-3xl overflow-hidden backdrop-blur-md shadow-xl border border-white/50">
          {/* 배경 효과 */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-32 
                           bg-gradient-to-r from-blue-300/10 via-indigo-300/10 to-purple-300/10 rotate-12 scale-150"
            />
          </div>

          <div className="relative p-5 space-y-4">
            {/* 상단 헤더 */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-start space-x-3">
                <div
                  className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 
                              rounded-2xl backdrop-blur-sm border border-white/50 shadow-inner"
                >
                  <ClockCircleOutlined className="text-blue-600 text-3xl" />
                </div>
                <div>
                  <h1
                    className="text-3xl font-bold bg-clip-text text-transparent 
                               bg-gradient-to-r from-gray-800 to-gray-600"
                  >
                    면접 분석 대시보드
                  </h1>
                  <p className="text-gray-600 mt-1 flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    최근 100일 분석 결과
                  </p>
                  {/* 경고문 추가 */}
                  <p className="text-sm text-gray-600/100 italic pt-3">
                    AI 면접 분석 결과는 카메라 각도, 조명, 장비 성능 등 환경적
                    요인에 따라 다소 차이가 있을 수 있습니다. 제공된 데이터는
                    면접 준비를 위한 참고 자료로 활용해 주시기 바랍니다.
                  </p>
                </div>
              </div>

              <Button
                onClick={() => router.push("/ai-interview/evaluation")}
                className="group bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-none
                           px-6 py-5 text-base font-medium hover:shadow-lg hover:opacity-90 
                           transition-all duration-300 rounded-xl flex items-center gap-1"
              >
                새 면접 시작
                <RightOutlined className="group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>

            {/* 메인 통계 섹션 */}
            <div className="grid grid-cols-12 gap-4">
              {/* 면접 횟수 카드 */}
              <div className="col-span-12 md:col-span-4">
                <div
                  className="bg-gradient-to-br from-white/80 to-blue-50/80 rounded-2xl p-4 
                              shadow-sm backdrop-blur-sm border border-white/50 
                              hover:shadow-md transition-all duration-300
                              group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700">
                        총 면접 횟수
                      </h3>
                      <p className="text-sm text-gray-500">나의 성장 기록</p>
                    </div>
                    <div
                      className="p-2 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 
                                  rounded-xl group-hover:scale-110 transition-transform duration-300"
                    >
                      <FileTextOutlined className="text-blue-500 text-xl" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-4xl font-bold bg-clip-text text-transparent 
                                  bg-gradient-to-r from-blue-600 to-indigo-600"
                    >
                      {analysisResults.length}
                    </span>
                    <span className="text-gray-600">회</span>
                  </div>
                </div>
              </div>

              {/* 통합 평가 점수 카드 */}
              <div className="col-span-12 md:col-span-8">
                <div
                  className="bg-gradient-to-br from-white/80 to-blue-50/80 rounded-2xl p-4 
                              shadow-sm backdrop-blur-sm border border-white/50 
                              hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700">
                        평가 점수 분석
                      </h3>
                      <p className="text-sm text-gray-500">
                        나의 평균 vs 전체 평균
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                        <span className="text-sm text-gray-600">나의 점수</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-gray-400" />
                        <span className="text-sm text-gray-600">전체 평균</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-２">
                    {performanceStats &&
                      performanceStats.map((stat, index) => (
                        <div key={index} className="group">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-１">
                              <div className="p-2 bg-blue-50 rounded-lg">
                                {stat.icon}
                              </div>
                              <span className="text-base font-medium text-gray-700">
                                {stat.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <span className="text-lg font-bold text-blue-600">
                                    {stat.value}
                                  </span>
                                  <span className="text-sm text-gray-400 ml-1">
                                    /50
                                  </span>
                                </div>
                                <div className="h-8 w-px bg-gray-200" />
                                <div className="text-right">
                                  <span className="text-base text-gray-600">
                                    {stat.globalValue}
                                  </span>
                                  <span className="text-sm text-gray-400 ml-1">
                                    /50
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`min-w-[3rem] text-right text-sm font-medium ${
                                  stat.value > stat.globalValue
                                    ? "text-green-500"
                                    : stat.value < stat.globalValue
                                    ? "text-red-500"
                                    : "text-gray-500"
                                }`}
                              >
                                {stat.value > stat.globalValue && "+"}
                                {(stat.value - stat.globalValue).toFixed(1)}
                              </span>
                            </div>
                          </div>

                          {/* 향상된 프로그레스 바 */}
                          <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                            {/* 배경 애니메이션 */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 animate-pulse" />

                            {/* 메인 프로그레스 바 */}
                            <div
                              className="absolute top-0 left-0 h-full rounded-full
                                     transition-all duration-1000 ease-out group-hover:opacity-90
                                     bg-gradient-to-r from-blue-500 to-indigo-500"
                              style={{ width: `${(stat.value / 50) * 100}%` }}
                            >
                              {/* 반짝이는 효과 */}
                              <div
                                className="absolute inset-0 opacity-50 bg-gradient-to-r from-transparent 
                                          via-white to-transparent shimmer-animation"
                              />
                            </div>

                            {/* 전체 평균 마커 */}
                            <div
                              className="absolute top-1/2 -translate-y-1/2 h-full w-0.8 bg-blue-500 transition-all duration-1000"
                              style={{
                                left: `${(stat.globalValue / 50) * 100}%`,
                              }}
                            >
                              {/* 펄스 이펙트 */}
                              <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-4 bg-gray-500 rounded-full animate-ping" />
                              {/* 마커 점 */}
                              <div className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-4 bg-gray-500 rounded-full shadow-lg" />
                            </div>
                          </div>
                        </div>
                      ))}

                    {/* 총점 섹션 */}
                    <div className="pt-4 mt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-800">
                          총점
                        </span>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span
                                className="text-2xl font-bold bg-clip-text text-transparent 
                                          bg-gradient-to-r from-blue-600 to-indigo-600"
                              >
                                {performanceStats
                                  ? Math.round(
                                      performanceStats.reduce(
                                        (acc, stat) => acc + stat.value,
                                        0
                                      ) * 10
                                    ) / 10
                                  : 0}
                              </span>
                              <span className="text-sm text-gray-400 ml-1">
                                /100
                              </span>
                            </div>
                            <div className="h-8 w-px bg-gray-200" />
                            <div className="text-right">
                              <span className="text-xl text-gray-600">
                                {performanceStats
                                  ? Math.round(
                                      performanceStats.reduce(
                                        (acc, stat) => acc + stat.globalValue,
                                        0
                                      ) * 10
                                    ) / 10
                                  : 0}
                              </span>
                              <span className="text-sm text-gray-400 ml-1">
                                /100
                              </span>
                            </div>
                          </div>
                          <span
                            className={`min-w-[3rem] text-right text-sm font-medium ${
                              performanceStats
                                ? Math.round(
                                    performanceStats.reduce(
                                      (acc, stat) => acc + stat.value,
                                      0
                                    ) * 10
                                  ) /
                                    10 >
                                  Math.round(
                                    performanceStats.reduce(
                                      (acc, stat) => acc + stat.globalValue,
                                      0
                                    ) * 10
                                  ) /
                                    10
                                  ? "text-green-500"
                                  : "text-red-500"
                                : "text-gray-500"
                            }`}
                          >
                            {performanceStats && (
                              <>
                                {Math.round(
                                  performanceStats.reduce(
                                    (acc, stat) => acc + stat.value,
                                    0
                                  ) * 10
                                ) /
                                  10 >
                                  Math.round(
                                    performanceStats.reduce(
                                      (acc, stat) => acc + stat.globalValue,
                                      0
                                    ) * 10
                                  ) /
                                    10 && "+"}
                                {Math.round(
                                  (performanceStats.reduce(
                                    (acc, stat) => acc + stat.value,
                                    0
                                  ) -
                                    performanceStats.reduce(
                                      (acc, stat) => acc + stat.globalValue,
                                      0
                                    )) *
                                    10
                                ) / 10}
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

        <div className="bg-white/80 rounded-3xl overflow-hidden backdrop-blur-md shadow-lg border border-white/50 p-6">
          <div className="flex items-center gap-5 mb-6">
            <h2 className="text-3xl font-bold text-gray-800">상세 분석 결과</h2>
            <GradeInfoPopover />
          </div>

          {analysisResults.length === 0 ? (
            <div className="text-center py-12">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {paginatedResults.map((analysis) => {
                  // console.log("Analysis Item:", analysis); // 전체 분석 결과 로그 출력
                  // console.log("Analysis _id:", analysis._id); // _id 로그 출력
                  const analysisId =
                    typeof analysis._id === "object"
                      ? analysis._id?.$oid
                      : analysis._id;
                  const uniqueKey =
                    analysis._id?.$oid || `${analysis.uid}-${analysis.time}`;

                  return (
                    <AnalysisCard
                      key={uniqueKey}
                      analysisId={analysisId} // 전체 _id 객체 전달
                      uid={analysis.uid}
                      title={analysis.title}
                      time={formatDate(analysis.time)}
                      videoAnalysis={analysis[analysis.uid]}
                      onCardClick={() => {
                        setSelectedAnalysis(analysis);
                        setModalVisible(true);
                      }}
                      onDelete={handleDeleteAnalysis}
                    />
                  );
                })}
              </div>

              <div className="flex justify-center mt-8">
                <Pagination
                  current={currentPage}
                  total={analysisResults.length}
                  pageSize={itemsPerPage}
                  onChange={(page) => setCurrentPage(page)}
                  showSizeChanger={false}
                  className="custom-pagination"
                />
              </div>
            </>
          )}
        </div>

        <style jsx global>{`
          @keyframes shine {
            from {
              transform: translateX(-100%) rotate(45deg);
            }
            to {
              transform: translateX(200%) rotate(45deg);
            }
          }
          @keyframes pulse {
            0%,
            100% {
              transform: scale(1);
              opacity: 0.5;
            }
            50% {
              transform: scale(1.05);
              opacity: 0.8;
            }
          }
          @keyframes rotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          .medal-shine {
            animation: shine 3s infinite linear;
          }
          .medal-pulse {
            animation: pulse 2s infinite ease-in-out;
          }
          .medal-rotate {
            animation: rotate 20s infinite linear;
          }
        `}</style>

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
