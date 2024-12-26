// HomePage.tsx
'use client';

import React, { useState } from 'react';
import SlidePanel from '@/app/components/map/SlidePanel'; 
import Map from '@/app/components/map/dynamic_Map'; 

const Page = () => {
  const [radius, setRadius] = useState(0.5); // 반경 상태 관리

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
  };

  return (
    <div className="flex min-h-screen">
      {/* 패널 */}
      <SlidePanel onRadiusChange={handleRadiusChange}>
        <></>
      </SlidePanel>

      {/* 지도 */}
      <div className="flex-grow">
        <Map
          clientId="obpdge9tt1"
          lat={36.35060201641992}
          lng={127.3848240170031}
          zoom={15}
          radius={radius} // 반경 값 전달
        />
      </div>
    </div>
  );
};

export default Page;
