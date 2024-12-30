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
  selectedJobId?: string | null;
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
  jobs,
  selectedJobId
}) => {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const clickListenerRef = useRef<any>(null);
  const jobMarkersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const jobMarkersMapRef = useRef<{[key: string]: {
    marker: any;
    infoWindow: any;
  }}>({})

  const drawRoute = async (start: { lat: number; lng: number }, end: { lat: number; lng: number }) => {
    try {
      // 기존 경로가 있다면 제거
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
  
      const response = await fetch(
        `/api/naver?start=${start.lng},${start.lat}&goal=${end.lng},${end.lat}`
      );
  
      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.statusText}`);
      }
  
      const data = await response.json();
      const route = data.route.traoptimal[0].path;
  
      // 경로 좌표 배열
      const polylinePath = route.map(
        (coord: number[]) => new naver.maps.LatLng(coord[1], coord[0])
      );
  
      const polyline = new naver.maps.Polyline({
        map: mapRef.current,
        path: polylinePath,
        strokeColor: '#007AFF',
        strokeWeight: 5,
      });
  
      polylineRef.current = polyline;
  
      // 경로의 중간 좌표 계산
      const middleIndex = Math.floor(polylinePath.length / 2);
      const middlePosition = polylinePath[middleIndex];
  
      // InfoWindow 생성
      const infoWindow = new naver.maps.InfoWindow({
        content: `
          <div style="padding: 1rem; font-family: 'Arial', sans-serif; font-size: 1rem; color: #333;">
            예상 이동거리: ${(data.route.traoptimal[0].summary.distance / 1000).toFixed(1)} km<br />
            예상 소요시간: ${Math.round(data.route.traoptimal[0].summary.duration / 60000)}분
          </div>
        `,
        maxWidth: 200,  // InfoWindow의 최대 너비
      });
  
      // InfoWindow를 경로의 중간 지점에 띄우기
      infoWindow.open(mapRef.current, middlePosition);
  
      // 경로가 모두 보이도록 지도 영역 조정
      const bounds = new naver.maps.LatLngBounds(
        new naver.maps.LatLng(start.lat, start.lng),
        new naver.maps.LatLng(end.lat, end.lng)
      );
      mapRef.current.fitBounds(bounds);
  
    } catch (error) {
      console.error('길찾기 API 호출 중 오류 발생:', error);
      alert('길찾기 중 오류가 발생했습니다.');
    }
  };
  
  

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

        jobMarkersRef.current.forEach(marker => {
          if (marker) marker.setMap(null);
        });
        jobMarkersRef.current = [];

        jobs.forEach(location => {
          const jobMarker = new naver.maps.Marker({
            position: new naver.maps.LatLng(location.Latitude, location.Longitude),
            map: map,
            icon: {
              url: "./job-marker.svg",
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
                <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; font-weight: 600; color: #1f2937;">
                  ${location.position_title}
                </h4>
                <p style="margin: 0.25rem 0; color: #4b5563;">
                  기업: <span style="font-weight: 600; color: #1f2937;">${location.company_name}</span>
                </p>
                <p style="margin: 0.25rem 0; color: #4b5563;">
                  위치: <span style="color: #1f2937;">${location.Address}</span>
                </p>
                <p style="margin: 0.25rem 0; color: #4b5563;">
                  고용 형태: <span style="color: #1f2937;">${location.position_job_type_name}</span>
                </p>
                <p style="margin: 0.25rem 0; color: #4b5563;">
                  급여: <span style="color: #1f2937;">${location.salary_name}</span>
                </p>
                
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
                    onclick="window.drawRouteToJob && window.drawRouteToJob(${location.Latitude}, ${location.Longitude})"
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

          // 마커와 URL을 매핑하여 저장
          jobMarkersMapRef.current[location.url] = {
            marker: jobMarker,
            infoWindow: jobInfoWindow
          };
          
          naver.maps.Event.addListener(jobMarker, 'click', () => {
            jobInfoWindow.open(map, jobMarker);
          });

          jobMarkersRef.current.push(jobMarker);
        });

        // 전역 함수로 길찾기 함수 노출
        window.drawRouteToJob = (destLat: number, destLng: number) => {
          if (markerPosition) {
            drawRoute(
              markerPosition,
              { lat: destLat, lng: destLng }
            );
          }
        };
      }

      const clickListener = naver.maps.Event.addListener(map, 'click', function(e) {
        if (!isLocked) {
          const clickedLatLng = e.coord;
          marker.setPosition(clickedLatLng);
          marker.setVisible(true);
          
          // 현재 줌 레벨을 유지하면서 위치만 이동
          const currentZoom = map.getZoom();
          map.setZoom(currentZoom);
          map.setCenter(clickedLatLng);
          
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
      // 전역 함수를 제거할 때 타입 체크 추가
      if (window.drawRouteToJob) {
        window.drawRouteToJob = undefined;
      }
    };
  }, [clientId, lat, lng, zoom, isLocked, radius, markerPosition, onMarkerPositionChange, jobs]);

  useEffect(() => {
    if (selectedJobId && jobMarkersMapRef.current[selectedJobId]) {
      const { marker, infoWindow } = jobMarkersMapRef.current[selectedJobId];
      infoWindow.open(mapRef.current, marker);
    }
  }, [selectedJobId]);
  return (
    <div className="relative w-full h-screen">
      <div id="map" className="w-full h-full"></div>
    </div>
  );
};

// TypeScript 전역 타입 선언
declare global {
  interface Window {
    drawRouteToJob?: (destLat: number, destLng: number) => void;
  }
}

export default Map;