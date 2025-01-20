'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { 
  BankOutlined, 
  EnvironmentOutlined, 
  RiseOutlined,
  BookOutlined,
  ClockCircleOutlined,
  WalletOutlined,
  CalendarOutlined,
  LeftOutlined,
  RightOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { Select, Input, message } from 'antd';

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

const SlidePanel: React.FC<SlidePanelProps> = ({ children, onRadiusChange, markerPosition, onJobLocationsFound, onJobSelect, selectedJobId }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(true); // 패널 열림/닫힘 상태 관리
  const [isInnerPanelOpen, setIsInnerPanelOpen] = useState(true); // 내부 패널 열림/닫힘 상태 추가
  const [loadings, setLoadings] = useState<boolean[]>([]);  // 검생 로딩상태 관리
  const [radius, setRadius] = useState(0.5); // 기본 반경 0.5km
  const [selectedJobCode, setSelectedJobCode] = useState<string>("기획·전략"); 
  const [selectedCareerCode, setSelectedCareerCode] = useState<string>("신입"); 
  const [selectedEduCode, setSelectedEduCode] = useState<string>("고등학교졸업이상");
  const [jobList, setJobList] = useState<Array<{[key: string]: any}>>([]);
  const [selectedJobIndex, setSelectedJobIndex] = useState<number | null>(null);
  const [searchType, setSearchType] = useState<string>('position');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRadius = parseFloat(e.target.value);
    setRadius(newRadius);
    onRadiusChange(newRadius); // 부모로 반경 변경 전달
  };

  const enterLoading = (index: number) => {
    // 로딩 상태만 설정하고 맞춤검색은 실행하지 않도록 수정
    setLoadings((prevLoadings) => {
      const newLoadings = [...prevLoadings];
      newLoadings[index] = true;
      return newLoadings;
    });
  };

  // 맞춤검색을 위한 별도 함수 수정
  const executeFilterSearch = (index: number) => {
    enterLoading(index);
    
    // 기존 경로와 InfoWindow 제거를 위해 이벤트 발생
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

  // 맞춤검색 버튼 클릭 핸들러 수정
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

    // 기존 경로와 InfoWindow 제거를 위해 이벤트 발생
    const customEvent = new CustomEvent('clearMapElements');
    window.dispatchEvent(customEvent);

    try {
      const searchCode = searchType === 'company' ? '0' : '1';
      const response = await fetch(`/api/job/search?code=${searchCode}&text=${encodeURIComponent(searchKeyword)}`);
      
      if (!response.ok) {
        throw new Error('검색 요청 실패');
      }

      const data = await response.json();
      
      // 검색 모드 플래그 추가
      const searchResults = data.map((job: any) => ({
        ...job,
        isSearchResult: true  // 검색 결과임을 표시
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
      <div
        className={`absolute top-0 left-0 h-full bg-[#f8f9fa] shadow-xl transition-all duration-300 ease-in-out overflow-hidden ${
          isPanelOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
        }`}
        style={{ zIndex: 50, width: '500px' }}
      >
        <div className="p-4">
          <Link href="/" className="block relative z-10 m-4">
            <h1 className="font-extrabold text-3xl text-blue-600 cursor-pointer hover:text-blue-700 transition-colors">
              EmpAI
            </h1>
          </Link>

          <div className={`transition-all duration-300 overflow-hidden ${
            isInnerPanelOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            {/* 검색 옵역 */}
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

            {/* 기존 검색 옵션 영역 */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">맞춤 검색</h3>
              
              <h4 className="text-base font-medium text-gray-700 mb-3">근무직군</h4>
              <select
                value={selectedJobCode}
                onChange={(e) => setSelectedJobCode(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                {jobOptions.map((job, index) => (
                  <option key={index} value={job}>{job}</option>
                ))}
              </select>

              <h4 className="text-base font-medium text-gray-700 mt-6 mb-3">학력/경력</h4>
              <div className="flex gap-4 mb-6">
                <select
                  value={selectedCareerCode}
                  onChange={(e) => setSelectedCareerCode(e.target.value)}
                  className="flex-1 p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  {careerOptions.map((code, index) => (
                    <option key={index} value={code}>{code}</option>
                  ))}
                </select>
                <select
                  value={selectedEduCode}
                  onChange={(e) => setSelectedEduCode(e.target.value)}
                  className="flex-1 p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  {eduOptions.map((edu_code, index) => (
                    <option key={index} value={edu_code}>{edu_code}</option>
                  ))}
                </select>
              </div>

              <h4 className="text-base font-medium text-gray-700 mb-3">거리 설정</h4>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  value={radius}
                  onChange={handleRadiusChange}
                  className="flex-grow h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                  step={0.5}
                  min={0.5}
                  max={10}
                />
                <span className="text-sm font-medium text-gray-600 min-w-[60px]">{radius} km</span>
              </div>
            </div>

            <Button
              type="primary"
              loading={loadings[0]}
              onClick={() => handleFilterSearch()}
              className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              검색하기
            </Button>
          </div>

          {/* 검색 결과 영역 */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setIsInnerPanelOpen(!isInnerPanelOpen)}
                className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                {isInnerPanelOpen ? '검색 옵션 접기 ▲' : '검색 옵션 펼치기 ▼'}
              </button>
              <span className="text-base font-semibold text-blue-600">
                검색결과: {jobList.length}개
              </span>
            </div>

            {/* 채용 공고 리스트 - 높이 조정 */}
            <div className="h-[calc(100vh-200px)] overflow-y-auto pr-2">
              <div className="space-y-4">
                {jobList.map((job, index) => (
                  <div 
                    key={index}
                    id={`job-item-${index}`}
                    className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border-2 ${
                      selectedJobIndex === index 
                      ? 'border-blue-500' 
                      : 'border-transparent'
                    }`}
                    onClick={() => {
                      setSelectedJobIndex(index);
                      onJobSelect?.(job.url);
                    }}
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-xl">
                      <div className="flex items-center gap-2">
                        <BankOutlined className="text-xl" />
                        <h3 className="font-bold text-lg">{job.company_name}</h3>
                      </div>
                    </div>

                    <div className="p-4">
                      <h4 className="text-xl font-semibold text-gray-800 mb-3">
                        {job.position_title}
                      </h4>

                      <div className="space-y-2 text-gray-600">
                        <div className="flex items-center gap-2 text-gray-600">
                          <EnvironmentOutlined />
                          <span>{job.Address}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <RiseOutlined />
                          <span>{job.position_experience_level_name}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <BookOutlined />
                          <span>{job.position_required_education_level_name}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <ClockCircleOutlined />
                          <span>{job.position_job_type_name}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <WalletOutlined />
                          <span>{job.salary_name}</span>
                        </div>

                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-gray-600">
                            <CalendarOutlined />
                            <span>게시일: {new Date(job.posting_date).toLocaleDateString('ko-KR')}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-gray-600">
                            <ClockCircleOutlined />
                            <span>마감일: {
                              (() => {
                                const expirationDate = new Date(job.expiration_date);
                                const today = new Date();
                                const oneYearFromNow = new Date();
                                oneYearFromNow.setFullYear(today.getFullYear() + 1);
                                
                                return expirationDate > oneYearFromNow 
                                  ? '채용시' 
                                  : expirationDate.toLocaleDateString('ko-KR')
                              })()
                            }</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                          {job.position_experience_level_name}
                        </span>
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                          {job.position_job_type_name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className={`absolute top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 text-gray-600 p-2 rounded-r-lg shadow-md transition-all duration-300 flex items-center justify-center ${
          isPanelOpen ? 'hover:translate-x-1' : 'hover:-translate-x-1'
        }`}
        style={{
          left: isPanelOpen ? '500px' : '0',
          zIndex: 50,
          width: '32px',
          height: '40px',
        }}
      >
        {isPanelOpen ? <LeftOutlined /> : <RightOutlined />}
      </button>
    </div>
  );
};

export default SlidePanel;