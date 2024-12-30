'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { Button } from 'antd';

interface SlidePanelProps {
  children: React.ReactNode;
  onRadiusChange: (radius: number) => void;
  markerPosition: { lat: number; lng: number };
  onJobLocationsFound: (jobs: Array<{[key: string]: any }>) => void;
}

const jobOptions = [
  "기획·전략", "마케팅·홍보·조사", "회계·세무·재무", "인사·노무·HRD",
  "총무·법무·사무", "IT개발·데이터", "디자인", "영업·판매·무역",
  "고객상담·TM", "구매·자재·물류", "상품기획·MD", "운전·운송·배송",
  "서비스", "생산", "건설·건축", "의료", "연구·R&D", "교육", "미디어·문화·스포츠",
  "금융·보험", "공공·복지"
];

const careerOptions = [ "신입", "신입/경력", "경력", "경력무관" ];

const eduOptions = [ "고등학교졸업이상", "대학교(2,3년)졸업이상", "대학교(4년)졸업이상", "석사졸업이상" ];

const SlidePanel: React.FC<SlidePanelProps> = ({ children, onRadiusChange, markerPosition, onJobLocationsFound }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(true); // 패널 열림/닫힘 상태 관리
  const [isInnerPanelOpen, setIsInnerPanelOpen] = useState(true); // 내부 패널 열림/닫힘 상태 추가
  const [loadings, setLoadings] = useState<boolean[]>([]);  // 검생 로딩상태 관리
  const [radius, setRadius] = useState(0.5); // 기본 반경 0.5km
  const [selectedJobCode, setSelectedJobCode] = useState<string>("기획·전략"); 
  const [selectedCareerCode, setSelectedCareerCode] = useState<string>("신입"); 
  const [selectedEduCode, setSelectedEduCode] = useState<string>("고등학교졸업이상");
  const [jobList, setJobList] = useState<Array<{[key: string]: any}>>([]);

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRadius = parseFloat(e.target.value);
    setRadius(newRadius);
    onRadiusChange(newRadius); // 부모로 반경 변경 전달
  };

  const enterLoading = (index: number) => {
    // 로딩 상태 시작
    setLoadings((prevLoadings) => {
      const newLoadings = [...prevLoadings];
      newLoadings[index] = true;
      return newLoadings;
    });
  
    let experienceLevelCode = 0;
    switch (selectedCareerCode) {
      case "신입":
        experienceLevelCode = 1; // 신입
        break;
      case "경력":
        experienceLevelCode = 2; // 경력
        break;
      case "신입/경력":
        experienceLevelCode = 3; // 신입/경력
        break;
      case "경력무관":
        experienceLevelCode = 0; // 경력무관
        break;
      default:
        experienceLevelCode = 0; // 기본값 (경력무관)
        break;
    }
    

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371; // 지구의 반지름 (단위: km)
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c; // 거리 (km)
      
      return distance;
    };

    const url = `/api/job?midCodeName=${encodeURIComponent(selectedJobCode)}&experienceLevelCode=${experienceLevelCode}&educationLevelName=${encodeURIComponent(selectedEduCode)}`;

    // GET 요청 보내기
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const jobsWithinRadius = data.filter((job: any) => {
          const distance = calculateDistance(
            markerPosition.lat,
            markerPosition.lng,
            parseFloat(job.Latitude),
            parseFloat(job.Longitude)
          );
          return distance <= radius;
        });

        setJobList(jobsWithinRadius); 
        console.log(jobList)
        onJobLocationsFound(jobsWithinRadius);

        setLoadings((prevLoadings) => {
          const newLoadings = [...prevLoadings];
          newLoadings[index] = false;
          return newLoadings;
        });
      })
  };

  return (
    <div className="relative z-50">
      {/* 패널 */}
      <div
        className={`absolute top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 ease-in-out overflow-hidden ${
          isPanelOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
        }`}
        style={{ zIndex: 50, width: '500px' }}
      >
        {/* 패널 내용 */}
        <div className="p-4">
          <Link href="/" className="block relative z-10 m-4 w-full">
            <h1 className="font-extrabold text-[28px] leading-[30.24px] text-primary-black cursor-pointer block">
              EmpAI
            </h1>
          </Link>
          {/* 내부 패널 - 토글 가능한 부분 */}
          <div className={`transition-all duration-300 overflow-hidden ${
            isInnerPanelOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <h3 className="text-lg font-semibold mt-12">근무직군</h3>
            {/* 직무 선택 드롭다운 */}
            <select
              value={selectedJobCode}
              onChange={(e) => setSelectedJobCode(e.target.value)}
              className="p-2 mt-4 mb-8 border border-gray-300 rounded-md"
              style={{ flex: '0 0 auto', minWidth: '150px' }}
            >
              {jobOptions.map((job, index) => (
                <option key={index} value={job}>
                  {job}
                </option>
              ))}
            </select>
            <h3 className="text-lg font-semibold mb-2">학력/경력</h3>
            <div className="flex items-center space-x-4 mb-8">
              {/* 경력 선택 드롭다운 */}
              <select
                value={selectedCareerCode}
                onChange={(e) => setSelectedCareerCode(e.target.value)}
                className="p-2 border border-gray-300 rounded-md"
                style={{ flex: '0 0 auto', minWidth: '130px' }}
              >
                {careerOptions.map((code, index) => (
                  <option key={index} value={code}>
                    {code}
                  </option>
                ))}
              </select>

              {/* 학력 선택 드롭다운 */}
              <select
                value={selectedEduCode}
                onChange={(e) => setSelectedEduCode(e.target.value)}
                className="p-2 border border-gray-300 rounded-md"
                style={{ flex: '0 0 auto', minWidth: '130px' }}
              >
                {eduOptions.map((edu_code, index) => (
                  <option key={index} value={edu_code}>
                    {edu_code}
                  </option>
                ))}
              </select>
            </div>

            <h3 className="text-lg font-semibold mb-2">거리 설정</h3>
            <div className="flex items-center space-x-2">
              <input
                id="radius"
                type="range"
                value={radius}
                onChange={handleRadiusChange}
                className="flex-grow h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                step={0.5}
                min={0.5}
                max={7}
              />
              <span className="text-sm">{radius} km</span>
            </div>
            {children}
            <div className="flex flex-col items-center mt-4">
              <Button
                type="primary"
                loading={loadings[0]}
                onClick={() => {enterLoading(0); setIsInnerPanelOpen(!isInnerPanelOpen)}}
                className={`w-2/3 h-10 text-lg font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-md mb-4`}
              >
                검색
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center mt-4">
            {/* 내부 패널 토글 버튼 추가 */}
            <button
              onClick={() => setIsInnerPanelOpen(!isInnerPanelOpen)}
              className="text-gray-600 hover:text-gray-800"
            >
              {isInnerPanelOpen ? '검색 옵션 접기 ▲' : '검색 옵션 펼치기 ▼'}
            </button>
            {/* 검색결과 개수 출력 */}
            <span className="text-base font-semibold mt-2">
              검색결과: {jobList.length}개
            </span>
          </div>
          {/* 회사 리스트 섹션 추가 */}
          <div className="overflow-y-auto max-h-[80vh] space-y-6 mt-4 px-6">
            {jobList.map((job, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                {/* 회사명 */}
                <h3 className="text-xl font-semibold text-gray-800">{job.company_name}</h3>

                {/* 직무 제목 */}
                <h4 className="text-lg font-medium text-gray-700 mt-2">{job.position_title}</h4>

                {/* 직무 위치 */}
                <p className="text-gray-600 mt-2">
                  <span className="font-bold">위치:</span> {job.Address}
                </p>

                {/* 경력 요구사항 */}
                <p className="text-gray-600 mt-2">
                  <span className="font-bold">경력:</span> {job.position_experience_level_name}
                </p>

                {/* 교육 요구사항 */}
                <p className="text-gray-600 mt-2">
                  <span className="font-bold">교육 수준:</span> {job.position_required_education_level_name}
                </p>

                {/* 직무 유형 */}
                <p className="text-gray-600 mt-2">
                  <span className="font-bold">직무 유형:</span> {job.position_job_type_name}
                </p>

                {/* 급여 */}
                <p className="text-gray-600 mt-2">
                  <span className="font-bold">급여:</span> {job.salary_name}
                </p>

                {/* 링크 버튼 */}
                {/* <div className="mt-4">
                  <button
                    onClick={() => window.open(job.url, '_blank')}
                    className="bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600 transition-colors duration-200"
                  >
                    상세보기
                  </button>
                </div> */}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 패널버튼 */}
      <button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className={`absolute top-1/2 transform -translate-y-1/2 bg-white text-primary-black p-2 rounded-r-md z-50 transition-all duration-300`}
        style={{
          zIndex: 50,
          left: isPanelOpen ? '500px' : '0',
          borderTopLeftRadius: '0',
          borderBottomLeftRadius: '0',
          boxShadow: 'none',
        }}
      >
        {isPanelOpen ? '<' : '>'}
      </button>
    </div>
  );
};

export default SlidePanel;