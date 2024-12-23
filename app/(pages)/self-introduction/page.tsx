import React from "react";

const Home: React.FC = () => {
  return (
    <div className="flex h-screen w-full m-0 p-0">
      {/* 왼쪽 섹션 */}
      <div className="flex-1 flex justify-center items-center relative">
        {/* 왼쪽 사각형 */}
        <div
          className="w-4/5 h-3/4 rounded-lg flex justify-center bg-white
          items-center text-xl text-[#333] border-2 border-[rgba(0, 0, 0, 0.4)] relative"
        >
          {/* 동그란 원 - 자기소개서 관리 */}
          <div
            className="absolute -top-[85px] left-1/2 transform -translate-x-1/2
            w-[200px] h-[200px] rounded-full text-[30px] leading-[1.4]
            flex justify-center items-center text-center font-semibold bg-pink-100"
          >
            <span>
              자기소개서<br />
              관리
            </span>
          </div>
          {/* 왼쪽 섹션 내용 */}
          <div className="text-center space-y-6 px-8 py-6">
            {/* 섹션 제목 */}
            <p className="text-xl text-gray-800 font-bold">
                사용자가 자기소개서를 체계적으로 관리할 수 있는 관리 기능을 제공
            </p>
            {/* 작성 지원 설명 */}
            <div className="text-left text-lg text-gray-700 leading-8">
                <p className="font-semibold text-gray-800">자소서 작성</p>
                <ul className="list-disc pl-6 space-y-2">
                <li>30개의 기본 역량 질문 중 <strong>3개</strong>를 선택할 수 있습니다.</li>
                <li>사용자가 선택한 직무 관련 질문 5~7개 중에서 <strong>1개</strong>를 추가로 선택하여 자기소개서를 작성할 수 있습니다.</li>
                </ul>
            </div>
            
            {/* 저장 및 목록 관리 설명 */}
            <div className="text-left text-lg text-gray-700 leading-8">
                <p className="font-semibold text-gray-800">저장 및 수정</p>
                <ul className="list-disc pl-6 space-y-2">
                <li>작성한 자기소개서를 저장하면 <strong>자기소개서 목록</strong>에 자동 추가됩니다.</li>
                <li>목록에서 저장된 자기소개서를 클릭하면 다시 확인할 수 있습니다.</li>
                <li>수정이 필요한 자기소개서를 선택하여 바로 수정할 수 있습니다.</li>
                </ul>
            </div>
         </div>
        </div>
      </div>

      {/* 오른쪽 섹션 */}
      <div className="flex-1 flex justify-center items-center relative">
        {/* 오른쪽 사각형 */}
        <div
          className="w-4/5 h-3/4 rounded-lg flex justify-center bg-white
          items-center text-xl text-[#333] border-2 border-[rgba(0, 0, 0, 0.4)] relative"
        >
          {/* 동그란 원 - 자기소개서 첨삭 */}
          <div
            className="absolute -top-[85px] left-1/2 transform -translate-x-1/2
            w-[200px] h-[200px] rounded-full text-[30px] leading-[1.4] 
            flex justify-center items-center text-center font-semibold bg-blue-100"
          >
            <span>
              자기소개서<br />
              첨삭
            </span>
          </div>
          {/* 오른쪽 섹션 내용 */}
          <div className="text-center space-y-6 px-8 py-6">
            {/* 섹션 제목 */}
            <p className="text-xl text-gray-800 font-bold">
                자기소개서를 검토하고 개선할 수 있는 첨삭 기능을 제공
            </p>

            {/* 첨삭 과정 설명 */}
            <div className="text-left text-lg text-gray-700 leading-8">
            <p className="font-semibold text-gray-800">첨삭 기능 사용 방법</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>자기소개서 목록에서 첨삭이 필요한 자기소개서를 선택합니다.</li>
                <li>선택한 자기소개서를 기반으로 첨삭 화면으로 이동합니다.</li>
            </ul>
            </div>
            {/* 첨삭 기능의 특징 */}
            <div className="text-left text-lg text-gray-700 leading-8">
                <p className="font-semibold text-gray-800">첨삭 기능 특징</p>
                <ul className="list-disc pl-6 space-y-2">
                <li>문맥, 어휘, 구조 등을 분석하여 적절한 <strong>수정 가이드</strong>를 제공합니다.</li>
                <li>첨삭된 결과를 확인하여 <strong>개선된 자기소개서를 확인</strong>할 수 있습니다.</li>
                </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
