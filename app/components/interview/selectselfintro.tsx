'use client';

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import getCurrentUser from '@/lib/firebase/auth_state_listener';
import { Button } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderIcon, ChevronLeftIcon, PlusCircleIcon, FileEditIcon } from 'lucide-react';

interface InterviewData {
  userUid: string;     
  resumeUid: string;   
  job_code: string;
  company?: string;
  resume_title: string;
  data: {
    question: string;
    answer: string;
  }[];
  generatedQuestions?: string[];
  
}

type InterviewMode = 'practice' | 'mock';

interface ApiResponse {
  _id: string;
  job_code: string;
  title: string;
  data: {
    question: string;
    answer: string;
  }[];
  

}

interface SelectSelfIntroProps {
  onSelect: (introData: InterviewData, interviewMode: InterviewMode) => void;
  onBack: () => void;
  job_Code?: string;    
  company?: string;
  status: string;
}

const GeneratingModal = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <motion.div 
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.95 }}
      className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center space-y-6"
    >
      <div className="relative w-20 h-20 mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-ping opacity-20"></div>
        <div className="relative flex items-center justify-center w-full h-full">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-800">면접 질문 생성 중</h3>
      <div className="space-y-2">
        <p className="text-gray-600">
          자기소개서를 분석하여 맞춤형 면접 질문을 생성하고 있습니다.
        </p>
        <p className="text-gray-600">잠시만 기다려주세요...</p>
      </div>
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
          initial={{ width: "0%" }}
          animate={{ 
            width: "100%",
            transition: { duration: 2, repeat: Infinity }
          }}
        />
      </div>
    </motion.div>
  </motion.div>
);

const jobOptions = [
  "전체", "기획·전략", "마케팅·홍보·조사", "회계·세무·재무", "인사·노무·HRD",
  "총무·법무·사무", "IT개발·데이터", "디자인", "영업·판매·무역", "고객상담·TM", "구매·자재·물류", 
  "상품기획·MD", "운전·운송·배송", "서비스", "생산", "건설·건축", "의료", "연구·R&D", "교육", 
  "미디어·문화·스포츠", "금융·보험", "공공·복지"
] as const;

