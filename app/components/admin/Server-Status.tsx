import { useState, useEffect } from 'react';

interface ServerInfo {
    name: string;
    status: 'active' | 'inactive';
    lastChecked: Date;
}

export default function ServerStatus() {
    const [servers, setServers] = useState<ServerInfo[]>([
        {
            name: '자기소개서 LLM 서버',
            status: 'inactive',
            lastChecked: new Date()
        },
        {
            name: 'AI 면접 분석 서버',
            status: 'inactive',
            lastChecked: new Date()
        }
    ]);

    const checkServerStatus = async () => {
        try {
            const response = await fetch('/api/admin/server-status');
            const data = await response.json();
            setServers(data.servers.map((server: any) => ({
                ...server,
                lastChecked: new Date(server.lastChecked)
            })));
        } catch (error) {
            console.error('Failed to check server status:', error);
        }
    };

    // 초기 로딩 시에만 상태 확인
    useEffect(() => {
        checkServerStatus();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold mb-8">Server Status</h1>
                <div className="flex gap-2">
                    {servers.map((server, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between h-40 w-72">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">{server.name}</h3>
                                <p className="text-sm text-gray-500">
                                    최근 확인: {server.lastChecked.toLocaleTimeString()}
                                </p>
                            </div>
                            <div className="flex items-center mt-4">
                                <div className={`w-4 h-4 rounded-full mr-3 ${
                                    server.status === 'active' 
                                        ? 'bg-green-500 animate-pulse' 
                                        : 'bg-red-500'
                                }`} />
                                <span className={`font-medium ${
                                    server.status === 'active' 
                                        ? 'text-green-500' 
                                        : 'text-red-500'
                                }`}>
                                    {server.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}