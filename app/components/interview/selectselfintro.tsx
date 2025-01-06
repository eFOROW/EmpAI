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
  resume_title: string;
  data: {
    question: string;
    answer: string;
  }[];
}

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
  onSelect: (introData: InterviewData) => void;
  onBack: () => void;
  job_Code?: string;    
  company?: string;    
}

const jobOptions = [
  "전체", "기획·전략", "마케팅·홍보·조사", "회계·세무·재무", "인사·노무·HRD",
  "총무·법무·사무", "IT개발·데이터", "디자인", "영업·판매·무역", "고객상담·TM", "구매·자재·물류", 
  "상품기획·MD", "운전·운송·배송", "서비스", "생산", "건설·건축", "의료", "연구·R&D", "교육", 
  "미디어·문화·스포츠", "금융·보험", "공공·복지"
] as const;

export function Select_Self_Intro({ onSelect, onBack, job_Code, company }: SelectSelfIntroProps) {
  const [selectedJob, setSelectedJob] = useState<string>(job_Code || "전체");
  const [allIntroductions, setAllIntroductions] = useState<InterviewData[]>([]); 
  const [filteredIntroductions, setFilteredIntroductions] = useState<InterviewData[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIntro, setSelectedIntro] = useState<InterviewData | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

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
          const API_URL = `/api/self-introduction?${params}`;
          const response = await fetch(API_URL, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();

          const filteredData = data.map((item: ApiResponse): InterviewData => ({
            userUid: user.uid,
            resumeUid: item._id,
            job_code: item.job_code,
            resume_title: item.title,
            data: item.data
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

  const handleIntroSelect = (intro: InterviewData) => {
    setSelectedIntro(intro === selectedIntro ? null : intro);
  };

  const handleSubmitInterview = () => {
    if (selectedIntro) {
      onSelect(selectedIntro);
    }
  };

  const handleNavigate = () => {
    if (mounted) {
      router.push('/self-introduction/manage');
    }
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
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
      >
        {job_Code && company ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl mb-8"
          >
            <p className="text-blue-700 text-lg font-medium text-center">
              {company}의 {job_Code} 직무 면접을 위해 해당 직군의 자기소개서만 선택 가능합니다.
            </p>
          </motion.div>
        ) : null}

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
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

        <div className="bg-gray-50 rounded-3xl p-6 h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
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
                    <div className={`bg-white rounded-2xl p-6 transition-all duration-300
                      ${selectedIntro === intro 
                        ? 'ring-2 ring-blue-500 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50' 
                        : 'hover:shadow-md border border-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`rounded-full p-4 transition-colors duration-300
                          ${selectedIntro === intro 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500' 
                            : 'bg-gray-100'
                          }`}
                        >
                          <FileEditIcon className={`w-6 h-6 ${
                            selectedIntro === intro ? 'text-white' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">{intro.resume_title}</h2>
                          <p className="text-sm text-gray-500 mt-1">{intro.job_code}</p>
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
            type="default"
            size="large"
            onClick={onBack}
            className="rounded-full px-8 hover:bg-gray-50"
          >
            이전으로
          </Button>
          <Button
            type="primary"
            onClick={handleSubmitInterview}
            disabled={!selectedIntro}
            size="large"
            className={`rounded-full px-8 ${
              selectedIntro 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-none' 
                : 'bg-gray-300'
            }`}
          >
            면접 보기
          </Button>
        </div>
      </motion.div>
    </div>
  );
}