"use client";

import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Button } from "antd";
import { motion } from "framer-motion";
import { Clock, CheckCircle, Timer } from "lucide-react";

// 기존 인터페이스들
interface InterviewData {
  userUid: string;
  resumeUid: string;
  job_code: string;
  company?: string;
  resume_title: string;
  questions: string[];
  videoFiles: File[];
  generatedQuestions?: string[];
  interviewMode: "practice" | "mock";
  data: {
    question: string;
    answer: string;
  }[];
}

interface ProgressProps {
  stream: MediaStream;
  interviewData: InterviewData;
  status: string;
}

// 시간 설정 관련 새로운 인터페이스들
interface TimeOption {
  value: number;
  label: string;
}

interface TimeSelectorProps {
  type: "preparation" | "answer";
  value: number;
  options: TimeOption[];
  onChange: (type: "preparation" | "answer", value: number) => void;
}

interface UploadModalProps {
  showUploadModal: boolean;
  uploadError: string | null;
  uploadProgress: number;
}

// TimeSelector 컴포넌트
const TimeSelector: React.FC<TimeSelectorProps> = ({
  type,
  value,
  options,
  onChange,
}) => (
  <div className="grid grid-cols-3 gap-2">
    {" "}
    {/* gap 줄임 */}
    {options.map((option) => (
      <button
        key={option.value}
        onClick={() => onChange(type, option.value)}
        className={`
          relative overflow-hidden rounded-lg p-2 transition-all duration-300  // 패딩 줄임
          ${
            value === option.value
              ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md scale-105"
              : "bg-white hover:bg-blue-50 text-gray-600 hover:text-blue-600"
          }
        `}
      >
        <div className="relative z-10">
          <span className="block text-base font-semibold">{option.label}</span>{" "}
          {/* 폰트 크기 줄임 */}
        </div>
        {value === option.value && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </button>
    ))}
  </div>
);

// AudioVisualizer 컴포넌트
function AudioVisualizer({ stream }: { stream: MediaStream }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const animationFrameId = useRef<number>();

  useEffect(() => {
    const audioCtx = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 256;

    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyserNode);

    setAudioContext(audioCtx);
    setAnalyser(analyserNode);

    return () => {
      if (audioCtx.state !== "closed") {
        audioCtx.close();
      }
    };
  }, [stream]);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.style.background = "transparent";
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const draw = () => {
      animationFrameId.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / dataArray.length;
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      gradient.addColorStop(0, "rgb(30, 102, 209)");
      gradient.addColorStop(0.5, "rgb(13, 144, 75)");
      gradient.addColorStop(1, "rgb(230, 138, 0)");

      ctx.fillStyle = gradient;
      dataArray.forEach((value, i) => {
        const barHeight = (value / 255) * canvas.height * 0.8;
        const x = i * barWidth;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
      });
    };

    draw();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [analyser]);

  return (
    <canvas ref={canvasRef} width={200} height={40} className="rounded-md" />
  );
}

