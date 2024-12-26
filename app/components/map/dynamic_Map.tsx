'use client';
import React, { useState, useEffect, useRef } from 'react';

interface MapProps {
  clientId: string;
  lat: number;
  lng: number;
  zoom?: number;
  radius: number;
}

const Map: React.FC<MapProps> = ({ clientId, lat, lng, zoom = 15, radius }) => {
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null); // 원을 위한 ref
  const clickListenerRef = useRef<any>(null);

  useEffect(() => {
    const initMap = () => {
      const mapOptions = {
        center: new naver.maps.LatLng(lat, lng),
        zoom: zoom,
      };
      
      const map = new naver.maps.Map('map', mapOptions);
      mapRef.current = map;
      
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(lat, lng),
        map: map,
        visible: false
      });

      markerRef.current = marker;
      if(markerPosition != null) {
        marker.setPosition(markerPosition);
        marker.setVisible(true);
        marker.setIcon({
          url: "./home.svg", // 새로운 아이콘 URL
          size: new naver.maps.Size(40, 40), // 아이콘 크기 설정 (필요에 맞게 수정)
          anchor: new naver.maps.Point(20, 40) // 아이콘의 앵커 설정
        });
        map.setCenter(markerPosition);

        // 원을 그리는 부분
        if (circleRef.current) {
          circleRef.current.setMap(null); // 이전에 그려진 원 제거
        }
        const circle = new naver.maps.Circle({
          center: marker.getPosition(),    // 마커의 위치
          radius: radius * 1000,           // 반경 값 (km -> m 변환)
          strokeColor: '#FF0000',          // 원 테두리 색
          strokeWeight: 2,                 // 테두리 두께
          strokeOpacity: 0.6,              // 테두리 투명도
          fillColor: '#FF0000',            // 원 채우기 색
          fillOpacity: 0.1,                // 원 채우기 투명도
        });

        circle.setMap(map);                // 지도에 원 추가
        circleRef.current = circle; 
      }
      

      const clickListener = naver.maps.Event.addListener(map, 'click', function(e) {
        if (!isLocked) {
          const clickedLatLng = e.coord;
          marker.setPosition(clickedLatLng);
          marker.setVisible(true);
          setMarkerPosition({
            lat: clickedLatLng.lat(),
            lng: clickedLatLng.lng()
          });
        }
      });
      clickListenerRef.current = clickListener;
    };

    if (window.naver && window.naver.maps) {
      initMap();
    } else {
      const mapScript = document.createElement('script');
      mapScript.onload = () => initMap();
      mapScript.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
      document.head.appendChild(mapScript);
    }

    return () => {
      if (clickListenerRef.current) {
        naver.maps.Event.removeListener(clickListenerRef.current);
      }
    };
  }, [clientId, lat, lng, zoom, isLocked, radius, markerPosition]);

  // 위치고정용
  // const handleLockPosition = () => {
  //   if (markerPosition && markerRef.current) {
  //     setIsLocked(true);
  //     markerRef.current.setIcon({
  //       url: "https://cdn-icons-png.flaticon.com/512/3771/3771140.png", // 새로운 아이콘 URL
  //       size: new naver.maps.Size(40, 40), // 아이콘 크기 설정 (필요에 맞게 수정)
  //       anchor: new naver.maps.Point(20, 40) // 아이콘의 앵커 설정
  //     });
  //   }
  // };

  return (
    <div className="relative w-full h-screen">
      <div id="map" className="w-full h-full"></div>
      
      {/* {markerPosition && !isLocked && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={handleLockPosition}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600"
          >
            위치 고정하기
          </button>
        </div>
      )} */}
    </div>
  );
};

export default Map;