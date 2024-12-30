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
  jobs: Array<{[key: string]: any }>;
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
  jobs
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
        //map.setCenter(markerPosition);

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


        console.log(jobs)
        // 새로운 채용공고 마커들 생성
        jobs.forEach(location => {
          const jobMarker = new naver.maps.Marker({
            position: new naver.maps.LatLng(location.Latitude
              , location.Longitude),
            map: map,  // map 객체에 직접 연결
            icon: {
              url: "./job-marker.svg", // 채용공고용 다른 마커 아이콘 사용
              size: new naver.maps.Size(35, 35),
              anchor: new naver.maps.Point(12, 12)
            }
          });

          const jobInfoWindow = new naver.maps.InfoWindow({
            content: `
              <div style="
                padding: 1rem; 
                font-family: 'Arial', sans-serif; 
                font-size: 0.875rem; 
                line-height: 1.5; 
                max-width: 370px; 
                border: 1px solid #e5e7eb; 
                border-radius: 0.5rem; 
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
                background-color: #ffffff;
              ">
                <h4 style="
                  margin: 0 0 0.5rem 0; 
                  font-size: 1rem; 
                  font-weight: 600; 
                  color: #1f2937;
                ">
                  ${location.position_title}
                </h4>
                <p style="
                  margin: 0.25rem 0; 
                  color: #4b5563;
                ">
                  기업: <span style="font-weight: 600; color: #1f2937;">${location.company_name}</span>
                </p>
                <p style="
                  margin: 0.25rem 0; 
                  color: #4b5563;
                ">
                  위치: <span style="color: #1f2937;">${location.Address}</span>
                </p>
                <p style="
                  margin: 0.25rem 0; 
                  color: #4b5563;
                ">
                  고용 형태: <span style="color: #1f2937;">${location.position_job_type_name}</span>
                </p>
                <p style="
                  margin: 0.25rem 0; 
                  color: #4b5563;
                ">
                  급여: <span style="color: #1f2937;">${location.salary_name}</span>
                </p>
                
                <!-- 버튼 컨테이너 -->
                <div style="display: flex; justify-content: space-between; gap: 0.5rem; margin-top: 1rem;">
                  <a 
                    href="${location.url}" 
                    target="_blank" 
                    style="
                      display: inline-block; 
                      padding: 0.5rem 1rem; 
                      font-size: 0.875rem; 
                      font-weight: 500; 
                      color: #ffffff; 
                      background-color: #3b82f6; 
                      border-radius: 0.375rem; 
                      text-decoration: none; 
                      transition: background-color 0.3s ease;
                    "
                    onmouseover="this.style.backgroundColor='#2563eb'"
                    onmouseout="this.style.backgroundColor='#3b82f6'"
                  >
                    공고보기
                  </a>
                  <button 
                    style="
                      display: inline-block; 
                      padding: 0.5rem 1rem; 
                      font-size: 0.875rem; 
                      font-weight: 500; 
                      color: #ffffff; 
                      background-color: #10b981; 
                      border-radius: 0.375rem; 
                      text-decoration: none; 
                      transition: background-color 0.3s ease;
                    "
                    onmouseover="this.style.backgroundColor='#059669'"
                    onmouseout="this.style.backgroundColor='#10b981'"
                  >
                    AI 면접
                  </button>
                  <button 
                    style="
                      display: inline-block; 
                      padding: 0.5rem 1rem; 
                      font-size: 0.875rem; 
                      font-weight: 500; 
                      color: #ffffff; 
                      background-color: #f59e0b; 
                      border-radius: 0.375rem; 
                      text-decoration: none; 
                      transition: background-color 0.3s ease;
                    "
                    onmouseover="this.style.backgroundColor='#d97706'"
                    onmouseout="this.style.backgroundColor='#f59e0b'"
                  >
                    길 찾기
                  </button>
                </div>
              </div>
            `,
            borderWidth: 0,
          });         
          
        
          naver.maps.Event.addListener(jobMarker, 'click', () => {
            jobInfoWindow.open(map, jobMarker);
          });

          jobMarkersRef.current.push(jobMarker);
        });
      }

      const clickListener = naver.maps.Event.addListener(map, 'click', function(e) {
        if (!isLocked) {
          const clickedLatLng = e.coord;
          marker.setPosition(clickedLatLng);
          marker.setVisible(true);
          map.panTo(clickedLatLng);
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
  }, [clientId, lat, lng, zoom, isLocked, radius, markerPosition, onMarkerPositionChange, jobs]);

  return (
    <div className="relative w-full h-screen">
      <div id="map" className="w-full h-full"></div>
    </div>
  );
};

export default Map;