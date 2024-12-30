'use client';

import React, { useState } from 'react';
import SlidePanel from '@/app/components/map/SlidePanel';
import Map from '@/app/components/map/dynamic_Map';

const Page = () => {
  const [radius, setRadius] = useState(0.5);
  const [jobLocations, setJobLocations] = useState<Array<{[key: string]: any }>>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number }>({
    lat: 36.35060201641992,
    lng: 127.3848240170031
  });

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
    <div className="flex min-h-screen">
      <SlidePanel 
        onRadiusChange={handleRadiusChange}
        markerPosition={markerPosition}
        onJobLocationsFound={handleJobLocationsFound}
        onJobSelect={handleJobSelect}
      >
        <></>
      </SlidePanel>

      <div className="flex-grow">
        <Map
          clientId="obpdge9tt1"
          lat={36.35060201641992}
          lng={127.3848240170031}
          zoom={15}
          radius={radius}
          markerPosition={markerPosition}
          onMarkerPositionChange={handleMarkerPositionChange}
          jobs={jobLocations}
          selectedJobId={selectedJobId}
        />
      </div>
    </div>
  );
};

export default Page;