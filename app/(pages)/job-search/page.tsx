'use client';

import React, { useState, useEffect } from 'react';
import SlidePanel from '@/app/components/map/SlidePanel';
import Map from '@/app/components/map/dynamic_Map';
import { User } from "firebase/auth";
import getCurrentUser from "@/lib/firebase/auth_state_listener";
import { useRouter } from "next/navigation";
import { Button } from "antd";

const Page = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const router = useRouter();
  const [radius, setRadius] = useState(0.5);
  const [jobLocations, setJobLocations] = useState<Array<{[key: string]: any }>>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number }>({
    lat: 36.35060201641992,
    lng: 127.3848240170031
  });

  useEffect(() => {
    getCurrentUser().then((user) => {
      setUser(user);
      setIsAuthChecked(true);
    });
  }, []);

  const handleLoginRedirect = () => {
    router.push("/mypage");
  };

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
  };

  const handleMarkerPositionChange = (position: { lat: number; lng: number }) => {
    setMarkerPosition(position);
  };

  const handleJobLocationsFound = (jobs: Array<{[key: string]: any }>) => {
    setJobLocations(jobs);
  };

  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId);
  };

  return (
    <div className="flex min-h-screen relative">
      <SlidePanel 
        onRadiusChange={handleRadiusChange}
        markerPosition={markerPosition}
        onJobLocationsFound={handleJobLocationsFound}
        onJobSelect={handleJobSelect}
        selectedJobId={selectedJobId}
      >
        <></>
      </SlidePanel>

      <div className="flex-grow">
        <Map
          clientId={process.env.NEXT_PUBLIC_CLIENT_ID as string}
          lat={36.35060201641992}
          lng={127.3848240170031}
          zoom={15}
          radius={radius}
          markerPosition={markerPosition}
          onMarkerPositionChange={handleMarkerPositionChange}
          jobs={jobLocations}
          selectedJobId={selectedJobId}
          onJobSelect={handleJobSelect}
        />
      </div>

      {isAuthChecked && !user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">로그인이 필요합니다</h2>
              <p className="text-gray-600 mb-6">
                구직 검색 서비스를 이용하시려면<br />
                로그인이 필요합니다.
              </p>
              <Button
                onClick={handleLoginRedirect}
                type="primary"
                size="large"
                className="h-12 px-10 text-lg bg-blue-500 hover:bg-blue-600 border-0 rounded-lg"
              >
                로그인 하러 가기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;