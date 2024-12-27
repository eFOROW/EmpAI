'use client';

import React, { useState } from 'react';
import SlidePanel from '@/app/components/map/SlidePanel';
import Map from '@/app/components/map/dynamic_Map';

const Page = () => {
  const [radius, setRadius] = useState(0.5);
  const [jobLocations, setJobLocations] = useState<Array<{ lat: number; lng: number }>>([]);
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

  const handleJobLocationsFound = (locations: Array<{ lat: number; lng: number }>) => {
    setJobLocations(locations);
  };

  return (
    <div className="flex min-h-screen">
      <SlidePanel 
        onRadiusChange={handleRadiusChange}
        markerPosition={markerPosition}
        onJobLocationsFound={handleJobLocationsFound}
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
          jobLocations={jobLocations}
        />
      </div>
    </div>
  );
};

export default Page;