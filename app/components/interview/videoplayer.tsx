'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { 
  Play, 
  Pause, 
  Loader, 
  Volume2, 
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Volume1,
  Volume,
} from 'lucide-react';

interface VideoPlayerProps {
    uid: string;
    filename: string;
    className?: string;
  }

  export default function VideoPlayer({ uid, filename }: VideoPlayerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isVolumeSliderVisible, setIsVolumeSliderVisible] = useState(false);
  const [previewRequested, setPreviewRequested] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const previewUrlRef = useRef<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [shouldLoadPreview, setShouldLoadPreview] = useState(true);

  // 시간 포맷 함수
  const formatTime = (seconds: number): string => {
  if (!isFinite(seconds) || isNaN(seconds)) return "00:00";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

  const cleanupPreviousPreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, []);

  const loadPreview = useCallback(async () => {
    if (isLoading || previewUrl || previewRequested) return;
  
    setIsLoading(true);
    setPreviewRequested(true);
    setError(null);
    try {  
      const response = await fetch('/api/interview/video_request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          uid, 
          filename,
          type: 'preview' 
        })
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response text:', errorText);
  
        if (response.status === 404) {
          // 404 오류의 경우 더 이상 요청을 보내지 않음
          throw new Error('프리뷰 이미지를 찾을 수 없습니다.');
        }
        throw new Error('프리뷰를 불러올 수 없습니다.');
      }
      
      const blob = await response.blob();
      cleanupPreviousPreview();
      
      const newUrl = URL.createObjectURL(blob);
      previewUrlRef.current = newUrl;
      setPreviewUrl(newUrl);
    } catch (err) {
      console.error('Full error:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      console.error('프리뷰 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
  }, [uid, filename, cleanupPreviousPreview, isLoading, previewUrl, previewRequested]);

  useEffect(() => {
    if (!uid || !filename) return;

    loadPreview();

    return () => {
      cleanupPreviousPreview();
    };
  }, [uid, filename, loadPreview, cleanupPreviousPreview]);

  // 재생/일시정지 토글
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
      setShowPreview(false);  // 재생 시작 시 프리뷰 숨기기
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // 음소거 토글
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  // 음량 조절
  const handleVolumeChange = useCallback((newVolume: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  // 전체화면 토글
  const toggleFullscreen = useCallback(() => {
    if (!playerRef.current) return;

    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch(err => {
        console.error(`전체화면 에러: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  // 10초 앞으로/뒤로
  const seek = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, videoRef.current.duration));
  }, []);

  // 컨트롤 표시 관리
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  // 비디오 이벤트 리스너
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

     const handlePlay = () => {
      setIsPlaying(true);
      setShowPreview(false);
       if (videoRef.current) {
    setDuration(videoRef.current.duration);
  }
        // 재생 시작 시 프리뷰 숨기기
    };
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100);
    };
    const handleDurationChange = () => setDuration(video.duration);
    const handleError = () => {
      setError('비디오 재생 중 오류가 발생했습니다.');
      setIsBuffering(false);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('error', handleError);
    };
  }, []);

  // 전체화면 변경 감지
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);


  const handleProgressBarClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progressBar = progressBarRef.current;
    if (!video || !progressBar || !video.duration) return;
  
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * video.duration;
    
    if (isFinite(newTime)) {
      video.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress((newTime / video.duration) * 100);
    }
  }, []);

  // 초기 로드
 

  // 볼륨 아이콘 선택
  const VolumeIcon = isMuted ? VolumeX : 
    volume > 0.5 ? Volume2 : 
    volume > 0 ? Volume1 : 
    Volume;

    return (
      <div 
        ref={playerRef}
        className="relative aspect-video bg-black rounded-lg overflow-hidden group"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {showPreview && previewUrl && (
          <div className="absolute inset-0">
            <Image
              src={previewUrl}
              alt="비디오 프리뷰"
              fill
              className="object-contain"
              priority
              unoptimized
            />
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-16 h-16 flex items-center justify-center bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-opacity"
            >
              <Play className="text-white" size={32} />
            </button>
          </div>
        )}

      <video
        ref={videoRef}
        className="w-full h-full"
        preload="none"
        onClick={togglePlay}
      >
        <source
          src={`/api/interview/video_request?uid=${uid}&filename=${filename}`}
          type="video/webm"
        />
      </video>

      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <Loader className="animate-spin text-white" size={48} />
        </div>
      )}

      {/* 컨트롤 오버레이 */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* 프로그레스 바 */}
        <div
          ref={progressBarRef}
          className="h-1 bg-gray-600 cursor-pointer group/progress"
          onClick={handleProgressBarClick}
        >
          <div
            className="h-full bg-red-500 relative group-hover/progress:h-1.5 transition-all"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full opacity-0 group-hover/progress:opacity-100" />
          </div>
        </div>

        {/* 컨트롤 버튼들 */}
        <div className="px-4 py-2 flex items-center gap-4">
          {/* 재생/일시정지 */}
          <button
            onClick={togglePlay}
            className="text-white hover:text-gray-300"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>

          {/* 10초 되감기/앞으로 */}
          <button
            onClick={() => seek(-10)}
            className="text-white hover:text-gray-300"
          >
            <RotateCcw size={20} />
          </button>
          <button
            onClick={() => seek(10)}
            className="text-white hover:text-gray-300"
          >
            <RotateCw size={20} />
          </button>

          {/* 시간 표시 */}
          <div className="text-white text-sm">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          {/* 음량 컨트롤 */}
          <div className="relative group/volume ml-auto">
            <button
              onClick={toggleMute}
              onMouseEnter={() => setIsVolumeSliderVisible(true)}
              className="text-white hover:text-gray-300"
            >
              <VolumeIcon size={24} />
            </button>
            <div
              className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-8 h-24 bg-black/90 rounded-lg p-2 ${
                isVolumeSliderVisible ? 'block' : 'hidden'
              }`}
              onMouseEnter={() => setIsVolumeSliderVisible(true)}
              onMouseLeave={() => setIsVolumeSliderVisible(false)}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                 className="w-20 h-1 -rotate-90 origin-left translate-x-2 translate-y-[65px] bg-white/30 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
{/* 전체화면 버튼 */}
<button
            onClick={toggleFullscreen}
            className="text-white hover:text-gray-300 ml-4"
          >
            {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
          </button>
        </div>
      </div>

      {/* 로딩 인디케이터 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader className="animate-spin text-white" size={48} />
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-center p-4">
            <p className="mb-2">{error}</p>
            <button
              onClick={loadPreview}
              className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200"
            >
              다시 시도
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
         