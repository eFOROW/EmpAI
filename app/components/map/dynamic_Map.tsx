'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Modal } from 'antd';
import { useRouter } from 'next/navigation';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Building2, 
  Compass, 
  X 
} from 'lucide-react';

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
  const jobMarkersMapRef = useRef<{[key: string]: {
    marker: any;
    infoWindow: any;
    jobIndex: number;
  }}>({})
  const router = useRouter();
  const [isRoadviewVisible, setIsRoadviewVisible] = useState(false);
  const [currentRoadviewPosition, setCurrentRoadviewPosition] = useState<{lat: number, lng: number} | null>(null);
  const [currentDestination, setCurrentDestination] = useState<{lat: number, lng: number} | null>(null);
  const routeInfoWindowRef = useRef<any>(null);

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
            strokeColor = '#2EA52C';
            break;
          case 1: // 서행
            strokeColor = '#F7B500';
            break;
          case 2: // 지체
            strokeColor = '#E03131';
            break;
          default:
            strokeColor = '#2EA52C';
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
          <div style="
            font-family: 'Inter', sans-serif;
            background: linear-gradient(145deg, #f4f7fa, #ffffff);
            border-radius: 1rem;
            box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.08);
            color: #1f2937;
            overflow: hidden;
            max-width: 380px;
            position: relative;
            border: 1px solid rgba(229, 231, 235, 0.5);
          ">
            <div style="
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: linear-gradient(90deg, #3b82f6, #6366f1);
            "></div>
      
            <div style="padding: 1rem; position: relative; display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="
                  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
                  width: 40px;
                  height: 40px;
                  border-radius: 10px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  box-shadow: 0 6px 12px -3px rgba(59,130,246,0.2);
                ">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div>
                  <h4 style="
                    margin: 0; 
                    font-size: 1rem; 
                    font-weight: 700; 
                    color: #1f2937;
                    margin-bottom: 0.25rem;
                  ">
                    ${Math.round(route.summary.duration / 60000)}분
                  </h4>
                  <p style="
                    margin: 0; 
                    font-size: 0.75rem; 
                    color: #6b7280;
                  ">
                    소요 시간
                  </p>
                </div>
              </div>
              
              <div style="width: 1px; height: 40px; background-color: #e5e7eb; margin: 0 1rem;"></div>
              
              <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="
                  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                  width: 40px;
                  height: 40px;
                  border-radius: 10px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  box-shadow: 0 6px 12px -3px rgba(16,185,129,0.2);
                ">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 10c0 6-7 10-7 10S6 16 6 10a7 7 0 0 1 14 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <h4 style="
                    margin: 0; 
                    font-size: 1rem; 
                    font-weight: 700; 
                    color: #1f2937;
                    margin-bottom: 0.25rem;
                  ">
                    ${(route.summary.distance / 1000).toFixed(1)}km
                  </h4>
                  <p style="
                    margin: 0; 
                    font-size: 0.75rem; 
                    color: #6b7280;
                  ">
                    거리
                  </p>
                </div>
              </div>
            </div>
            
            <div style="
              background: #f3f4f6;
              border-radius: 0.75rem;
              padding: 1rem;
              margin: 0 1rem 1rem;
              border: 1px solid rgba(229,231,235,0.7);
            ">
              <h4 style="
                margin: 0 0 0.75rem 0; 
                font-size: 0.875rem; 
                font-weight: 600; 
                color: #1f2937;
                display: flex;
                align-items: center;
                gap: 0.5rem;
              ">
                교통 상황
              </h4>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <div style="width: 20px; height: 3px; background: #2EA52C; border-radius: 2px;"></div>
                  <span style="color: #6b7280; font-size: 0.625rem;">원활</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <div style="width: 20px; height: 3px; background: #F7B500; border-radius: 2px;"></div>
                  <span style="color: #6b7280; font-size: 0.625rem;">서행</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <div style="width: 20px; height: 3px; background: #E03131; border-radius: 2px;"></div>
                  <span style="color: #6b7280; font-size: 0.625rem;">지체</span>
                </div>
              </div>
            </div>
          </div>
        `,
        maxWidth: 380,
        borderWidth: 0
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
  // 로드뷰 렌더링 useEffect
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
  
  // 지도 초기화 useEffect
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

  // 마커 및 원 생성 useEffect
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

  // 잡 마커 생성 useEffect
  useEffect(() => {
  // 기존의 모든 마커와 정보창을 제거
  jobMarkersRef.current.forEach(marker => {
    if (marker) marker.setMap(null);
  });
  jobMarkersRef.current = [];
  
  // 기존의 모든 정보창 닫기
  Object.values(jobMarkersMapRef.current).forEach(({ infoWindow }) => {
    infoWindow.close();
  });
  
  // 경로 제거
  if (polylineRef.current) {
    polylineRef.current.forEach((polyline: any) => {
      polyline.setMap(null);
    });
    polylineRef.current = [];
  }
  
  // 길찾기 정보 InfoWindow 닫기
  if (routeInfoWindowRef.current) {
    routeInfoWindowRef.current.close();
  }
  
  setCurrentDestination(null);
  
  // jobs가 비어있으면 더 이상 진행하지 않음
  if (!mapRef.current || !markerPosition || !jobs.length) return;

  // 이하 기존 코드 동일...
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
            font-family: 'Inter', sans-serif;
            background: linear-gradient(145deg, #f8fafc, #ffffff);
            border-radius: 1.2rem;
            box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.08), 
                        0 15px 25px -10px rgba(0, 0, 0, 0.04);
            color: #1f2937;
            overflow: hidden;
            width: 360px;
            position: relative;
            border: 1px solid rgba(229, 231, 235, 0.5);
          ">
            <div style="
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 5px;
              background: linear-gradient(90deg, #3b82f6, #6366f1);
            "></div>
      
            <button 
              onclick="window.closeInfoWindow && window.closeInfoWindow('${location.url}')"
              style="
                position: absolute;
                top: 0.6rem;
                right: 0.6rem;
                width: 24px;
                height: 24px;
                background: rgba(31,41,55,0.04);
                border: 1px solid rgba(31,41,55,0.08);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                z-index: 10;
              "
              onmouseover="this.style.background='rgba(239,68,68,0.1)'; this.style.border='1px solid rgba(239,68,68,0.2)'"
              onmouseout="this.style.background='rgba(31,41,55,0.04)'; this.style.border='1px solid rgba(31,41,55,0.08)'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
      
            <div style="padding: 1.5rem; padding-top: 2rem; position: relative;">
              <div style="display: flex; align-items: center; margin-bottom: 1.2rem;">
                <div style="
                  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
                  width: 48px;
                  height: 48px;
                  border-radius: 12px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin-right: 1rem;
                  box-shadow: 0 8px 15px -4px rgba(59,130,246,0.25);
                ">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </div>
                <div>
                  <h4 style="
                    margin: 0; 
                    font-size: 0.9rem; 
                    font-weight: 700; 
                    color: #1f2937;
                    margin-bottom: 0.25rem;
                    line-height: 1.2;
                  ">
                    ${location.position_title}
                  </h4>
                  <p style="
                    margin: 0; 
                    font-size: 0.75rem; 
                    color: #6b7280;
                    line-height: 1.3;
                  ">
                    ${location.company_name}
                  </p>
                </div>
              </div>
      
              <div style="
                background: #f4f5f7;
                border-radius: 0.75rem;
                padding: 0.9rem;
                margin-bottom: 1.2rem;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                border: 1px solid rgba(229,231,235,0.7);
              ">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span style="color: #1f2937; font-size: 0.75rem;">${location.Address}</span>
              </div>
              
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
                <button 
                  onclick="window.open('${location.url}', '_blank');"
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.6rem;
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    border: none;
                    border-radius: 0.75rem;
                    font-weight: 600;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    gap: 0.5rem;
                    box-shadow: 0 6px 12px -4px rgba(59,130,246,0.3);
                    font-size: 0.7rem;
                  "
                  onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 15px -5px rgba(59,130,246,0.4)'"
                  onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 6px 12px -4px rgba(59,130,246,0.3)'"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  공고보기
                </button>
                <button 
                  onclick="window.navigateToAIInterview && window.navigateToAIInterview('${encodeURIComponent(location.position_job_mid_code_name)}', '${encodeURIComponent(location.company_name)}')"
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.6rem;
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white;
                    border: none;
                    border-radius: 0.75rem;
                    font-weight: 600;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    gap: 0.5rem;
                    box-shadow: 0 6px 12px -4px rgba(16,185,129,0.3);
                    font-size: 0.7rem;
                  "
                  onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 15px -5px rgba(16,185,129,0.4)'"
                  onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 6px 12px -4px rgba(16,185,129,0.3)'"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                  AI 면접
                </button>
      
                <button 
                  onclick="window.drawRouteToJob && window.drawRouteToJob(${location.Latitude}, ${location.Longitude})" 
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.6rem;
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    color: white;
                    border: none;
                    border-radius: 0.75rem;
                    font-weight: 600;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    gap: 0.5rem;
                    box-shadow: 0 6px 12px -4px rgba(245,158,11,0.3);
                    font-size: 0.7rem;
                  "
                  onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 15px -5px rgba(245,158,11,0.4)'"
                  onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 6px 12px -4px rgba(245,158,11,0.3)'"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 3h5v5"></path>
                    <path d="M8 3H3v5"></path>
                    <path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L5 7"></path>
                    <path d="m15 9 2.202 2.202a4 4 0 0 1 1.132 2.607v4.391"></path>
                  </svg>
                  길 찾기
                </button>
      
                <button 
                  onclick="window.showRoadview && window.showRoadview(${location.Latitude}, ${location.Longitude})" 
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0.6rem;
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                    color: white;
                    border: none;
                    border-radius: 0.75rem;
                    font-weight: 600;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    gap: 0.5rem;
                    box-shadow: 0 6px 12px -4px rgba(99,102,241,0.3);
                    font-size: 0.7rem;
                  "
                  onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 15px -5px rgba(99,102,241,0.4)'"
                  onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 6px 12px -4px rgba(99,102,241,0.3)'"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                  로드뷰
                </button>
              </div>
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

  // 선택된 잡 마커 처리 useEffect
  useEffect(() => {
    if (selectedJobId && jobMarkersMapRef.current[selectedJobId]) {
      const { marker, infoWindow } = jobMarkersMapRef.current[selectedJobId];
      mapRef.current.setCenter(marker.getPosition());
      infoWindow.open(mapRef.current, marker);
    }
  }, [selectedJobId]);

  // 마커 위치 변경 시 현재 길찾기 정보 업데이트
  useEffect(() => {
    if (markerPosition && currentDestination) {
      drawRoute(markerPosition, currentDestination);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markerPosition]);

  // 로드뷰 모달 스타일
  const roadviewModalProps = {
    title: (
      <div className="flex items-center gap-3 p-2">
        <Compass className="w-6 h-6 text-blue-600" />
        <span className="text-xl font-semibold text-gray-800">로드뷰</span>
      </div>
    ),
    centered: true,
    width: 1250,
    bodyStyle: { 
      padding: '1rem', 
      backgroundColor: 'white',
      borderRadius: '1rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
    },
    style: { top: 20 },
    closeIcon: (
      <X className="text-gray-500 hover:text-red-500 transition-colors" />
    )
  };

  return (
    <div className="relative w-full h-screen">
      {/* 지도 컨테이너 */}
      <div 
        id="map" 
        className="w-full h-full shadow-lg rounded-xl overflow-hidden border-4 border-white/50 transition-all duration-300 hover:shadow-2xl"
      />

      {/* 로드뷰 모달 */}
      <Modal
        {...roadviewModalProps}
        open={isRoadviewVisible}
        onCancel={() => setIsRoadviewVisible(false)}
        footer={null}
      >
        <div 
          id="roadview" 
          className="w-full h-[600px] rounded-2xl overflow-hidden shadow-2xl border border-gray-100 transform transition-all duration-300 hover:scale-[1.005]"
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
