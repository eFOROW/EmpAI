// DeviceCheck.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, Select } from 'antd';
import { User } from 'firebase/auth';

interface DeviceCheckProps {
    user: User;
    stream: MediaStream | null;
    setStream: (stream: MediaStream | null) => void;
    onComplete: () => void;
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

            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / dataArray.length) * 2.5;
            let barHeight;
            let x = 0;

            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            const maxHeight = canvas.height * 0.8;
            const heightScale = maxHeight / 255;

            ctx.fillStyle = '#3B82F6';
            barHeight = average * heightScale;
            ctx.fillRect(0, (canvas.height - barHeight) / 2, canvas.width, barHeight);
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
            width={200}
            height={40}
            className="rounded-full bg-white"
        />
    );
};

export function DeviceCheck({ user, stream, setStream, onComplete }: DeviceCheckProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<string>('');
    const [showModal, setShowModal] = useState(false);

    const handleOpenModal = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const initializeCamera = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            setDevices(videoDevices);

            if (videoDevices.length > 0) {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                
                setStream(stream);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setSelectedDevice(videoDevices[0].deviceId);
            }
        } catch (err) {
            console.error('Error accessing media devices:', err);
        }
    };

    useEffect(() => {
        if (user) {
            initializeCamera();
        }
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

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
        } catch (err) {
            console.error('Error switching device:', err);
        }
    };

    return (
        <div className="w-full max-w-7xl">
            <h1 className="text-2xl font-bold text-center mb-8">연결된 기기를 확인해 주세요</h1>
            
            <div className="grid grid-cols-2 gap-8">
                {/* 왼쪽: 가이드라인 */}
                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h2 className="text-base font-semibold mb-4">마이크 테스트 가이드</h2>
                    <ul className="space-y-2 mb-4 text-sm text-gray-700">
                        <li>• 마이크가 PC(노트북)에 연결되어 있는지 확인해 주세요.</li>
                        <li className="flex items-start gap-2">
                            <span>• 상단 발열의 마이크 권한을 &apos;허용&apos;으로 선택해 주세요.</span>
                            <a
                                href="#"
                                onClick={handleOpenModal}
                                className="text-blue-500 hover:underline text-sm cursor-pointer ml-1 whitespace-nowrap"
                            >
                                차단했다면 이곳을 클릭해주세요.
                            </a>
                        </li>
                        <li>• 영상은 녹화되지 않으며 음성만 녹음됩니다.</li>
                    </ul>
                    
                    <div className="border-t border-gray-200 my-6"></div>
                    
                    <h3 className="text-sm font-medium mb-2">소음</h3>
                    <ul className="space-y-2 mb-4 text-sm text-gray-700">
                        <li>1. 조용한 공간에서 면접을 진행해 주세요.</li>
                        <li>2. 이어폰 사용 시 마이크에 닿는 옷 또는 머리카락 때문에 소음이 생길 수 있으니 주의해 주세요.</li>
                        <li>3. 다른 사람의 음성이 녹음되지 않도록 해 주세요.</li>
                    </ul>
                    
                    <div className="border-t border-gray-200 my-6"></div>
                    
                    <h3 className="text-sm font-medium mb-2">오류를 일으키는 주요원인</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li>1. 마이크 사용 중 하울링(소리 증폭 현상)이 발생하면 소리가 커져서 음성 검출이 어려워질 수 있습니다.</li>
                        <li>2. 이어폰 사용 시에는 마이크가 있는 기기를 사용해 주세요.</li>
                        <li>3. 음성 전달에 영향을 미치는 마스크를 착용하지 말아 주세요.</li>
                    </ul>
                </div>

                {/* 오른쪽: 카메라 미리보기 및 컨트롤 */}
                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="font-medium">마이크</span>
                            <div className="flex items-center gap-4">
                                <AudioVisualizer stream={stream} />
                                <Select
                                    style={{ width: 300 }}
                                    value={selectedDevice}
                                    onChange={handleDeviceChange}
                                >
                                    {devices.map(device => (
                                        <Select.Option key={device.deviceId} value={device.deviceId}>
                                            {device.label || `카메라 ${device.deviceId.substring(0, 5)}...`}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                        <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ height: '400px' }}>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 mt-8">
                        <Button 
                            onClick={initializeCamera} 
                            className="px-8 h-10 text-base"
                        >
                            건너뛰기
                        </Button>
                        <Button 
                            type="primary" 
                            onClick={onComplete} 
                            className="px-8 h-10 text-base"
                        >
                            연결 확인
                        </Button>
                    </div>
                </div>
            </div>

                            {/* 모달 */}
                            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg w-[600px]"> {/* 고정된 너비 설정 */}
                        <div className="border-b px-6 py-4 bg-blue-100 rounded-t-lg">
                            <h2 className="text-xl font-semibold text-gray-800">
                                마이크 권한 변경하기
                            </h2>
                        </div>

                        <div className="p-6 space-y-6"> {/* 간격 조정 */}
                            {[
                                {
                                    number: "1",
                                    text: "Chrome 브라우저의 우측 상단에서 더보기 > 설정을 클릭합니다."
                                },
                                {
                                    number: "2",
                                    text: "개인 정보 및 보안 > 사이트 설정 > 마이크를 클릭합니다."
                                },
                                {
                                    number: "3",
                                    text: "사용하려는 웹사이트 기본 설정으로 선택합니다."
                                },
                                {
                                    number: "4", // 숫자 수정
                                    text: "차단한 사이트를 허용하려면 '허용되지않음'에서 사이트 이름을 선택하고 마이크 권한을 허용으로 변경합니다."
                                }
                            ].map((item, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-200 rounded-full text-blue-600 font-semibold text-lg">
                                        {item.number}
                                    </div>
                                    <p className="text-gray-700 text-base leading-relaxed mt-0.5">
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="border-t p-4 flex justify-end bg-gray-50 rounded-b-lg">
                            <button
                                onClick={handleCloseModal}
                                className="px-6 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}