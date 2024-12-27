'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { Button } from 'antd';

interface SlidePanelProps {
  children: React.ReactNode; // 패널 내부에 렌더링될 콘텐츠
  onRadiusChange: (radius: number) => void; // 반경 변경 핸들러
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

const SlidePanel: React.FC<SlidePanelProps> = ({ children, onRadiusChange }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(true); // 패널 열림/닫힘 상태 관리
  const [isInnerPanelOpen, setIsInnerPanelOpen] = useState(true); // 패널 열림/닫힘 상태 관리
  const [loadings, setLoadings] = useState<boolean[]>([]);  // 검생 로딩상태 관리
  const [radius, setRadius] = useState(0.5); // 기본 반경 0.5km
  const [selectedJobCode, setSelectedJobCode] = useState<string>("기획·전략"); 
  const [selectedCareerCode, setSelectedCareerCode] = useState<string>("신입"); 
  const [selectedEduCode, setSelectedEduCode] = useState<string>("고등학교졸업이상"); 

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRadius = parseFloat(e.target.value);
    setRadius(newRadius);
    onRadiusChange(newRadius); // 부모로 반경 변경 전달
  };

  const enterLoading = (index: number) => {
    setLoadings((prevLoadings) => {
      const newLoadings = [...prevLoadings];
      newLoadings[index] = true;
      return newLoadings;
    });

    setTimeout(() => {
      setLoadings((prevLoadings) => {
        const newLoadings = [...prevLoadings];
        newLoadings[index] = false;
        return newLoadings;
      });
    }, 3000);
  };

  return (
    <div className="relative z-50">
      {/* 패널 */}
      <div
        className={`absolute top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 ease-in-out overflow-hidden ${
          isPanelOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
        }`}
        style={{ zIndex: 50, width: '400px' }} // 너비 400px로 수정
      >
        {/* 패널 내용 */}
        <div className="p-4">
          <Link href="/" className="block relative z-10 m-4 w-full">
            <h1 className="font-extrabold text-[28px] leading-[30.24px] text-primary-black cursor-pointer block">
              EmpAI
            </h1>
          </Link>
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
              max={6}
            />
            <span className="text-sm">{radius} km</span>
          </div>
          {children}
          <div className="flex justify-center mt-4">
            <Button
              type="primary"
              loading={loadings[0]}
              onClick={() => enterLoading(0)}
              className={`w-2/3 h-10 text-lg font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-md`}
            >
              검색
            </Button>
          </div>
        </div>
        {/* 하단 패널 토글 버튼 */}
        <button
          onClick={() => setIsInnerPanelOpen(!isInnerPanelOpen)}
          className={`w-full bg-gray-200 text-primary-black py-2 mt-4 rounded-b-md`}
        >
          {isPanelOpen ? '패널 닫기' : '패널 열기'}
        </button>
      </div>

      {/* 패널버튼 */}
      <button
        onClick={() => setIsPanelOpen(!isPanelOpen)} // 상태 토글
        className={`absolute top-1/2 transform -translate-y-1/2 bg-white text-primary-black p-2 rounded-r-md z-50 transition-all duration-300`}
        style={{
          zIndex: 50,
          left: isPanelOpen ? '400px' : '0', // 패널이 열렸을 때 오른쪽에 위치하고, 닫히면 왼쪽에 위치
          borderTopLeftRadius: '0', // 왼쪽 상단 모서리 직각
          borderBottomLeftRadius: '0', // 왼쪽 하단 모서리 직각
          boxShadow: 'none', // 그림자 제거
        }}
      >
        {isPanelOpen ? '<' : '>'}
      </button>
    </div>
  );
};

export default SlidePanel;