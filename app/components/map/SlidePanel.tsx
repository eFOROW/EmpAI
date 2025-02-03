'use client';

import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, Search, MapPin, TrendingUp, GraduationCap,
  Clock, Wallet, Calendar, ChevronLeft, ChevronRight,
  ChevronUp, ChevronDown, Briefcase, X
} from 'lucide-react';
import {Button, Select, Input, message } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchOutlined } from '@ant-design/icons';

interface SlidePanelProps {
  children: React.ReactNode;
  onRadiusChange: (radius: number) => void;
  markerPosition: { lat: number; lng: number };
  onJobLocationsFound: (jobs: Array<{[key: string]: any }>) => void;
  onJobSelect?: (jobId: string) => void;
  selectedJobId?: string | null;
}

const jobOptions = [
  "기획·전략", "마케팅·홍보·조사", "회계·세무·재무", "인사·노무·HRD",
  "총무·법무·사무", "IT개발·데이터", "디자인", "영업·판매·무역",
  "고객상담·TM", "구매·자재·물류", "상품기획·MD", "운전·운송·배송",
  "서비스", "생산", "건설·건축", "의료", "연구·R&D", "교육", "미디어·문화·스포츠",
  "금융·보험", "공공·복지"
];

const careerOptions = [ "신입", "신입/경력", "경력", "경력무관" ];

const eduOptions = [ "학력무관", "고등학교졸업이상", "대학교(2,3년)졸업이상", "대학교(4년)졸업이상", "석사졸업이상" ];

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // 지구의 반지름 (단위: km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // 거리 (km)
};