export function Select_Self_Intro({ onSelect, onBack, job_Code, company, status  }: SelectSelfIntroProps) {
  const [selectedJob, setSelectedJob] = useState<string>(job_Code || "전체");
  const [allIntroductions, setAllIntroductions] = useState<InterviewData[]>([]); 
  const [filteredIntroductions, setFilteredIntroductions] = useState<InterviewData[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIntro, setSelectedIntro] = useState<InterviewData | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState<'select' | 'interview'>('select');
  const [interviewMode, setInterviewMode] = useState<'practice' | 'mock' | null>(null);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const initData = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
          const params = new URLSearchParams({
            uid: user.uid,
          });

          const token = await user.getIdToken();
          const response = await fetch(`/api/self-introduction?uid=${user.uid}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (!response.ok) {
            throw new Error("Failed to fetch documents");
          }
          const data = await response.json();

          const filteredData = data.map((item: ApiResponse): InterviewData => ({
            userUid: user.uid,
            resumeUid: item._id,
            job_code: item.job_code,
            resume_title: item.title,
            data: item.data,
            
            
          }));
          

          setAllIntroductions(filteredData);
          setFilteredIntroductions(filteredData);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      initData();
    }
  }, [mounted]);

  useEffect(() => {
    if (selectedJob === "전체" && !job_Code) {
      setFilteredIntroductions(allIntroductions);
    } else {
      const filteredByJobCode = allIntroductions.filter((item: InterviewData) => 
        item.job_code === (job_Code || selectedJob)
      );
      setFilteredIntroductions(filteredByJobCode);
    }
  }, [selectedJob, allIntroductions, job_Code]);

  const generateInterviewQuestions = async (intro: InterviewData) => {
    try {
      const response = await fetch('/api/interview/create_questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_code: intro.job_code,
          data: intro.data,
          
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();
      return data.questions;
    } catch (error) {
      console.error('Error generating questions:', error);
      return [
        "1자기소개서에 언급하신 경험에서 가장 큰 도전과제는 무엇이었나요?",
        "2자기소개서에서 언급하신 성과에 대해 구체적으로 설명해주세요.",
        "3자기소개서에 기재된 역량을 어떻게 개발하셨나요?",
        `4${intro.job_code} 직무에서 가장 중요하다고 생각하는 역량은 무엇인가요?`,
      ];
    }
  };

  const handleIntroSelect = (intro: InterviewData) => {
    setSelectedIntro(intro === selectedIntro ? null : intro);
  };

  const handleSubmitInterview = async () => {
    
  
    if (selectedIntro && interviewMode) {
      setGeneratingQuestions(true);
      try {
        const questions = await generateInterviewQuestions(selectedIntro);
      
        const completeIntroData: InterviewData = {
          ...selectedIntro,
          generatedQuestions: questions,
          company: company || undefined
        };
         
        onSelect(completeIntroData, interviewMode);
      } catch (error) {
        console.error('Error in handleSubmitInterview:', error);
      } finally {
        setGeneratingQuestions(false);
      }
    } else {
      console.warn('Cannot submit interview: missing selectedIntro or interviewMode');
    }
  };

  const handleNavigate = () => {
    if (mounted) {
      router.push('/self-introduction/manage');
    }
  };

  const handlePracticeInterview = () => {
    console.log('연습 면접 시작');
  };

  const handleMockInterview = () => {
    console.log('모의 면접 시작');
  };

  if (loading || !mounted) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 relative">
          <div className="absolute w-full h-full border-4 border-blue-200 rounded-full animate-pulse"></div>
          <div className="absolute w-full h-full border-t-4 border-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-5 py-2 max-w-5xl">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-4">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">
            연습하실 면접의 자소서를 선택해 주세요
          </h1>
          <Button
            type="default"
            shape="circle"
            icon={<ChevronLeftIcon />}
            onClick={onBack}
            size="large"
            className="hover:scale-105 transition-transform"
          />
        </div>
        
        <AnimatePresence>
          <motion.div
            key="content-section"
            initial={false}
            animate={currentSection === 'select' ? 'open' : 'collapsed'}
            variants={{
              open: { height: 'auto', opacity: 1 },
              collapsed: { height: '0px', opacity: 0 }
            }}
            transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            {currentSection === 'select' && (
              <div className="p-6">
                <div className="mb-8">
                  <div className="flex flex-wrap gap-3">
                    {jobOptions.map((job) => (
                      <motion.div
                        key={job}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={() => setSelectedJob(job)}
                          disabled={Boolean(job_Code && job !== job_Code)}
                          type={selectedJob === job ? 'primary' : 'default'}
                          size="large"
                          className={`rounded-full ${
                            selectedJob === job
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 border-none'
                              : 'hover:bg-gray-50'
                          } ${job_Code && job !== job_Code ? 'opacity-50' : ''}`}
                        >
                          {job}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
  
                <div className="bg-gray-50 rounded-3xl p-6 h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                  <AnimatePresence>
                    {filteredIntroductions.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center justify-center h-full space-y-6 py-12"
                      >
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                          <FolderIcon className="w-12 h-12 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700">작성된 자기소개서가 없습니다</h3>
                        <Button
                          type="primary"
                          size="large"
                          icon={<PlusCircleIcon className="w-5 h-5" />}
                          onClick={handleNavigate}
                          className="rounded-full px-8 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-none shadow-lg hover:shadow-xl"
                        >
                          자기소개서 작성하러 가기
                        </Button>
                      </motion.div>
                    ) : (
                      <div className="grid gap-4">
                        {filteredIntroductions.map((intro, index) => (
                          <motion.button
                            key={index}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleIntroSelect(intro)}
                            className="w-full text-left"
                          >
                            <div
                              className={`bg-white rounded-2xl p-6 transition-all duration-300
                                ${selectedIntro === intro
                                  ? 'ring-2 ring-blue-500 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50'
                                  : 'hover:shadow-md border border-gray-100'
                                }`}
                            >
                              <div className="flex items-center space-x-4">
                                <div
                                  className={`rounded-full p-4 transition-colors duration-300
                                    ${selectedIntro === intro
                                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                                      : 'bg-gray-100'
                                    }`}
                                >
                                  <FileEditIcon
                                    className={`w-6 h-6 ${
                                      selectedIntro === intro ? 'text-white' : 'text-gray-600'
                                    }`}
                                  />
                                </div>
                                <div>
                                  <h2 className="text-xl font-bold text-gray-900">
                                    {intro.resume_title}
                                  </h2>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {intro.job_code}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </div>
  
                <div className="mt-8 flex justify-end space-x-4">
                  <Button
                    type="primary"
                    onClick={() => setCurrentSection('interview')}
                    disabled={!selectedIntro}
                    size="large"
                    className={`rounded-full px-8 ${
                      selectedIntro
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-none'
                        : 'bg-gray-300'
                    }`}
                  >
                    선택하기
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
  
      {currentSection === 'interview' && selectedIntro && (
      <motion.div
        key="interview-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl shadow-xl p-8 border border-blue-100 mt-4"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-blue-700">
            면접 모드를 선택해 주세요
          </h2>
          <Button
            type="default"
            shape="circle"
            icon={<ChevronLeftIcon />}
            onClick={() => {
              setCurrentSection('select');
              setInterviewMode(null);
            }}
            size="large"
            className="hover:scale-105 transition-transform"
          />
        </div>
        <div className="grid grid-cols-2 gap-8">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setInterviewMode('practice')}
            className={`p-8 rounded-2xl cursor-pointer transition-all ${
              interviewMode === 'practice'
                ? 'bg-white shadow-lg border-2 border-blue-400'
                : 'bg-white shadow hover:shadow-md'
            } ${interviewMode === 'mock' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              </div>
              <h3 className="text-2xl font-semibold text-blue-700">AI 면접 예상질문</h3>
            </div>
            <p className="text-gray-600">
              AI가 분석한 최신 면접 트렌드와 직무별 맞춤 예상 질문을 제공합니다. 취업을 준비하는 과정에서 가장 중요한 면접 준비를 도와드립니다. - 피드백 제공 X
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: status === 'ok' ? 1.03 : 1 }}
            whileTap={{ scale: status === 'ok' ? 0.98 : 1 }}
            onClick={() => status === 'ok' && setInterviewMode('mock')}
            className={`p-8 rounded-2xl cursor-pointer transition-all ${
              interviewMode === 'mock' && status === 'ok'
                ? 'bg-white shadow-lg border-2 border-indigo-400'
                : 'bg-white shadow hover:shadow-md'
            } ${
              interviewMode === 'practice' || status !== 'ok'
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-indigo-700">
                {status === 'error' ? 'AI 모의면접(점검 중)' : 'AI 모의면접'}
              </h3>
            </div>
            <p className="text-gray-600">
              {status === 'error'
                ? '현재 분석 서버 점검 중입니다. 불편을 드려 죄송합니다. 잠시 후 다시 시도해 주세요.'
                : '실제 면접과 같은 환경에서 AI 면접관과 1:1 모의면접을 진행해보세요. 답변을 녹화하고 실시간 피드백을 받을 수 있습니다.'}
            </p>
          </motion.div>
        </div>
        {interviewMode && (
        <div className="mt-8 flex justify-center">
          <Button
            type="primary"
            onClick={handleSubmitInterview}
            disabled={!selectedIntro || generatingQuestions}
            size="large"
            className={`rounded-full px-12 ${
              selectedIntro && !generatingQuestions
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-none' 
                : 'bg-gray-300'
            }`}
          >
            {generatingQuestions ? '질문 생성 중...' : '면접 보기'}
          </Button>
        </div>
      )}
      </motion.div>
    )}

    <AnimatePresence>
      {generatingQuestions && <GeneratingModal />}
    </AnimatePresence>
  </div>
);
}