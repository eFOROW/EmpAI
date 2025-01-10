'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, Select } from 'antd';
import { User } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Video, AlertTriangle, Settings, CheckCircle2, XCircle } from 'lucide-react';

interface AnalysisResponse {
    status: string;
  }

interface DeviceCheckProps {
    user: User;
    stream: MediaStream | null;
    setStream: (stream: MediaStream | null) => void;
    onComplete: (response: AnalysisResponse) => void;
}

const AudioVisualizer = ({ stream }: { stream: MediaStream | null }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
    const animationFrameId = useRef<number>();

    useEffect(() => {
        if (!stream) return;

        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyserNode = audioCtx.createAnalyser();
        analyserNode.fftSize = 256;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyserNode);

        setAudioContext(audioCtx);
        setAnalyser(analyserNode);

        return () => {
            if (audioCtx.state !== 'closed') {
                audioCtx.close();
            }
        };
    }, [stream]);

    useEffect(() => {
        if (!analyser || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const draw = () => {
            animationFrameId.current = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);
      
            ctx.fillStyle = '#F3F4F6';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            gradient.addColorStop(0, '#60A5FA');
            gradient.addColorStop(0.5, '#34D399');
            gradient.addColorStop(1, '#F59E0B');
            ctx.fillStyle = gradient;
      
            const barWidth = canvas.width / dataArray.length;
            dataArray.forEach((value, i) => {
                const barHeight = (value / 255) * canvas.height * 0.8;
                const x = i * barWidth;
                const radius = 1;
                
                ctx.beginPath();
                ctx.roundRect(
                    x, 
                    canvas.height - barHeight, 
                    barWidth - 1, 
                    barHeight,
                    radius
                );
                ctx.fill();
            });
        };
      
        draw();
        
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [analyser]);

    return (
        <canvas
            ref={canvasRef}
            width={180}
            height={30}
            className="rounded-lg shadow-sm"
        />
    );
};

const GuidePoint = ({ icon, title, description }: { icon: JSX.Element, title: string, description: string }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl"
    >
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full text-blue-600">
            {icon}
        </div>
        <div>
            <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>
    </motion.div>
);

