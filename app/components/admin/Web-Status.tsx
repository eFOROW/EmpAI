'use client'

import { useEffect, useState, useRef } from 'react';
import { Card, Spin, Alert, Select, Button, Menu } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ReloadOutlined, GlobalOutlined } from '@ant-design/icons';

interface Status {
  _id: string;
  cpuUsage: number;
  memoryUsage: number;
  inboundTraffic: number;
  outboundTraffic: number;
  timestamp: string;
  maxInboundTraffic: number;
  maxOutboundTraffic: number;
}

export default function WebStatus() {
  const [systemStatus, setSystemStatus] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('1d');
  const [accessLogs, setAccessLogs] = useState<string[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [errorLogs, setErrorLogs] = useState<string[]>([]);
  const [loadingErrorLogs, setLoadingErrorLogs] = useState(true);
  const [accessLogSearch, setAccessLogSearch] = useState('');
  const [errorLogSearch, setErrorLogSearch] = useState('');
  
  const accessLogRef = useRef<HTMLDivElement>(null);
  const errorLogRef = useRef<HTMLDivElement>(null);

  const fetchSystemStatus = async (range: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/system-status?range=${range}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        throw new Error('상태 응답이 좋지 않습니다.');
      }
      const data: Status[] = await response.json();
      setSystemStatus(data);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccessLogs = async () => {
    setLoadingLogs(true);
    try {
      const response = await fetch('/api/admin/access-log');
      if (!response.ok) {
        throw new Error('접근로그 응답이 좋지 않습니다.');
      }
      const data: string[] = await response.json();
      setAccessLogs(data);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchErrorLogs = async () => {
    setLoadingErrorLogs(true);
    try {
      const response = await fetch('/api/admin/error-log');
      if (!response.ok) {
        throw new Error('오류로그 응답이 좋지 않습니다.');
      }
      const data: string[] = await response.json();
      setErrorLogs(data);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoadingErrorLogs(false);
    }
  };

  useEffect(() => {
    fetchSystemStatus(timeRange);
    fetchAccessLogs();
    fetchErrorLogs();
  }, [timeRange]);

  useEffect(() => {
    if (accessLogRef.current) {
      accessLogRef.current.scrollTop = accessLogRef.current.scrollHeight;
    }
    if (errorLogRef.current) {
      errorLogRef.current.scrollTop = errorLogRef.current.scrollHeight;
    }
  }, [accessLogs, errorLogs]);

  const chartData = systemStatus.map(status => {
    const date = new Date(status.timestamp);
    
    const formatTraffic = (trafficValue: number | undefined | null) => {
      if (trafficValue === undefined || trafficValue === null) {
        return 0;
      }
      return +(trafficValue.toFixed(2));
    };

    return {
      timestamp: date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      cpuUsage: status.cpuUsage || 0,
      memoryUsage: status.memoryUsage || 0,
      inboundTraffic: formatTraffic(status.inboundTraffic * 40 ),
      outboundTraffic: formatTraffic(status.outboundTraffic * 50 )
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-sm">
          <h3>{label}</h3>
          {payload.map((pld: any) => (
            <div key={pld.dataKey} style={{ color: pld.color }}>
              <span>{pld.name}: {typeof pld.value === 'number' ? pld.value.toFixed(2) : pld.value}{pld.unit}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = (
    data: any,
    dataKey: string,
    name: string,
    color: string,
    unit: string
  ) => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="timestamp" hide />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey={dataKey}
          name={name}
          stroke={color}
          unit={unit}
          dot={false}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const filteredAccessLogs = accessLogs.filter(log => 
    log.toLowerCase().includes(accessLogSearch.toLowerCase())
  );

  const filteredErrorLogs = errorLogs.filter(log => 
    log.toLowerCase().includes(errorLogSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <GlobalOutlined className="text-5xl text-blue-500 animate-bounce mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">웹 서버 상태 분석 중...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Web Server Status</h1>
        <div className="flex items-center mb-4">
          <Select
            value={timeRange}
            style={{ width: 120 }}
            onChange={(value) => {
              setTimeRange(value);
              fetchSystemStatus(value);
            }}
          >
            <Select.Option value="1h">최근 1시간</Select.Option>
            <Select.Option value="1d">최근 1일</Select.Option>
            <Select.Option value="1w">최근 1주일</Select.Option>
          </Select>
          <Button 
            onClick={() => fetchSystemStatus(timeRange)} 
            icon={<ReloadOutlined />}
            type="text"
            className="ml-2"
          >
            다시 가져오기
          </Button>
        </div>
        {error && <Alert message={error} type="error" />}
        
        <div className="flex space-x-4 mb-4">
          <Card title="CPU 사용량" bordered={false} className="flex-1">
            {renderChart(chartData, 'cpuUsage', 'CPU 사용량', '#1890ff', '%')}
          </Card>

          <Card title="메모리 사용량" bordered={false} className="flex-1">
            {renderChart(chartData.map(status => ({
              ...status,
              memoryUsage: (status.memoryUsage * 512 / 100).toFixed(2)
            })), 'memoryUsage', '메모리 사용량', '#52c41a', 'MB')}
          </Card>
        </div>

        <Card title="트래픽 사용량" bordered={false}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="timestamp" hide />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="inboundTraffic"
                name="Inbound"
                stroke="#ff4d4f"
                dot={false}
                strokeWidth={2}
                unit='MBps'
              />
              <Line
                type="monotone"
                dataKey="outboundTraffic"
                name="Outbound"
                stroke="#52c41a"
                dot={false}
                strokeWidth={2}
                unit='MBps'
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title={
          <div className="flex justify-between items-center">
            <span>Access Logs</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="로그 검색..."
                value={accessLogSearch}
                onChange={(e) => setAccessLogSearch(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md"
              />
              <Button 
                onClick={fetchAccessLogs} 
                icon={<ReloadOutlined />} 
                loading={loadingLogs}
                type="text"
              >
                다시 가져오기
              </Button>
            </div>
          </div>
        } bordered={false} className="mt-4">
          {loadingLogs ? (
            <Spin tip="로그 로딩 중..." />
          ) : (
            <div ref={accessLogRef} style={{ maxHeight: '300px', overflowY: 'auto' }} className="whitespace-pre-wrap">
              {filteredAccessLogs.length > 0 ? filteredAccessLogs.map((log, index) => (
                <div key={index}>{log}</div>
              )) : (
                <Alert message={accessLogSearch ? "검색 결과가 없습니다." : "로그가 없습니다."} type="info" />
              )}
            </div>
          )}
        </Card>

        <Card title={
          <div className="flex justify-between items-center">
            <span>Error Logs</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="로그 검색..."
                value={errorLogSearch}
                onChange={(e) => setErrorLogSearch(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md"
              />
              <Button 
                onClick={fetchErrorLogs} 
                icon={<ReloadOutlined />} 
                loading={loadingErrorLogs}
                type="text"
              >
                다시 가져오기
              </Button>
            </div>
          </div>
        } bordered={false} className="mt-4">
          {loadingErrorLogs ? (
            <Spin tip="에러 로그 로딩 중..." />
          ) : (
            <div ref={errorLogRef} style={{ maxHeight: '300px', overflowY: 'auto' }} className="whitespace-pre-wrap">
              {filteredErrorLogs.length > 0 ? filteredErrorLogs.map((log, index) => (
                <div key={index}>{log}</div>
              )) : (
                <Alert message={errorLogSearch ? "검색 결과가 없습니다." : "에러 로그가 없습니다."} type="info" />
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
} 