const SlidePanel: React.FC<SlidePanelProps> = ({ 
  children, 
  onRadiusChange, 
  markerPosition, 
  onJobLocationsFound, 
  onJobSelect, 
  selectedJobId 
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isInnerPanelOpen, setIsInnerPanelOpen] = useState(true);
  const [loadings, setLoadings] = useState<boolean[]>([]);
  const [radius, setRadius] = useState(0.5);
  const [selectedJobCode, setSelectedJobCode] = useState<string>("기획·전략");
  const [selectedCareerCode, setSelectedCareerCode] = useState<string>("신입");
  const [selectedEduCode, setSelectedEduCode] = useState<string>("고등학교졸업이상");
  const [jobList, setJobList] = useState<Array<{[key: string]: any}>>([]);
  const [selectedJobIndex, setSelectedJobIndex] = useState<number | null>(null);
  const [searchType, setSearchType] = useState<string>('position');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const searchInputRef = useRef<any>(null);

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRadius = parseFloat(e.target.value);
    setRadius(newRadius);
    onRadiusChange(newRadius);
  };

  const enterLoading = (index: number) => {
    setLoadings((prevLoadings) => {
      const newLoadings = [...prevLoadings];
      newLoadings[index] = true;
      return newLoadings;
    });
  };

  const executeFilterSearch = (index: number) => {
    enterLoading(index);
    
    const customEvent = new CustomEvent('clearMapElements');
    window.dispatchEvent(customEvent);
    
    let experienceLevelCode = 0;
    switch (selectedCareerCode) {
      case "신입": experienceLevelCode = 1; break;
      case "경력": experienceLevelCode = 2; break;
      case "신입/경력": experienceLevelCode = 3; break;
      case "경력무관": experienceLevelCode = 0; break;
      default: experienceLevelCode = 0; break;
    }

    const url = `/api/job?midCodeName=${encodeURIComponent(selectedJobCode)}&experienceLevelCode=${experienceLevelCode}&educationLevelName=${encodeURIComponent(selectedEduCode)}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        const jobsWithinRadius = data
          .filter((job: any) => {
            const distance = calculateDistance(
              markerPosition.lat,
              markerPosition.lng,
              parseFloat(job.Latitude),
              parseFloat(job.Longitude)
            );
            return distance <= radius;
          })
          .map((job: any) => ({
            ...job,
            isSearchResult: false
          }));

        setJobList(jobsWithinRadius);
        onJobLocationsFound(jobsWithinRadius);
        setIsInnerPanelOpen(false);

        setLoadings(prev => {
          const newLoadings = [...prev];
          newLoadings[index] = false;
          return newLoadings;
        });
      });
  };

  const handleFilterSearch = () => {
    executeFilterSearch(0);
  };

  useEffect(() => {
    if (selectedJobId) {
      const jobIndex = jobList.findIndex(job => job.url === selectedJobId);
      if (jobIndex !== -1) {
        setSelectedJobIndex(jobIndex);
        
        const element = document.getElementById(`job-item-${jobIndex}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }
  }, [selectedJobId, jobList]);

  const handleSearchRequest = async () => {
    if (searchKeyword.trim().length < 3) {
      message.warning('검색어는 3자 이상 입력해주세요.');
      return;
    }

    if (!searchKeyword.trim()) {
      return;
    }

    enterLoading(0);

    const customEvent = new CustomEvent('clearMapElements');
    window.dispatchEvent(customEvent);

    try {
      const searchCode = searchType === 'company' ? '0' : '1';
      const response = await fetch(`/api/job/search?code=${searchCode}&text=${encodeURIComponent(searchKeyword)}`);
      
      if (!response.ok) {
        throw new Error('검색 요청 실패');
      }

      const data = await response.json();
      
      const searchResults = data.map((job: any) => ({
        ...job,
        isSearchResult: true
      }));

      setJobList(searchResults);
      onJobLocationsFound(searchResults);
      
      setSearchKeyword('');
      setIsInnerPanelOpen(false);
      setSelectedJobIndex(null);

      setLoadings(prev => {
        const newLoadings = [...prev];
        newLoadings[0] = false;
        return newLoadings;
      });
    } catch (error) {
      console.error('검색 중 오류 발생:', error);
      setLoadings(prev => {
        const newLoadings = [...prev];
        newLoadings[0] = false;
        return newLoadings;
      });
    }
  };

  return (
    <div className="relative z-50">
      <motion.div
        initial={{ width: '550px', translateX: 0, opacity: 1 }}
        animate={{ 
          width: isPanelOpen ? '550px' : '0px', 
          translateX: isPanelOpen ? 0 : -550,
          opacity: isPanelOpen ? 1 : 0 
        }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="absolute top-0 left-0 h-full bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-xl shadow-2xl overflow-hidden"
      >
        <div className="h-full flex flex-col">
          {/* 헤더 */}
          <div className="p-6 bg-white/60 backdrop-blur-lg border-b border-white/30">
            <Link href="/" className="block">
              <h1 className="text-3xl font-black bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                EmpAI
              </h1>
            </Link>
          </div>

          <div className="flex-1 overflow-hidden p-4">
            <AnimatePresence>
              {isInnerPanelOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* 키워드 검색 */}
                  <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">공고 검색</h3>
                    <div className="flex items-center gap-2 border-2 border-blue-500 rounded-lg p-1">
                      <Select
                        defaultValue="position"
                        style={{ width: 100 }}
                        onChange={setSearchType}
                        options={[
                          { value: 'company', label: '회사명' },
                          { value: 'position', label: '공고명' },
                        ]}
                        variant="borderless"
                      />
                      <Input
                        placeholder={`${searchType === 'company' ? '회사명' : '공고명'}을 입력하세요`}
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            if (searchKeyword.trim().length < 3) {
                              message.warning('검색어는 3자 이상 입력해주세요.');
                              return;
                            }
                            handleSearchRequest();
                          }
                        }}
                        style={{ 
                          border: 'none',
                          boxShadow: 'none',
                          outline: 'none'
                        }}
                        className="focus:shadow-none hover:border-transparent"
                      />
                      <SearchOutlined 
                        className="text-blue-500 text-xl cursor-pointer p-2 hover:bg-blue-50 rounded-full"
                        onClick={handleSearchRequest}
                      />
                    </div>
                  </div>

                  {/* 맞춤 검색 */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 mb-4 border border-blue-100/50">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex justify-between items-center">
                      맞춤 검색
                      <button 
                        onClick={() => setIsInnerPanelOpen(false)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </h3>
                    
                    <div className="space-y-6">
                      {/* 직군 선택 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-600 mb-2">근무직군</h4>
                        <select
                          value={selectedJobCode}
                          onChange={(e) => setSelectedJobCode(e.target.value)}
                          className="w-full p-3 bg-white/90 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-200 transition-all"
                        >
                          {jobOptions.map((job, index) => (
                            <option key={index} value={job}>{job}</option>
                          ))}
                        </select>
                      </div>

                      {/* 학력/경력 */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-600 mb-2">경력</h4>
                          <select
                            value={selectedCareerCode}
                            onChange={(e) => setSelectedCareerCode(e.target.value)}
                            className="w-full p-3 bg-white/90 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-200 transition-all"
                          >
                            {careerOptions.map((code, index) => (
                              <option key={index} value={code}>{code}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-600 mb-2">학력</h4>
                          <select
                            value={selectedEduCode}
                            onChange={(e) => setSelectedEduCode(e.target.value)}
                            className="w-full p-3 bg-white/90 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-200 transition-all"
                          >
                            {eduOptions.map((edu_code, index) => (
                              <option key={index} value={edu_code}>{edu_code}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* 거리 설정 */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-semibold text-gray-600">거리 설정</h4>
                          <span className="text-sm font-medium text-blue-600">{radius} km</span>
                        </div>
                        <input
                          type="range"
                          value={radius}
                          onChange={handleRadiusChange}
                          className="w-full h-3 bg-blue-100 rounded-full appearance-none cursor-pointer group"
                          style={{
                            backgroundImage: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(radius - 0.5) * 10}%, #EFF6FF ${(radius - 0.5) * 10}%, #EFF6FF 100%)`
                          }}
                          step={0.5}
                          min={0.5}
                          max={10}
                        />
                      </div>

                      {/* 검색 버튼 */}
                      <Button
                        type="primary"
                        loading={loadings[0]}
                        onClick={handleFilterSearch}
                        className="w-full h-14 mt-6 text-lg font-bold bg-gradient-to-r from-blue-600 border-none rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        검색하기
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 검색 결과 헤더와 토글 버튼 */}
            <div className="mt-4 sticky top-0 bg-gray-50/80 backdrop-blur-sm p-4 rounded-lg z-10">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setIsInnerPanelOpen(!isInnerPanelOpen)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white/80 rounded-lg text-gray-600 hover:text-gray-800 
                            hover:bg-gray-50 font-medium transition-all shadow-sm hover:shadow-md"
                >
                  {isInnerPanelOpen ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      <span>검색 옵션 접기</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      <span>검색 옵션 펼치기</span>
                    </>
                  )}
                </button>
                <span className="text-sm font-semibold px-3 py-1 bg-blue-100 text-blue-600 rounded-full">
                  {jobList.length}개의 결과
                </span>
              </div>

              {/* 결과 리스트 */}
              <div className="h-[calc(100vh-220px)] overflow-y-auto pr-2 space-y-4 pt-4">
                <AnimatePresence>
                  {jobList.map((job, index) => (
                    <motion.div 
                      key={index}
                      id={`job-item-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`group bg-white/80 backdrop-blur-lg rounded-3xl border-2 transition-all duration-300 cursor-pointer
                        ${selectedJobIndex === index 
                          ? 'border-blue-400 shadow-xl scale-[1.02]' 
                          : 'border-transparent shadow-lg hover:shadow-xl hover:scale-[1.01]'
                        }`}
                      onClick={() => {
                        setSelectedJobIndex(index);
                        onJobSelect?.(job.url);
                      }}
                    >
                      {/* 회사명 헤더 */}
                      <div className={`p-4 rounded-t-3xl transition-colors duration-300
                        ${selectedJobIndex === index 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500' 
                          : 'bg-gradient-to-r from-gray-50 to-gray-100 group-hover:from-blue-50 group-hover:to-indigo-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className={`w-5 h-5 transition-colors duration-300 ${
                            selectedJobIndex === index ? 'text-white' : 'text-gray-600'
                          }`} />
                          <h3 className={`font-bold text-lg transition-colors duration-300 ${
                            selectedJobIndex === index ? 'text-white' : 'text-gray-800'
                          }`}>
                            {job.company_name}
                          </h3>
                        </div>
                      </div>

                      {/* 상세 정보 */}
                      <div className="p-4">
                        <h4 className="text-xl font-bold text-gray-800 mb-4">
                          {job.position_title}
                        </h4>

                        <div className="space-y-3">
                          <InfoRow icon={MapPin} text={job.Address} />
                          <InfoRow icon={Briefcase} text={job.position_experience_level_name} />
                          <InfoRow icon={GraduationCap} text={job.position_required_education_level_name} />
                          <InfoRow icon={Clock} text={job.position_job_type_name} />
                          <InfoRow icon={Wallet} text={job.salary_name} />
                          
                          <div className="pt-2 border-t border-gray-100">
                            <InfoRow 
                              icon={Calendar} 
                              text={`게시일: ${new Date(job.posting_date).toLocaleDateString('ko-KR')}`}
                            />
                            <InfoRow 
                              icon={Clock} 
                              text={`마감일: ${
                                (() => {
                                  const expirationDate = new Date(job.expiration_date);
                                  const today = new Date();
                                  const oneYearFromNow = new Date();
                                  oneYearFromNow.setFullYear(today.getFullYear() + 1);
                                  
                                  return expirationDate > oneYearFromNow 
                                    ? '채용시' 
                                    : expirationDate.toLocaleDateString('ko-KR')
                                })()
                              }`}
                            />
                          </div>
                        </div>

                        {/* 태그 */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          {[job.position_experience_level_name, job.position_job_type_name].map((tag, i) => (
                            <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 토글 버튼 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className={`absolute top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white/95 
          text-gray-600 p-2 rounded-r-xl shadow-lg transition-all duration-300 
          ${isPanelOpen ? 'hover:translate-x-1' : 'hover:-translate-x-1'}`}
        style={{
          left: isPanelOpen ? '550px' : '0',
          width: '36px',
          height: '52px',
        }}
      >
        {isPanelOpen 
          ? <ChevronLeft className="w-6 h-6" />
          : <ChevronRight className="w-6 h-6" />
        }
      </motion.button>
    </div>
  );
};

// 정보 행 컴포넌트
const InfoRow = ({ icon: Icon, text }: { icon: any; text: string }) => (
  <div className="flex items-center gap-2 text-gray-600">
    <Icon className="w-4 h-4 text-gray-400" />
    <span className="text-sm">{text}</span>
  </div>
);

export default SlidePanel;