export function DeviceCheck({ user, stream, setStream, onComplete }: DeviceCheckProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<string>('');
    const [showModal, setShowModal] = useState(false);
    const [showDeviceErrorModal, setShowDeviceErrorModal] = useState(false);
    const [deviceStatus, setDeviceStatus] = useState({
        audio: false,
        video: false
    });


    const handleOpenModal = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleCloseErrorModal = () => {
        setShowDeviceErrorModal(false);
    };

    const handleStartInterview = async () => {
        if (!deviceStatus.audio || !deviceStatus.video) {
          setShowDeviceErrorModal(true);
          return;
        }
      
        try {
          const response = await fetch('/api/interview/analysis_request', {
            method: 'GET'
          });
      
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
      
          const data: AnalysisResponse = await response.json();
          onComplete({ status: data.status });
      
        } catch (error) {
          console.error('Failed to start interview:', error);
          onComplete({ status: 'error' });
        }
      };

    const checkDeviceStatus = (stream: MediaStream | null) => {
        if (stream) {
            const hasAudio = stream.getAudioTracks().length > 0 && stream.getAudioTracks()[0].enabled;
            const hasVideo = stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled;
            setDeviceStatus({ audio: hasAudio, video: hasVideo });
        } else {
            setDeviceStatus({ audio: false, video: false });
        }
    };

    const initializeCamera = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            setDevices(videoDevices);

            if (videoDevices.length > 0) {
                const newStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                
                setStream(newStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = newStream;
                }
                setSelectedDevice(videoDevices[0].deviceId);
                checkDeviceStatus(newStream);
            }
        } catch (err) {
            console.error('Error accessing media devices:', err);
            checkDeviceStatus(null);
        }
    };

        // ESLint 경고를 비활성화
    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        if (user) {
            initializeCamera();
        }
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [user]);
    /* eslint-enable react-hooks/exhaustive-deps */

    const handleDeviceChange = async (value: string) => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        
        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: value },
                audio: true
            });
            setStream(newStream);
            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
            }
            setSelectedDevice(value);
            checkDeviceStatus(newStream);
        } catch (err) {
            console.error('Error switching device:', err);
            checkDeviceStatus(null);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                    면접 시작 전 기기를 확인해 주세요
                </h1>
                <p className="text-gray-600">
                    원활한 면접 진행을 위해 카메라와 마이크 상태를 확인합니다
                </p>
            </motion.div>
            
            <div className="grid grid-cols-2 gap-8">
                {/* 왼쪽: 가이드라인 */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-blue-500" />
                            기기 연결 가이드
                        </h2>
                        
                        <div className="space-y-4">
                            <GuidePoint
                                icon={<Mic className="w-5 h-5" />}
                                title="마이크 연결 확인"
                                description="마이크가 PC에 올바르게 연결되어 있는지 확인해주세요. 브라우저의 마이크 권한을 '허용'으로 설정해야 합니다."
                            />
                            
                            <GuidePoint
                                icon={<Video className="w-5 h-5" />}
                                title="카메라 화질 확인"
                                description="카메라 화면이 선명하게 보이는지 확인해주세요. 조명이 충분한 환경에서 진행하시면 좋습니다."
                            />
                            
                            <GuidePoint
                                icon={<AlertTriangle className="w-5 h-5" />}
                                title="주의사항"
                                description="조용한 공간에서 면접을 진행해주세요. 다른 사람의 음성이나 소음이 녹음되지 않도록 해주세요."
                            />
                        </div>
                        
                        <div className="mt-6 p-4 bg-amber-50 rounded-xl">
                            <p className="text-amber-700 text-sm">
                                마이크 권한이 차단되었다면{' '}
                                <a
                                    href="#"
                                    onClick={handleOpenModal}
                                    className="text-blue-500 hover:underline font-medium"
                                >
                                    여기를 클릭
                                </a>
                                하여 설정을 변경해주세요.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* 오른쪽: 카메라 미리보기 및 컨트롤 */}
                <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
                <div className="mb-6">
                    {/* 상단 디바이스 상태 줄 */}
                    <div className="flex items-center justify-between mb-6 bg-gray-50 rounded-xl p-4">
                        <h3 className="font-semibold text-gray-800">디바이스 상태</h3>
                        <div className="flex gap-3">
                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg">
                                {deviceStatus.video ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : (
                                    <XCircle className="w-4 h-4 text-red-500" />
                                )}
                                <span className="text-sm font-medium text-gray-600">카메라</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg">
                                {deviceStatus.audio ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : (
                                    <XCircle className="w-4 h-4 text-red-500" />
                                )}
                                <span className="text-sm font-medium text-gray-600">마이크</span>
                            </div>
                        </div>
                    </div>

                    {/* 디바이스 선택 섹션 */}
                    <div className="flex items-center justify-end gap-4 mb-6">
                        <AudioVisualizer stream={stream} />
                        <Select
                            style={{ width: 250 }}
                            value={selectedDevice}
                            onChange={handleDeviceChange}
                            className="rounded-lg"
                            placeholder="카메라 선택"
                        >
                            {devices.map(device => (
                                <Select.Option key={device.deviceId} value={device.deviceId}>
                                    {device.label || `카메라 ${device.deviceId.substring(0, 5)}...`}
                                </Select.Option>
                            ))}
                        </Select>
                    </div>
                    
                    <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-video">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                        {!deviceStatus.video && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 text-white">
                                <div className="text-center">
                                    <Video className="w-12 h-12 mb-2 mx-auto text-gray-400" />
                                    <p>카메라가 연결되지 않았습니다</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button 
                        type="primary" 
                        onClick={handleStartInterview}
                        disabled={!deviceStatus.audio || !deviceStatus.video}
                        className={`px-8 h-12 text-base rounded-xl ${
                            (!deviceStatus.audio || !deviceStatus.video)
                                ? 'bg-gray-300'
                                : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-none'
                        }`}
                    >
                        면접 시작하기
                    </Button>
                </div>
            </motion.div>
            </div>

            {/* 권한 설정 모달 */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-xl w-[600px] overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4 flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <Settings className="w-5 h-5" />
                                    마이크 권한 설정 방법
                                </h2>
                            </div>

                            <div className="p-6 space-y-6">
                                {[
                                    {
                                        number: "1",
                                        text: "Chrome 브라우저의 우측 상단에서 더보기 (⋮) > 설정을 클릭합니다."
                                    },
                                    {
                                        number: "2",
                                        text: "개인 정보 및 보안 > 사이트 설정 > 마이크를 찾아 클릭합니다."
                                    },
                                    {
                                        number: "3",
                                        text: "현재 웹사이트의 마이크 권한을 '허용'으로 변경합니다."
                                    },
                                    {
                                        number: "4",
                                        text: "차단된 사이트 목록에서 현재 사이트를 찾아 권한을 '허용'으로 변경합니다."
                                    }
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"
                                    >
                                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full text-white font-semibold text-sm">
                                            {item.number}
                                        </div>
                                        <p className="text-gray-700 text-base leading-relaxed mt-0.5">
                                            {item.text}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="border-t p-4 bg-gray-50 flex justify-end">
                                <Button
                                    type="primary"
                                    onClick={handleCloseModal}
                                    className="px-6 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-none rounded-xl"
                                >
                                    확인했습니다
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* 디바이스 에러 모달 */}
                {showDeviceErrorModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-xl w-[400px] overflow-hidden"
                        >
                            <div className="bg-red-50 px-6 py-4">
                                <h2 className="text-lg font-semibold text-red-700 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    디바이스 연결 오류
                                </h2>
                            </div>

                            <div className="p-6">
                                <p className="text-gray-700 text-center mb-6">
                                    {!deviceStatus.video && !deviceStatus.audio && "카메라와 마이크가 연결되지 않았습니다."}
                                    {!deviceStatus.video && deviceStatus.audio && "카메라가 연결되지 않았습니다."}
                                    {deviceStatus.video && !deviceStatus.audio && "마이크가 연결되지 않았습니다."}
                                    <br />
                                    <span className="text-sm text-gray-500 mt-2 block">
                                        디바이스 연결을 확인하고 브라우저 권한을 허용해 주세요.
                                    </span>
                                </p>

                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleCloseErrorModal}
                                        type="primary"
                                        className="px-6 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 border-none rounded-xl"
                                    >
                                        확인
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}