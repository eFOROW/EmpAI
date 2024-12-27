// selectselfintro.tsx 수정

import { useState, useEffect } from 'react';
import getCurrentUser from '@/lib/firebase/auth_state_listener';

interface InterviewData {
  uid: string;
  job_code: string;
  title: string;  // title 필드 추가
  data: {
    question: string;
    answer: string;
  }[];
}

interface SelectSelfIntroProps {
  onSelect: (introData: InterviewData) => void;
  onBack: () => void;
}

const jobOptions = [
  "전체", "기획·전략", "마케팅·홍보·조사", "회계·세무·재무", "인사·노무·HRD",
  "총무·법무·사무", "IT개발·데이터", "디자인", "영업·판매·무역", "고객상담·TM", "구매·자재·물류", 
  "상품기획·MD", "운전·운송·배송", "서비스", "생산", "건설·건축", "의료", "연구·R&D", "교육", 
  "미디어·문화·스포츠", "금융·보험", "공공·복지"
];

export function Select_Self_Intro({ onSelect, onBack }: SelectSelfIntroProps) {
  const [selectedJob, setSelectedJob] = useState("전체");
  const [allIntroductions, setAllIntroductions] = useState<InterviewData[]>([]); // 전체 데이터를 저장
  const [filteredIntroductions, setFilteredIntroductions] = useState<InterviewData[]>([]); // 필터링된 데이터를 저장
  const [loading, setLoading] = useState(true);
  const [selectedIntro, setSelectedIntro] = useState<InterviewData | null>(null);

  useEffect(() => {
    const initData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          const params = new URLSearchParams({
            uid: currentUser.uid,
          });

          const response = await fetch(`/api/self-introduction?${params}`);
          const data = await response.json();

          // 데이터를 InterviewData 형식으로 변환
          const filteredData = data.map((item: any) => ({
            uid: item.uid,
            job_code: item.job_code,
            title: item.title,  // title 필드 추가
            data: item.data
          }));

          setAllIntroductions(filteredData); // 전체 데이터를 저장
          setFilteredIntroductions(filteredData); // 초기에는 전체 데이터를 표시
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  useEffect(() => {
    if (selectedJob === "전체") {
      setFilteredIntroductions(allIntroductions); // 직군 코드가 "전체"일 때는 모든 데이터 표시
    } else {
      const filteredByJobCode = allIntroductions.filter((item) => item.job_code === selectedJob);
      setFilteredIntroductions(filteredByJobCode); // 직군 코드에 맞는 데이터만 필터링
    }
  }, [selectedJob, allIntroductions]);

  const handleIntroSelect = (intro: InterviewData) => {
    setSelectedIntro(intro === selectedIntro ? null : intro); // 선택된 자기소개서가 다시 선택되면 해제
  };

  const handleSubmitInterview = () => {
    if (selectedIntro) {
      onSelect(selectedIntro); // 면접 보기 버튼을 클릭하면 데이터를 전달
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-center mb-8">연습하실 역량을 선택해 주세요.</h1>

      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {jobOptions.map((job) => (
            <button
              key={job}
              onClick={() => setSelectedJob(job)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${selectedJob === job 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {job}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="p-4">
            {filteredIntroductions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                작성된 자기소개서가 없습니다.
              </div>
            ) : (
              filteredIntroductions.map((intro, index) => (
                <button
                  key={index}
                  onClick={() => handleIntroSelect(intro)}
                  className={`w-full text-left mb-4 transition-all duration-300
                    ${selectedIntro === intro ? 'bg-blue-100 shadow-lg' : 'bg-white'}`}
                >
                  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4
                    ${selectedIntro === intro ? 'border-blue-500' : 'hover:shadow-md'} transition-shadow`}>
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 rounded-full p-3">
                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">{intro.title}</h2> {/* title 값 사용 */}
                        <p className="text-sm text-gray-500">{intro.job_code}</p>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={handleSubmitInterview}
          disabled={!selectedIntro}
          className={`px-6 py-3 text-white font-semibold rounded-md transition-colors 
            ${selectedIntro ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
        >
          면접 보기
        </button>
      </div>
    </div>
  );
}