'use client';

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';

interface InterviewData {
  userUid: string;      
  resumeUid: string;    
  job_code: string;
  resume_title: string; 
  questions: string[];
  videoFiles: File[];
}

interface ProgressProps {
  stream: MediaStream;
  interviewData: InterviewData;
}

function AudioVisualizer({ stream }: { stream: MediaStream }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const animationFrameId = useRef<number>();

  useEffect(() => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 256;

    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyserNode);

    setAudioContext(audioCtx);
    setAnalyser(analyserNode);

    return () => {
      if (audioCtx.state !== 'closed') {
        audioCtx.close();
      }
    };
  }, [stream]);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const draw = () => {
      animationFrameId.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = canvas.width / dataArray.length;
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#4A90E2');
      gradient.addColorStop(0.5, '#34B57C');
      gradient.addColorStop(1, '#FFA500');
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
    <canvas
      ref={canvasRef}
      width={150}
      height={30}
      className="rounded-lg shadow-lg border border-gray-700"
    />
  );
}

export function InterviewProgress({ stream, interviewData }: ProgressProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[][]>([]);
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timer, setTimer] = useState(10);
  const [completed, setCompleted] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isFirstStart, setIsFirstStart] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [modalTimeout, setModalTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const UploadModal = ({ 
    showUploadModal, 
    uploadError, 
    uploadProgress 
  }: { 
    showUploadModal: boolean, 
    uploadError: string | null, 
    uploadProgress: number 
  }) => {
    if (!showUploadModal) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center space-y-4">
          {uploadError ? (
            <>
              <div className="text-red-600 text-xl mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-bold">업로드 실패</h3>
              </div>
              <p className="text-gray-700">죄송합니다. 업로드에 실패했습니다.</p>
              <p className="text-red-500 text-sm">{uploadError}</p>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto"/>
              <h3 className="text-xl font-semibold">업로드 중</h3>
              <div className="space-y-2">
                <p className="text-gray-500">면접 영상을 업로드하고 있습니다.</p>
                <p className="text-gray-500">잠시만 기다려주세요...</p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };
  
  const questions = useMemo(() => [
    "자기소개서에 언급하신 프로젝트에서 가장 큰 도전과제는 무엇이었나요?",
    "자기소개서에서 언급하신 팀워크 경험에 대해 구체적으로 설명해주세요.",
    "자기소개서에 기재된 성과를 이루기 위해 어떤 전략을 사용하셨나요?",
    "지원하신 직무에서 가장 중요하다고 생각하는 기술과 그 이유는 무엇인가요?"
  ], []);

  const startRecording = useCallback(() => {
    if (!stream) return;
    
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    });
    
    const chunks: Blob[] = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      if (chunks.length > 0) {
        setRecordedChunks(prev => [...prev, chunks]);
      }
    };
    
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(10000);
  }, [stream]);
  
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const submitInterviewData = useCallback(async () => {
    try {
      setShowUploadModal(true);
      setUploadError(null);
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append('userUid', interviewData.userUid);
      formData.append('resumeUid', interviewData.resumeUid);
      formData.append('job_code', interviewData.job_code);
      formData.append('resume_title', interviewData.resume_title);
      
      const timestamp = new Date().toISOString();
      formData.append('timestamp', timestamp);
      
      // Add questions to FormData
      questions.forEach((question, index) => {
        formData.append(`questions[${index}]`, question);
      });
      
      // Process video chunks with progress tracking
      const totalChunks = recordedChunks.length;
      for (let i = 0; i < recordedChunks.length; i++) {
        const chunks = recordedChunks[i];
        const blob = new Blob(chunks, { type: 'video/webm' });
        const file = new File([blob], `interview_${i + 1}.webm`, { type: 'video/webm' });
        formData.append('videoFiles', file);
        
        // Update progress
        setUploadProgress(((i + 1) / totalChunks) * 100);
      }
 
      
      const response = await fetch('/api/interview', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `업로드 실패 (${response.status})`);
      }

      // 매 초마다 진행률 10%씩 증가
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => {
              setShowUploadModal(false);
            }, 10000); // 10초 동안 보여주기
            return 100;
          }
          return prev + 10;
        });
      }, 1000);
  
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress(0);
      setUploadError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
      
      // 에러 모달을 3초 동안 보여주고 닫기
      setTimeout(() => {
        setShowUploadModal(false);
      }, 3000);
    }
  }, [interviewData, questions, recordedChunks]);



  const handleStart = useCallback(() => {
    setShowCountdown(true);
    setCountdown(5);
  }, []);

  useEffect(() => {
    const setupVideo = async () => {
      if (videoRef.current && stream) {
        try {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        } catch (error) {
          console.error('Video setup error:', error);
          setVideoError('비디오를 재생할 수 없습니다.');
        }
      }
    };

    if (started) {
      setupVideo();
    }
  }, [stream, started]);

  useEffect(() => {
    if (completed) {
      startModalTimeout();
      submitInterviewData();
    }
  }, [completed, submitInterviewData]);

  function startModalTimeout() {
    const timeout = setTimeout(() => {
      setShowUploadModal(false);
    }, 10000);
    setModalTimeout(timeout);
  }


  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (started && !completed && timer > 0 && !showCountdown) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0 && currentQuestion < questions.length - 1) {
      stopRecording();
      setShowCountdown(true);
    } else if (timer === 0 && currentQuestion === questions.length - 1) {
      stopRecording();
      setCompleted(true);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [started, timer, currentQuestion, completed, showCountdown, questions.length, stopRecording]);

  useEffect(() => {
    let countdownInterval: NodeJS.Timeout | undefined;
    
    if (showCountdown && countdown > 0) {
      countdownInterval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (showCountdown && countdown === 0) {
      if (!started) {
        setShowCountdown(false);
        setIsFirstStart(false);
        setStarted(true);
        setCountdown(5);
        startRecording();
      } else if (currentQuestion < questions.length - 1) {
        setShowCountdown(false);
        setCurrentQuestion(prev => prev + 1);
        setTimer(10);
        setCountdown(5);
        startRecording();
      } else {
        setCompleted(true);
      }
    }
  
    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [showCountdown, countdown, started, currentQuestion, questions.length, startRecording]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        {!started && !completed && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center space-y-8">
              <h1 className="text-3xl font-bold text-blue-600">면접 시작하기</h1>
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-lg text-gray-600">
                    총 4개의 질문이 있으며, 각 질문당 30초의 답변 시간이 주어집니다.
                  </p>
                  <p className="text-lg text-gray-600">
                    자기소개서 기반 역량 문제 3개와 직군 역량 문제 1개로 구성됩니다.
                  </p>
                </div>
              </div>
              <button
                onClick={handleStart}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                면접 시작하기
              </button>
            </div>
          </div>
        )}

        {started && !completed && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">현재 진행상황</p>
                  <p className="text-lg font-semibold text-blue-600">
                  질문 {currentQuestion + 1}/4
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">남은 시간</p>
                  <p className="text-2xl font-bold text-blue-600">{timer}초</p>
                </div>
              </div>
              
              <div className="w-full h-2 bg-blue-100 rounded-full mb-6">
                <div 
                  className="h-2 bg-blue-600 rounded-full transition-all duration-1000"
                  style={{ width: `${(timer / 30) * 100}%` }}
                />
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {questions[currentQuestion]}
                  </h2>
                </div>
                
                <div className="aspect-video bg-gray-100 rounded-lg relative overflow-hidden">
                  {videoError ? (
                    <div className="w-full h-full flex items-center justify-center text-red-500">
                      {videoError}
                    </div>
                  ) : (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover absolute inset-0"
                    />
                  )}
                
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                    <AudioVisualizer stream={stream} />
                  </div>
          
                  {/* REC 표시 */}
                  <div className="absolute top-4 left-4 bg-red-500 px-3 py-1 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-white text-sm">REC</span>
                  </div>
                  
                  {/* MIC ON 표시 */}
                  <div className="absolute top-4 right-4 bg-green-500 px-3 py-1 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-white text-sm">MIC ON</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showCountdown && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center space-y-4">
              {isFirstStart ? (
                <>
                  <h3 className="text-xl font-semibold">면접 준비</h3>
                  <p className="text-5xl font-bold text-blue-600">{countdown}</p>
                  <p className="text-gray-500">면접을 곧 시작합니다.</p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold">다음 질문 준비중</h3>
                  <p className="text-5xl font-bold text-blue-600">{countdown}</p>
                  <p className="text-gray-500">잠시 후 다음 질문이 시작됩니다.</p>
                </>
              )}
            </div>
          </div>
        )}

        {completed && (
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <div className="text-center space-y-6">
              {uploadError ? (
                <>
                  <div className="text-red-600 mb-4">
                    <svg className="w-20 h-20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-2xl font-bold">업로드 실패</h2>
                  </div>
                  <p className="text-gray-600">죄송합니다. 면접 영상 업로드에 실패했습니다.</p>
                  <p className="text-sm text-red-500">{uploadError}</p>
                  <div className="flex justify-center space-x-4">
                    <button 
                      onClick={() => window.location.reload()}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      다시 시도하기
                    </button>
                    <button 
                      onClick={() => window.location.href = "/ai-interview"}
                      className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      처음으로 돌아가기
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-25" />
                    <div className="relative w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                      <div className="w-12 h-12 bg-white rounded-full" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">면접이 완료되었습니다!</h2>
                  <p className="text-gray-600">영상을 업로드하고 있습니다.</p>
                  <p className="text-gray-600">잠시만 기다려주세요.</p>
                  <button 
                    onClick={() => window.location.href = "/ai-interview/results"}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200"
                  >
                    결과 페이지로 이동
                  </button>
                </>
              )}
            </div>
          </div>
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