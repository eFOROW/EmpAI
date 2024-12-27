'use client';
import React, { useEffect, useRef } from 'react';

interface MapProps {
  clientId: string;
  lat: number;
  lng: number;
  zoom?: number;
  radius: number;
  markerPosition: { lat: number; lng: number } | null;
  onMarkerPositionChange: (position: { lat: number; lng: number }) => void;
  jobLocations: Array<{ lat: number; lng: number }>;
  isLocked?: boolean;
}

const Map: React.FC<MapProps> = ({
  clientId,
  lat,
  lng,
  zoom = 15,
  radius,
  markerPosition,
  onMarkerPositionChange,
  isLocked = false,
  jobLocations
}) => {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const clickListenerRef = useRef<any>(null);
  const jobMarkersRef = useRef<any[]>([]);

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
          url: "./home.svg",
          size: new naver.maps.Size(40, 40),
          anchor: new naver.maps.Point(20, 40)
        });
        map.setCenter(markerPosition);

        if (circleRef.current) {
          circleRef.current.setMap(null);
        }
        const circle = new naver.maps.Circle({
          center: marker.getPosition(),
          radius: radius * 1000,
          strokeColor: '#FF0000',
          strokeWeight: 2,
          strokeOpacity: 0.6,
          fillColor: '#FF0000',
          fillOpacity: 0.1,
        });

        circle.setMap(map);
        circleRef.current = circle;

        // 기존 채용공고 마커들 제거
        jobMarkersRef.current.forEach(marker => {
          if (marker) marker.setMap(null);
        });
        jobMarkersRef.current = [];

        // 새로운 채용공고 마커들 생성
        jobLocations.forEach(location => {
          const jobMarker = new naver.maps.Marker({
            position: new naver.maps.LatLng(location.lat, location.lng),
            map: map,  // map 객체에 직접 연결
            icon: {
              url: "./job-marker.svg", // 채용공고용 다른 마커 아이콘 사용
              size: new naver.maps.Size(30, 30),
              anchor: new naver.maps.Point(12, 12)
            }
          });
          jobMarkersRef.current.push(jobMarker);
        });
      }

      const clickListener = naver.maps.Event.addListener(map, 'click', function(e) {
        if (!isLocked) {
          const clickedLatLng = e.coord;
          marker.setPosition(clickedLatLng);
          marker.setVisible(true);
          onMarkerPositionChange({
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
  }, [clientId, lat, lng, zoom, isLocked, radius, markerPosition, onMarkerPositionChange, jobLocations]);

  return (
    <div className="relative w-full h-screen">
      <div id="map" className="w-full h-full"></div>
    </div>
  );
};

export default Map;