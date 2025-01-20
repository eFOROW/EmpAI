'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Modal } from 'antd';
import { useRouter } from 'next/navigation';

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
  onJobSelect?: (jobId: string) => void;
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
  selectedJobId,
  onJobSelect
}) => {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const clickListenerRef = useRef<any>(null);
  const jobMarkersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const roadviewRef = useRef<any>(null);
  const [isRoadviewVisible, setIsRoadviewVisible] = useState(false);
  const [currentRoadviewPosition, setCurrentRoadviewPosition] = useState<{lat: number, lng: number} | null>(null);
  const jobMarkersMapRef = useRef<{[key: string]: {
    marker: any;
    infoWindow: any;
    jobIndex: number;
  }}>({})
  const router = useRouter();
  const [currentDestination, setCurrentDestination] = useState<{lat: number, lng: number} | null>(null);
  const routeInfoWindowRef = useRef<any>(null);  // 길찾기 정보 InfoWindow 참조 추가

  const drawRoute = async (start: { lat: number; lng: number }, end: { lat: number; lng: number }) => {
    try {
      setCurrentDestination(end);
      
      // 기존 경로들이 있다면 모두 제거
      if (polylineRef.current) {
        polylineRef.current.forEach((polyline: any) => {
          polyline.setMap(null);
        });
        polylineRef.current = [];
      }

      // 기존 길찾기 정보 InfoWindow가 있다면 제거
      if (routeInfoWindowRef.current) {
        routeInfoWindowRef.current.close();
      }

      const response = await fetch(
        `/api/naver?start=${start.lng},${start.lat}&goal=${end.lng},${end.lat}`
      );
  
      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.statusText}`);
      }
  
      const data = await response.json();
      const route = data.route.traoptimal[0];
      
      // 각 구간별로 다른 polyline 생성
      route.path.forEach((coord: number[], index: number) => {
        if (index === 0) return; // 첫 좌표는 건너뜀
        
        const section = route.section[Math.floor(index / 30)]; // 구간 정보 가져오기
        const congestion = section?.congestion || 0;
        
        // 혼잡도에 따른 색상 설정
        let strokeColor;
        switch (congestion) {
          case 0: // 원활
            strokeColor = '#2EA52C';  // 초록색으로 변경
            break;
          case 1: // 서행
            strokeColor = '#F7B500';  // 노란색
            break;
          case 2: // 지체
            strokeColor = '#E03131';  // 더 진한 빨간색으로 변경
            break;
          default:
            strokeColor = '#2EA52C';  // 기본값도 초록색으로 변경
        }

        const polyline = new naver.maps.Polyline({
          map: mapRef.current,
          path: [
            new naver.maps.LatLng(route.path[index-1][1], route.path[index-1][0]),
            new naver.maps.LatLng(coord[1], coord[0])
          ],
          strokeColor: strokeColor,
          strokeWeight: 5,
          strokeOpacity: 0.9
        });

        if (!polylineRef.current) {
          polylineRef.current = [];
        }
        polylineRef.current.push(polyline);
      });

      // InfoWindow 생성 및 참조 저장
      const infoWindow = new naver.maps.InfoWindow({
        content: `
          <div style="padding: 1rem; font-family: 'Arial', sans-serif; font-size: 0.875rem; color: #333;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <!-- 시간과 거리 정보 -->
              <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="display: flex; align-items: center;">
                  <svg style="width: 20px; height: 20px; margin-right: 4px;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 6V12L16 14" stroke="#4B5563" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="12" cy="12" r="9" stroke="#4B5563" stroke-width="2"/>
                  </svg>
                  <span style="font-size: 1rem; font-weight: 600; color: #111827;">
                    ${Math.round(route.summary.duration / 60000)}분
                  </span>
                </div>
                <div style="display: flex; align-items: center;">
                  <svg style="width: 20px; height: 20px; margin-right: 4px;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="#4B5563"/>
                  </svg>
                  <span style="font-size: 1rem; font-weight: 600; color: #111827;">
                    ${(route.summary.distance / 1000).toFixed(1)}km
                  </span>
                </div>
              </div>

              <!-- 구분선 -->
              <div style="width: 1px; height: 40px; background-color: #e5e7eb;"></div>

              <!-- 교통 정보 (수직 정렬) -->
              <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                <div style="display: flex; align-items: center;">
                  <div style="width: 20px; height: 3px; background: #2EA52C; margin-right: 4px; border-radius: 2px;"></div>
                  <span style="color: #4B5563; font-size: 0.75rem;">원활</span>
                </div>
                <div style="display: flex; align-items: center;">
                  <div style="width: 20px; height: 3px; background: #F7B500; margin-right: 4px; border-radius: 2px;"></div>
                  <span style="color: #4B5563; font-size: 0.75rem;">서행</span>
                </div>
                <div style="display: flex; align-items: center;">
                  <div style="width: 20px; height: 3px; background: #E03131; margin-right: 4px; border-radius: 2px;"></div>
                  <span style="color: #4B5563; font-size: 0.75rem;">지체</span>
                </div>
              </div>
            </div>
          </div>
        `,
        maxWidth: 400,
      });
  
      routeInfoWindowRef.current = infoWindow;  // 참조 저장
      
      // InfoWindow를 경로의 중간 지점에 띄우기
      infoWindow.open(mapRef.current, new naver.maps.LatLng(
        route.path[Math.floor(route.path.length / 2)][1], 
        route.path[Math.floor(route.path.length / 2)][0]
      ));
  
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

  const showRoadview = (lat: number, lng: number) => {
    setCurrentRoadviewPosition({ lat, lng });
    setIsRoadviewVisible(true);
  };

  useEffect(() => {
    if (isRoadviewVisible && currentRoadviewPosition) {
      const roadviewContainer = document.getElementById('roadview');
      if (!roadviewContainer) return;

      var panoramaOptions = {
        position: new naver.maps.LatLng(currentRoadviewPosition.lat, currentRoadviewPosition.lng),
        size: new naver.maps.Size(1150, 600),
        pov: {
            pan: -135,
            tilt: 29,
            fov: 100
        },
        visible: true,
        aroundControl: true,
        minScale: 0,
        maxScale: 10,
        minZoom: 0,
        maxZoom: 4,
        flightSpot: false,
        logoControl: false,
        logoControlOptions: {
            position: naver.maps.Position.BOTTOM_RIGHT
        },
        zoomControl: true,
        zoomControlOptions: {
            position: naver.maps.Position.TOP_LEFT,
            style: naver.maps.ZoomControlStyle.SMALL
        },
        aroundControlOptions: {
            position: naver.maps.Position.TOP_RIGHT
        }
    };

      const roadview = new naver.maps.Panorama(roadviewContainer, panoramaOptions);

      roadviewRef.current = roadview;
    }
  }, [isRoadviewVisible, currentRoadviewPosition]);
  
  useEffect(() => {
    const initMap = () => {
      const initialCenter = markerPosition 
        ? new naver.maps.LatLng(markerPosition.lat, markerPosition.lng)
        : new naver.maps.LatLng(lat, lng);
  
      const mapOptions = {
        center: initialCenter,
        zoom: zoom,
      };
        
      const map = new naver.maps.Map('map', mapOptions);
      mapRef.current = map;
      
      const marker = new naver.maps.Marker({
        position: initialCenter,
        map: map,
        visible: markerPosition != null
      });
      markerRef.current = marker;
  
      const clickListener = naver.maps.Event.addListener(map, 'click', function(e) {
        if (!isLocked) {
          const clickedLatLng = e.coord;
          marker.setPosition(clickedLatLng);
          marker.setVisible(true);
          
          const currentZoom = map.getZoom();
          map.setCenter(clickedLatLng);
          map.setZoom(currentZoom);
          
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
      mapScript.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}&submodules=panorama`;
      document.head.appendChild(mapScript);
    }
  
    return () => {
      if (clickListenerRef.current) {
        naver.maps.Event.removeListener(clickListenerRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !markerPosition) return;
  
    const marker = markerRef.current;
    marker.setPosition(new naver.maps.LatLng(markerPosition.lat, markerPosition.lng));
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
      strokeColor: '#2B98F0',
      strokeWeight: 2,
      strokeOpacity: 0.6,
      fillColor: '#2B98F0',
      fillOpacity: 0.04,
    });
  
    circle.setMap(mapRef.current);
    circleRef.current = circle;
  }, [markerPosition, radius]);

  useEffect(() => {
    if (!mapRef.current || !markerPosition || !jobs.length) return;
  
    // 기존 마커 제거
    jobMarkersRef.current.forEach(marker => {
      if (marker) marker.setMap(null);
    });
    jobMarkersRef.current = [];
  
    jobs.forEach((location, index) => {
      const jobMarker = new naver.maps.Marker({
        position: new naver.maps.LatLng(location.Latitude, location.Longitude),
        map: mapRef.current,
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
            position: relative;
          ">
            <button 
              onclick="window.closeInfoWindow && window.closeInfoWindow('${location.url}')"
              style="
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                padding: 0.25rem;
                background: none;
                border: none;
                cursor: pointer;
                font-size: 1.25rem;
                line-height: 1;
                color: #6b7280;
              "
            >×</button>
            
            <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; font-weight: 600; color: #1f2937; padding-right: 1.5rem;">
              ${location.position_title}
            </h4>
            <p style="margin: 0.25rem 0; color: #4b5563;">
              기업: <span style="font-weight: 600; color: #1f2937;">${location.company_name}</span>
            </p>
            <p style="margin: 0.25rem 0; color: #4b5563;">
              위치: <span style="color: #1f2937;">${location.Address}</span>
            </p>
            
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem;">
              <!-- 첫 번째 줄: 공고보기, AI 면접 -->
              <button 
                onclick="window.open('${location.url}', '_blank');"
                style="display: inline-block; 
                      padding: 0.5rem 1rem; 
                      font-size: 0.875rem; 
                      font-weight: 500; 
                      color: #ffffff; 
                      background-color: #3b82f6; 
                      border-radius: 0.375rem; 
                      text-decoration: none; 
                      transition: background-color 0.3s ease;
                      width: calc(50% - 0.5rem); /* 2개의 버튼을 첫 번째 줄에 배치 */
                      box-sizing: border-box;"
                onmouseover="this.style.backgroundColor='#2563eb'" 
                onmouseout="this.style.backgroundColor='#3b82f6'">
                공고보기
              </button>
              <button 
                onclick="window.navigateToAIInterview && window.navigateToAIInterview('${encodeURIComponent(location.position_job_mid_code_name)}', '${encodeURIComponent(location.company_name)}')"
                style="display: inline-block; 
                      padding: 0.5rem 1rem; 
                      font-size: 0.875rem; 
                      font-weight: 500; 
                      color: #ffffff; 
                      background-color: #10b981; 
                      border-radius: 0.375rem; 
                      text-decoration: none; 
                      transition: background-color 0.3s ease;
                      width: calc(50% - 0.5rem);
                      box-sizing: border-box;" 
                onmouseover="this.style.backgroundColor='#059669'" 
                onmouseout="this.style.backgroundColor='#10b981'">
                AI 면접
              </button>

              <!-- 두 번째 줄: 길 찾기, 로드뷰 -->
              <button 
                onclick="window.drawRouteToJob && window.drawRouteToJob(${location.Latitude}, ${location.Longitude})" 
                style="display: inline-block; 
                      padding: 0.5rem 1rem; 
                      font-size: 0.875rem; 
                      font-weight: 500; 
                      color: #ffffff; 
                      background-color: #f59e0b; 
                      border-radius: 0.375rem; 
                      text-decoration: none; 
                      transition: background-color 0.3s ease;
                      width: calc(50% - 0.5rem); /* 2개의 버튼을 두 번째 줄에 배치 */
                      box-sizing: border-box;" 
                onmouseover="this.style.backgroundColor='#d97706'" 
                onmouseout="this.style.backgroundColor='#f59e0b'">
                길 찾기
              </button>

              <button 
                onclick="window.showRoadview && window.showRoadview(${location.Latitude}, ${location.Longitude})" 
                style="display: inline-block; 
                      padding: 0.5rem 1rem; 
                      font-size: 0.875rem; 
                      font-weight: 500; 
                      color: #ffffff; 
                      background-color: #6366f1; 
                      border-radius: 0.375rem; 
                      text-decoration: none; 
                      transition: background-color 0.3s ease;
                      width: calc(50% - 0.5rem); /* 2개의 버튼을 두 번째 줄에 배치 */
                      box-sizing: border-box;" 
                onmouseover="this.style.backgroundColor='#4f46e5'" 
                onmouseout="this.style.backgroundColor='#6366f1'">
                로드뷰
              </button>
            </div>
          </div>
        `,
        borderWidth: 0,
      });
  
      jobMarkersMapRef.current[location.url] = {
        marker: jobMarker,
        infoWindow: jobInfoWindow,
        jobIndex: index
      };
      
      naver.maps.Event.addListener(jobMarker, 'click', () => {
        jobInfoWindow.open(mapRef.current, jobMarker);
        onJobSelect?.(location.url);
      });
  
      jobMarkersRef.current.push(jobMarker);
    });
  
    window.drawRouteToJob = (destLat: number, destLng: number) => {
      if (markerPosition) {
        drawRoute(
          markerPosition,
          { lat: destLat, lng: destLng }
        );
      }
    };

    window.showRoadview = (destLat: number, destLng: number) => {
      showRoadview(destLat, destLng);
    };

    window.navigateToAIInterview = (jobCode: string, company: string) => {
      router.push(`/ai-interview/evaluation?jobCode=${jobCode}&company=${company}`);
    };

    window.closeInfoWindow = (jobId: string) => {
      if (jobMarkersMapRef.current[jobId]) {
        jobMarkersMapRef.current[jobId].infoWindow.close();
      }
    };

    // 경로와 InfoWindow 제거 이벤트 리스너 추가
    const handleClearMapElements = () => {
      // 경로 제거
      if (polylineRef.current) {
        polylineRef.current.forEach((polyline: any) => {
          polyline.setMap(null);
        });
        polylineRef.current = [];
      }
      setCurrentDestination(null);

      // 열려있는 모든 InfoWindow 닫기
      Object.values(jobMarkersMapRef.current).forEach(({ infoWindow }) => {
        infoWindow.close();
      });

      // 길찾기 정보 InfoWindow 닫기
      if (routeInfoWindowRef.current) {
        routeInfoWindowRef.current.close();
      }
    };

    window.addEventListener('clearMapElements', handleClearMapElements);

    return () => {
      window.drawRouteToJob = undefined;
      window.showRoadview = undefined;
      window.navigateToAIInterview = undefined;
      window.closeInfoWindow = undefined;
      window.removeEventListener('clearMapElements', handleClearMapElements);
    };
  }, [markerPosition, jobs, onJobSelect, router]);

  
  useEffect(() => {
    if (selectedJobId && jobMarkersMapRef.current[selectedJobId]) {
      const { marker, infoWindow } = jobMarkersMapRef.current[selectedJobId];
      mapRef.current.setCenter(marker.getPosition());
      infoWindow.open(mapRef.current, marker);
    }
  }, [selectedJobId]);

  // markerPosition이 변경될 때 현재 길찾기 정보 업데이트
  useEffect(() => {
    if (markerPosition && currentDestination) {
      drawRoute(markerPosition, currentDestination);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markerPosition]);

  return (
    <div className="relative w-full h-screen">
      <div id="map" className="w-full h-full"></div>
      <Modal
        title={
          <div style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#1f2937',
            padding: '0.5rem 0'
          }}>
            🚗 로드뷰
          </div>
        }
        open={isRoadviewVisible}
        onCancel={() => setIsRoadviewVisible(false)}
        width={1200}
        centered
        footer={null}
        styles={{
          body: { 
            padding: '1rem',
            backgroundColor: 'white'
          }
        }}
        style={{
          top: 20
        }}
      >
        <div 
          id="roadview" 
          style={{ 
            width: '100%', 
            height: '600px',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}
        />
      </Modal>
    </div>
  );
};

// TypeScript 전역 타입 선언
declare global {
  interface Window {
    drawRouteToJob?: (destLat: number, destLng: number) => void;
    showRoadview?: (destLat: number, destLng: number) => void;
    navigateToAIInterview?: (jobCode: string, company: string) => void;
    closeInfoWindow?: (jobId: string) => void;
  }
}

export default Map;