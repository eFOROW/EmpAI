import { useState, useEffect, useCallback } from 'react';

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

    const checkServerStatus = useCallback(async () => {
        const updatedServers = await Promise.all(servers.map(async (server) => {
            try {
                const isActive = Math.random() > 0.2;
                return {
                    ...server,
                    status: isActive ? 'active' : 'inactive',
                    lastChecked: new Date()
                };
            } catch (error) {
                return { ...server, status: 'inactive', lastChecked: new Date() };
            }
        }));
        setServers(updatedServers as ServerInfo[]);
    }, [servers]);

    useEffect(() => {
        checkServerStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold mb-8">Server Status</h1>
                <div className="grid grid-cols-2">
                {servers.map((server, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between h-40 w-80">
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
                                {server.status === 'active' ? '활성화' : '비활성화'}
                            </span>
                        </div>
                    </div>
                ))}
                </div>
            </div>
        </div>
    );
}