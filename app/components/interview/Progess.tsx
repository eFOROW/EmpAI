'use client';

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Button } from 'antd';
import { motion } from 'framer-motion';
import { Clock, CheckCircle } from 'lucide-react';

interface InterviewData {
  userUid: string;      
  resumeUid: string;    
  job_code: string;
  company?: string; 
  resume_title: string; 
  questions: string[];
  videoFiles: File[];
  generatedQuestions?: string[];
  interviewMode: 'practice' | 'mock';
  
}

interface ProgressProps {
  stream: MediaStream;
  interviewData: InterviewData;
  status: string;
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
    canvas.style.background = 'transparent'; // 배경만 투명하게
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const draw = () => {
      animationFrameId.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = canvas.width / dataArray.length;
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      gradient.addColorStop(0, 'rgb(30, 102, 209)');
      gradient.addColorStop(0.5, 'rgb(13, 144, 75)');
      gradient.addColorStop(1, 'rgb(230, 138, 0)');
      
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
      width={200}
      height={40}
      className="rounded-md"
    />
  );
}

export function InterviewProgress({ stream, interviewData,status }: ProgressProps) {
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
  const { generatedQuestions } = interviewData;
  
  
  const UploadModal = ({ 
    showUploadModal, 
    uploadError,  
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
  
  const questions = useMemo(() => {
    
    if (generatedQuestions && generatedQuestions.length > 0) {
      return generatedQuestions;
    }
    return [
      "자기소개서에 언급하신 프로젝트에서 가장 큰 도전과제는 무엇이었나요?",
      "자기소개서에서 언급하신 팀워크 경험에 대해 구체적으로 설명해주세요.",
      "자기소개서에 기재된 성과를 이루기 위해 어떤 전략을 사용하셨나요?",
      "지원하신 직무에서 가장 중요하다고 생각하는 기술과 그 이유는 무엇인가요?"
    ];
  }, [generatedQuestions]);
  

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
      formData.append('company', interviewData.company || ' ');
     
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
 
      
      const response = await fetch('/api/interview/analysis_request', {
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

    if (interviewData.interviewMode === 'mock' && status !== 'error') {
      console.log('Mock mode - starting upload');
      startModalTimeout();
      submitInterviewData();
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
      <div className="min-h-screen flex items-center justify-center bg-[#fbfbff]">
        <div className="container mx-auto px-4">
          {!started && !completed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto px-4 -mt-20"
            >
              <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-12 relative overflow-hidden border border-gray-100 hover:shadow-[0_25px_80px_-15px_rgba(0,0,0,0.35)] transition-shadow duration-300">
                {/* 장식용 배경 원 */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full transform translate-x-1/2 -translate-y-1/2 opacity-50" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-50 rounded-full transform -translate-x-1/2 translate-y-1/2 opacity-50" />
                
                <div className="relative z-10">
                  <div className="text-center mb-12">
                    <motion.h1 
                      className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      면접 시작하기
                    </motion.h1>
                  </div>
  
                  <div className="space-y-6 mb-12">
                    <motion.div 
                      className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-8 shadow-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="space-y-6">
                        <div className="flex items-start space-x-6">
                          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 transform -rotate-6 shadow-lg">
                            <Clock className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">답변 시간</h3>
                            <p className="text-lg text-gray-600 leading-relaxed">
                              총 4개의 질문이 있으며, 각 질문당 30초의 답변 시간이 주어집니다.
                            </p>
                          </div>
                        </div>
  
                        <div className="flex items-start space-x-6">
                          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 transform rotate-6 shadow-lg">
                            <CheckCircle className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">질문 구성</h3>
                            <p className="text-lg text-gray-600 leading-relaxed">
                              자기소개서 기반 역량 문제 3개와 직군 역량 문제 1개로 구성됩니다.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
  
                  <motion.div 
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Button
                    onClick={handleStart}
                    type="primary"
                    size="large"
                    className="rounded-full px-12 py-8 text-xl font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-none transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 shadow-xl hover:shadow-2xl active:scale-[0.98]"
                  >
                    면접 시작하기
                  </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
  
        {/* 면접 진행 중 UI */}
        {started && !completed && (
          <div className="max-w-3xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-transparent rounded-full transform translate-x-1/2 -translate-y-1/2 opacity-50" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-10">
                  <div className="space-y-2">
                    <p className="text-lg text-gray-500 font-medium">현재 진행상황</p>
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                      <p className="text-4xl font-bold">
                        질문 {currentQuestion + 1}/4
                      </p>
                    </div>
                  </div>
                  <div className="text-center bg-gradient-to-br from-white to-blue-50 px-8 py-4 rounded-2xl shadow-lg">
                    <p className="text-lg text-gray-500 font-medium">남은 시간</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                      {timer}초
                    </p>
                  </div>
                </div>
                
                <div className="w-full h-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mb-10 overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                    initial={{ width: "100%" }}
                    animate={{ width: `${(timer / 30) * 100}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>

                <div className="space-y-8">
                  <motion.div 
                    className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h2 className="text-2xl font-semibold text-gray-800">
                      {questions[currentQuestion]}
                    </h2>
                  </motion.div>
                  
                  <div className="aspect-video bg-gray-900 rounded-2xl relative overflow-hidden shadow-2xl">
                    {videoError ? (
                      <div className="absolute inset-0 flex items-center justify-center text-red-500 text-xl">
                        {videoError}
                      </div>
                    ) : (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    )}
                  
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                      <AudioVisualizer stream={stream} />
                    </div>
            
                    <div className="absolute top-6 left-6 bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span className="text-white font-medium">REC</span>
                    </div>
                    
                    <div className="absolute top-6 right-6 bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span className="text-white font-medium">MIC ON</span>
                    </div>
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
                      <p className="text-xl text-gray-700 mb-4">첫 번째 질문입니다.</p>
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
                      <p className="text-xl text-gray-600">답변 준비를 해주세요!</p>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
                      다음 질문입니다.
                    </h3>
                    <div className="mb-8">
                      <p className="text-xl text-gray-700 mb-4">질문 {currentQuestion + 2}</p>
                      <motion.div 
                        className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <p className="text-2xl text-gray-800">{questions[currentQuestion + 1]}</p>
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
                      <p className="text-xl text-gray-600">답변 준비를 해주세요!</p>
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
            {interviewData.interviewMode === 'practice'? (
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
         {generatedQuestions && generatedQuestions.map((question, index) => (
           <motion.div
             key={index}
             whileHover={{ scale: 1.02 }}
             className="bg-white rounded-md p-3 shadow-sm hover:shadow-md transition-all duration-300"
           >
             <div className="flex items-center mb-1">
               <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                 <span className="text-xs text-blue-600 font-bold">{index + 1}</span>
               </div>
               <h4 className="text-sm font-semibold text-gray-800">
                 질문 {index + 1}
               </h4>
             </div>
             <p className="text-sm text-gray-800">{question}</p>
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
             tip: "면접관과 눈을 마주치고, 바른 자세로 앉아 자신감 있게 대답하세요."
           },
           {
             title: "구체적인 답변",
             tip: "추상적인 답변보다는 구체적인 사례와 경험을 들어 설명하세요."
           },
           {
             title: "STAR 기법",
             tip: "상황(Situation), 과제(Task), 행동(Action), 결과(Result)를 명확히 설명하세요."
             
           },
           {
             title: "긍정적 태도",
             tip: "실패 경험도 배움과 성장의 기회로 긍정적으로 풀어내세요."
           }
         ].map((item, index) => (
          <motion.div
            key={`tip-${index}`}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-md p-3 shadow-sm hover:shadow-md transition-all duration-300"
          >
             <div className="flex items-center mb-1">
               <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                 <span className="text-xs text-indigo-600 font-bold">{index + 1}</span>
               </div>
               <h4 className="text-sm font-semibold text-gray-800">
                 {item.title}
               </h4>
             </div>
             <p className="text-sm text-gray-800">{item.tip}</p>
           </motion.div>
    
            ))}
          </div>
        </div>
        </div>
        <Button
          onClick={() => window.location.href = "/ai-interview"}
          type="primary"
          size="large"
          className="h-14 px-12 text-lg rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-none transform hover:scale-105 transition-all duration-300"
        >
          처음으로 돌아가기
        </Button>
      </motion.div>
              ) : interviewData.interviewMode === 'mock' && uploadError ? (
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-4xl font-bold">업로드 실패</h2>
                  </div>
                  <p className="text-2xl text-gray-600">죄송합니다. 면접 영상 업로드에 실패했습니다.</p>
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
                      onClick={() => window.location.href = "/ai-interview"}
                      type="default"
                      size="large"
                      className="h-14 px-12 text-lg rounded-full"
                    >
                      처음으로 돌아가기
                    </Button>
                  </div>
                </motion.div>
              ) : interviewData.interviewMode === 'mock' && !uploadError ? (
                // 모의면접 모드에서 업로드 중일 때의 UI
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-10"
                >
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full animate-ping opacity-25" />
                    <div className="relative w-32 h-32 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <div className="w-24 h-24 bg-white rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      면접이 완료되었습니다!
                    </h2>
                    <div className="space-y-2">
                      <p className="text-2xl text-gray-600">영상을 업로드하고 있습니다.</p>
                      <p className="text-2xl text-gray-600">잠시만 기다려주세요.</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => window.location.href = "/ai-interview/results"}
                    type="primary"
                    size="large"
                    className="h-14 px-12 text-lg rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-none transform hover:scale-105 transition-all duration-300"
                  >
                    결과 페이지로 이동
                  </Button>
                </motion.div>
              ) : null}
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