// 메인 컴포넌트
export function InterviewProgress({
  stream,
  interviewData,
  status,
}: ProgressProps) {
  // 기존 상태들
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[][]>([]);
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isFirstStart, setIsFirstStart] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [modalTimeout, setModalTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  // 새로운 시간 설정 관련 상태
  const [preparationTime, setPreparationTime] = useState(10);
  const [answerTime, setAnswerTime] = useState(30);
  const [timer, setTimer] = useState(answerTime);
  const [countdown, setCountdown] = useState(preparationTime);
  const [isSkipButtonEnabled, setIsSkipButtonEnabled] = useState(false);

  const timeOptions = {
    preparation: [
      { value: 10, label: "10초" },
      { value: 15, label: "15초" },
      { value: 20, label: "20초" },
      { value: 1, label: "test" },
    ] as TimeOption[],
    answer: [
      { value: 30, label: "30초" },
      { value: 45, label: "45초" },
      { value: 60, label: "60초" },
      { value: 5, label: "test" },
    ] as TimeOption[],
  };

  const { generatedQuestions } = interviewData;

  // 질문 목록 생성
  const questions = useMemo(() => {
    if (generatedQuestions && generatedQuestions.length > 0) {
      return generatedQuestions;
    }
    return [
      "자기소개서에 언급하신 프로젝트에서 가장 큰 도전과제는 무엇이었나요?",
      "자기소개서에서 언급하신 팀워크 경험에 대해 구체적으로 설명해주세요.",
      "자기소개서에 기재된 성과를 이루기 위해 어떤 전략을 사용하셨나요?",
      "지원하신 직무에서 가장 중요하다고 생각하는 기술과 그 이유는 무엇인가요?",
    ];
  }, [generatedQuestions]);

  // 시간 설정 변경 핸들러
  const handleTimeChange = (type: "preparation" | "answer", value: number) => {
    if (type === "preparation") {
      setPreparationTime(value);
      if (!started) {
        setCountdown(value);
      }
    } else {
      setAnswerTime(value);
      if (!started) {
        setTimer(value);
      }
    }
  };

  // 면접 시작 핸들러
  const handleStart = useCallback(() => {
    setShowCountdown(true);
    setCountdown(preparationTime);
  }, [preparationTime]);

  // 녹화 시작
  const startRecording = useCallback(() => {
    if (!stream) return;

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
    });

    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      if (chunks.length > 0) {
        setRecordedChunks((prev) => [...prev, chunks]);
      }
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(10000);
  }, [stream]);

  // 녹화 중지
  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // 면접 데이터 제출
  const submitInterviewData = useCallback(async () => {
    try {
      setShowUploadModal(true);
      setUploadError(null);
      setUploadProgress(0);
      
      if (recordedChunks.length === 0) {
        throw new Error("녹화된 영상이 없습니다.");
      }
  
      const formData = new FormData();
      formData.append("userUid", interviewData.userUid);
      formData.append("resumeUid", interviewData.resumeUid);
      formData.append("job_code", interviewData.job_code);
      formData.append("company", interviewData.company || " ");
      formData.append("resume_title", interviewData.resume_title);

      const interviewAnswers = interviewData.data.map((item) => ({
        question: item.question,
        answer: item.answer,
      }));

      formData.append("data", JSON.stringify(interviewAnswers));

      const timestamp = new Date().toISOString();
      formData.append("timestamp", timestamp);

      questions.forEach((question, index) => {
        formData.append(`questions[${index}]`, question);
      });

      const totalChunks = recordedChunks.length;
      for (let i = 0; i < recordedChunks.length; i++) {
        const chunks = recordedChunks[i];
        const blob = new Blob(chunks, { type: 'video/webm' });
        const file = new File([blob], `interview_${i + 1}.webm`, { type: 'video/webm' });
        formData.append('videoFiles', file);
        
        // Update progress
        setUploadProgress(((i + 1) / totalChunks) * 100);
      }

      const response = await fetch("/api/interview/analysis_request", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `업로드 실패 (${response.status})`
        );
      }

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => {
              setShowUploadModal(false);
            }, 5000);
            return 100;
          }
          return prev + 10;
        });
      }, 1000);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadProgress(0);
      setUploadError(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      );

      setTimeout(() => {
        setShowUploadModal(false);
      }, 3000);
    }
  }, [interviewData, questions, recordedChunks]);

  // 비디오 설정
  useEffect(() => {
    const setupVideo = async () => {
      if (videoRef.current && stream) {
        try {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        } catch (error) {
          console.error("Video setup error:", error);
          setVideoError("비디오를 재생할 수 없습니다.");
        }
      }
    };

    if (started) {
      setupVideo();
    }
  }, [stream, started]);

  // 완료 처리
  useEffect(() => {
    if (completed) {
      if (interviewData.interviewMode === 'mock' && status !== 'error') {
        setTimeout(() => { // 녹화 데이터가 모두 처리될 때까지 잠시 대기
          console.log('Mock mode - starting upload');
          startModalTimeout();
          submitInterviewData();
        }, 1000);
      } else if (interviewData.interviewMode === 'practice') {
        console.log('Practice mode - interview completed');
      }
    }
  }, [completed, submitInterviewData, status, interviewData.interviewMode]);

  function startModalTimeout() {
    const timeout = setTimeout(() => {
      setShowUploadModal(false);
    }, 10000);
    setModalTimeout(timeout);
  }

  // 타이머 효과
// 타이머 관련 useEffect 수정
// 타이머 관련 useEffect 수정
useEffect(() => {
  let interval: NodeJS.Timeout | undefined;
  
  // 처음 3초 동안은 버튼 비활성화
  if (started && !completed && timer === answerTime) {
    setIsSkipButtonEnabled(false);
    setTimeout(() => {
      setIsSkipButtonEnabled(true);
    }, 3000);
  }
  
  if (started && !completed && timer > 0 && !showCountdown) {
    interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);
  } else if (timer === 0 && !showCountdown) { // 타이머가 0이 되었을 때
    stopRecording();
    if (currentQuestion < questions.length - 1) {
      // 다음 질문이 있는 경우
      setShowCountdown(true);
      setCountdown(preparationTime);
      setTimer(answerTime);
    } else {
      // 마지막 질문인 경우
      setCompleted(true);
    }
  }
  
  return () => {
    if (interval) clearInterval(interval);
  };
}, [started, timer, completed, showCountdown, currentQuestion, questions.length, stopRecording, answerTime, preparationTime]);

// 질문 변경 시 버튼 상태 초기화
useEffect(() => {
  setIsSkipButtonEnabled(false);
}, [currentQuestion]);

  // 카운트다운 효과
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout | undefined;
    
    if (showCountdown && countdown > 0) {
      countdownInterval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (showCountdown && countdown === 0) {
      if (!started) {
        // 첫 시작
        setShowCountdown(false);
        setIsFirstStart(false);
        setStarted(true);
        setTimer(answerTime);  // answerTime 사용
        startRecording();
      } else if (currentQuestion < questions.length - 1) {  // 다음 질문이 있을 때만
        setShowCountdown(false);
        setCurrentQuestion(prev => prev + 1);
        setTimer(answerTime);  // answerTime 사용
        startRecording();
      } else {  // 마지막 질문이 끝났을 때
        stopRecording();
        setCompleted(true);
      }
    }
  
    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [showCountdown, countdown, started, currentQuestion, questions.length, startRecording, stopRecording, answerTime]);

  const handleSkip = () => {
    if (!isSkipButtonEnabled) return;
    
    stopRecording(); // 현재 녹화 중지
    
    if (currentQuestion < questions.length - 1) {
      // 다음 질문이 있는 경우
      setShowCountdown(true);
      setCountdown(preparationTime);
    } else {
      // 마지막 질문인 경우
      stopRecording(); // 한번 더 확실하게 녹화 중지
      setTimeout(() => { // 약간의 지연을 주어 녹화가 확실히 중지되도록 함
        setCompleted(true);
      }, 500);
    }
  };
  

  // UI 컴포넌트
  const UploadModal: React.FC<UploadModalProps> = ({
    showUploadModal,
    uploadError,
    uploadProgress,
  }) => {
    if (!showUploadModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center space-y-4">
          {uploadError ? (
            <>
              <div className="text-red-600 text-xl mb-4">
                <svg
                  className="w-16 h-16 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="font-bold">업로드 실패</h3>
              </div>
              <p className="text-gray-700">
                죄송합니다. 업로드에 실패했습니다.
              </p>
              <p className="text-red-500 text-sm">{uploadError}</p>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto" />
              <h3 className="text-xl font-semibold">업로드 중</h3>
              <div className="space-y-2">
                <p className="text-gray-500">
                  면접 영상을 업로드하고 있습니다.
                </p>
                <p className="text-gray-500">잠시만 기다려주세요...</p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // 메인 렌더링
  return (
    <div className="min-h-screen flex items-start justify-center bg-[#fbfbff] pt-24">
      <div className="container mx-auto px-4">
        {/* 시작 화면 */}
        {/* 시작 화면 부분만 수정 */}
        {!started && !completed && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="w-full max-w-4xl mx-auto px-4"
  >
    <div className="bg-white rounded-2xl shadow-lg p-8 relative overflow-hidden border border-gray-100">
      {/* 배경 장식 */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full transform translate-x-1/3 -translate-y-1/3 opacity-50" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-50 rounded-full transform -translate-x-1/3 translate-y-1/3 opacity-50" />
      
      <div className="relative z-10 space-y-8">
        {/* 제목 */}
        <div className="text-center">
          <motion.h1 
            className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            면접 설정하기
          </motion.h1>
        </div>

        {/* 1행: 기존 설명 */}
        <motion.div
          className="grid grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* 답변 시간 설명 */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-6 shadow-md">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 transform -rotate-6 shadow-md">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">답변 시간</h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  총 4개의 질문이 있으며, 각 질문당 선택하신 답변 시간이 주어집니다.
                </p>
              </div>
            </div>
          </div>

          {/* 질문 구성 설명 */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-6 shadow-md">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 transform rotate-6 shadow-md">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">질문 구성</h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  자기소개서 기반 역량 문제 3개와 직군 역량 문제 1개로 구성됩니다.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 2행: 시간 설정 */}
        <motion.div
          className="grid grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {/* 준비 시간 설정 */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-6 shadow-md">
            <div className="space-y-4">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 transform -rotate-6 shadow-md">
                  <Timer className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">준비 시간 설정</h3>
                  <p className="text-sm text-gray-600">
                    답변 전 준비 시간을 선택하세요
                  </p>
                </div>
              </div>
              <TimeSelector
                type="preparation"
                value={preparationTime}
                options={timeOptions.preparation}
                onChange={handleTimeChange}
              />
            </div>
          </div>

          {/* 답변 시간 설정 */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-6 shadow-md">
            <div className="space-y-4">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 transform rotate-6 shadow-md">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">답변 시간 설정</h3>
                  <p className="text-sm text-gray-600">
                    질문당 답변 시간을 선택하세요
                  </p>
                </div>
              </div>
              <TimeSelector
                type="answer"
                value={answerTime}
                options={timeOptions.answer}
                onChange={handleTimeChange}
              />
            </div>
          </div>
        </motion.div>

        {/* 시작 버튼 */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            onClick={handleStart}
            type="primary"
            size="large"
            className="rounded-full px-10 py-6 text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-none transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            면접 시작하기
          </Button>
        </motion.div>
      </div>
    </div>
  </motion.div>
)}
        {/* 면접 진행 화면 */}
        {started && !completed && (
          <div className="min-h-screen bg-gradient-to-br from-gray-50 flex items-start justify-center p-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-[85%] bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-blue-100"
            >
              {/* 상단 헤더 */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-sm font-semibold">
                    면접이 진행중입니다.
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="bg-white/20 px-2 py-1 rounded-full flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-xs font-medium">REC</span>
                    </div>
                    <div className="bg-white/20 px-2 py-1 rounded-full flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs font-medium">LIVE</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 컨텐츠 섹션의 타이머와 버튼 부분 수정 */}
<div className="p-4 space-y-6">
  {/* 타이머 */}
  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-[2px] rounded-2xl shadow-md">
    <div className="bg-white p-4 rounded-2xl flex items-center space-x-6">
      <div className="flex items-center space-x-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-lg font-semibold text-gray-700">남은 시간</span>
      </div>
      
      <div className="flex-1 flex items-center space-x-4">
        <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {timer}s
        </div>
        
        <div className="flex-1 h-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
            initial={{ width: "100%" }}
            animate={{ width: `${(timer / answerTime) * 100}%` }}
            transition={{ 
              duration: 1,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>
    </div>
  </div>

  {/* 답변 종료 버튼 - 별도 섹션으로 분리하고 중앙 정렬 */}
  <div className="flex justify-center pt-2">
    <Button
    onClick={handleSkip}
    type="primary"
    disabled={!isSkipButtonEnabled}
    className={`
      h-14 px-8 text-lg rounded-full transition-all duration-300 transform
      ${isSkipButtonEnabled 
        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 opacity-100 hover:scale-105' 
        : 'bg-gray-300 cursor-not-allowed opacity-50'
      }
    `}
  >
    답변 종료하기
  </Button>
  </div>

                {/* 질문 네비게이션 */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                  <div className="flex items-center w-full">
                    <div className="flex gap-4 mr-6">
                      {[1, 2, 3, 4].map((num) => (
                        <motion.div
                          key={num}
                          className={`
                            w-10 h-10 rounded-full flex items-center justify-center 
                            transition-all duration-300 
                            relative
                            ${
                              currentQuestion + 1 === num
                                ? "bg-blue-600 text-white scale-110 shadow-4xl ring-4 ring-blue-300/50"
                                : "bg-gray-100 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                            }
                          `}
                          whileHover={{
                            scale: currentQuestion + 1 === num ? 1.1 : 1.05,
                          }}
                        >
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-white/20 rounded-full"></div>
                          <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-white/20 rounded-full"></div>

                          <div className="relative z-10 flex flex-col items-center">
                            <span className="font-black text-1xl">Q{num}</span>
                            {currentQuestion + 1 === num && (
                              <div className="mt-1 h-1 w-4 bg-white/50 rounded-full"></div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="flex-1 w-[1000px] overflow-hidden">
                      <motion.div
                        key={currentQuestion}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full"
                      >
                        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-4 rounded-xl shadow-md border-l-4 border-blue-500 h-[120px] flex items-center">
                          <p className="text-xl font-bold text-gray-800 tracking-wide line-clamp-2">
                            {questions[currentQuestion]}
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* 비디오 섹션 */}
                <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-lg aspect-video max-w-[600px] mx-auto">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* 오디오 비주얼라이저 */}
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-13">
                    <AudioVisualizer stream={stream} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* 카운트다운 모달 */}
        {showCountdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-12 max-w-3xl w-full mx-4 text-center space-y-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-transparent rounded-full transform translate-x-1/2 -translate-y-1/2 opacity-50" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-50 to-transparent rounded-full transform -translate-x-1/2 translate-y-1/2 opacity-50" />

              <div className="relative z-10">
                {isFirstStart ? (
                  <>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
                      면접 준비
                    </h3>
                    <div className="mb-8">
                      <p className="text-xl text-gray-700 mb-4">
                        첫 번째 질문입니다.
                      </p>
                      <motion.div
                        className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <p className="text-2xl text-gray-800">{questions[0]}</p>
                      </motion.div>
                    </div>
                    <motion.div
                      className="space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <p className="text-7xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                        {countdown}
                      </p>
                      <p className="text-xl text-gray-600">
                        답변 준비를 해주세요!
                      </p>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
                      다음 질문입니다.
                    </h3>
                    <div className="mb-8">
                      <p className="text-xl text-gray-700 mb-4">
                        질문 {currentQuestion + 2}
                      </p>
                      <motion.div
                        className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <p className="text-2xl text-gray-800">
                          {questions[currentQuestion + 1]}
                        </p>
                      </motion.div>
                    </div>
                    <motion.div
                      className="space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <p className="text-7xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                        {countdown}
                      </p>
                      <p className="text-xl text-gray-600">
                        답변 준비를 해주세요!
                      </p>
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 완료 화면 */}
        {completed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-screen flex items-center justify-center -mt-20"
          >
            <div className="bg-gray-50 rounded-xl shadow-lg p-12 max-w-7xl w-full mx-auto">
              <div className="text-center space-y-10">
                {interviewData.interviewMode === "practice" ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-3 px-4"
                  >
                    <div className="text-center mb-5">
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        **면접이 종료되었습니다**
                      </h2>
                      <p className="text-base text-gray-600">수고하셨습니다.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* 질문 리뷰 섹션 */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 space-y-5">
                        <h3 className="text-lg font-bold text-gray-800 text-center">
                          면접 질문 리뷰
                        </h3>
                        <div className="space-y-3">
                          {generatedQuestions &&
                            generatedQuestions.map((question, index) => (
                              <motion.div
                                key={index}
                                whileHover={{ scale: 1.02 }}
                                className="bg-white rounded-md p-3 shadow-sm hover:shadow-md transition-all duration-300"
                              >
                                <div className="flex items-center mb-1">
                                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                                    <span className="text-xs text-blue-600 font-bold">
                                      {index + 1}
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-semibold text-gray-800">
                                    질문 {index + 1}
                                  </h4>
                                </div>
                                <p className="text-sm text-gray-800">
                                  {question}
                                </p>
                              </motion.div>
                            ))}
                        </div>
                      </div>

                      {/* 면접 꿀팁 섹션 */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 space-y-8">
                        <h3 className="text-lg font-bold text-gray-800 text-center">
                          면접 꿀팁! 📝
                        </h3>
                        <div className="space-y-5">
                          {[
                            {
                              title: "바른 자세",
                              tip: "면접관과 눈을 마주치고, 바른 자세로 앉아 자신감 있게 대답하세요.",
                            },
                            {
                              title: "구체적인 답변",
                              tip: "추상적인 답변보다는 구체적인 사례와 경험을 들어 설명하세요.",
                            },
                            {
                              title: "STAR 기법",
                              tip: "상황(Situation), 과제(Task), 행동(Action), 결과(Result)를 명확히 설명하세요.",
                            },
                            {
                              title: "긍정적 태도",
                              tip: "실패 경험도 배움과 성장의 기회로 긍정적으로 풀어내세요.",
                            },
                          ].map((item, index) => (
                            <motion.div
                              key={`tip-${index}`}
                              whileHover={{ scale: 1.02 }}
                              className="bg-white rounded-md p-3 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                              <div className="flex items-center mb-1">
                                <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                                  <span className="text-xs text-indigo-600 font-bold">
                                    {index + 1}
                                  </span>
                                </div>
                                <h4 className="text-sm font-semibold text-gray-800">
                                  {item.title}
                                </h4>
                              </div>
                              <p className="text-sm text-gray-800">
                                {item.tip}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => (window.location.href = "/ai-interview")}
                      type="primary"
                      size="large"
                      className="h-14 px-12 text-lg rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-none transform hover:scale-105 transition-all duration-300"
                    >
                      처음으로 돌아가기
                    </Button>
                  </motion.div>
                ) : interviewData.interviewMode === "mock" && uploadError ? (
                  // 모의면접 모드에서 업로드 실패했을 때의 UI
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-10"
                  >
                    <div className="text-red-500">
                      <svg
                        className="w-32 h-32 mx-auto mb-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <h2 className="text-4xl font-bold">업로드 실패</h2>
                    </div>
                    <p className="text-2xl text-gray-600">
                      죄송합니다. 면접 영상 업로드에 실패했습니다.
                    </p>
                    <p className="text-lg text-red-500">{uploadError}</p>
                    <div className="flex justify-center space-x-6">
                      <Button
                        onClick={() => window.location.reload()}
                        type="primary"
                        size="large"
                        className="h-14 px-12 text-lg rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-none"
                      >
                        다시 시도하기
                      </Button>
                      <Button
                        onClick={() => (window.location.href = "/ai-interview")}
                        type="default"
                        size="large"
                        className="h-14 px-12 text-lg rounded-full"
                      >
                        처음으로 돌아가기
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  // 모의면접 모드에서 업로드 중일 때의 UI
                  <motion.div
  initial={{ scale: 0.9, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  className="space-y-10 flex flex-col items-center justify-center"
>
  <div className="relative w-32 h-32">
    <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full animate-ping opacity-25" />
    <div className="relative w-32 h-32 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
      <div className="w-24 h-24 bg-white rounded-full" />
    </div>
  </div>
  <div className="space-y-6 text-center">
    <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
      면접이 완료되었습니다!
    </h2>
    <div className="space-y-2">
      <p className="text-2xl text-gray-600">
        영상을 업로드하고 있습니다.
      </p>
      <p className="text-2xl text-gray-600">
        잠시만 기다려주세요.
      </p>
    </div>
  </div>
  <Button
    onClick={() => (window.location.href = "/ai-interview/results")}
    type="primary"
    size="large"
    className="h-14 px-12 text-lg rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-none transform hover:scale-105 transition-all duration-300"
  >
    결과 페이지로 이동
  </Button>
</motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* 모달 렌더링 */}
        <UploadModal
          showUploadModal={showUploadModal}
          uploadError={uploadError}
          uploadProgress={uploadProgress}
        />
      </div>
    </div>
  );
}

export default InterviewProgress;
