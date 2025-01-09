'use client'

import { useEffect, useState, useRef } from 'react';
import { Card, Spin, Alert, Select, Button, Menu } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ReloadOutlined } from '@ant-design/icons';

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
  
  const accessLogRef = useRef<HTMLDivElement>(null);
  const errorLogRef = useRef<HTMLDivElement>(null);

  const fetchSystemStatus = async (range: string) => {
    try {
      const response = await fetch(`/api/admin/system-status?range=${range}`);
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Web Server Status</h1>
        <div className="flex items-center mb-4">
          <Select
            defaultValue="1d"
            style={{ width: 120 }}
            onChange={setTimeRange}
          >
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
        {loading && <Spin tip="로딩 중..." />}
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
            <Button 
              onClick={fetchAccessLogs} 
              icon={<ReloadOutlined />} 
              loading={loadingLogs}
              type="text"
            >
              다시 가져오기
            </Button>
          </div>
        } bordered={false} className="mt-4">
          {loadingLogs ? (
            <Spin tip="로그 로딩 중..." />
          ) : (
            <div ref={accessLogRef} style={{ maxHeight: '300px', overflowY: 'auto' }} className="whitespace-pre-wrap">
              {accessLogs.length > 0 ? accessLogs.map((log, index) => (
                <div key={index}>{log}</div>
              )) : (
                <Alert message="로그가 없습니다." type="info" />
              )}
            </div>
          )}
        </Card>

        <Card title={
          <div className="flex justify-between items-center">
            <span>Error Logs</span>
            <Button 
              onClick={fetchErrorLogs} 
              icon={<ReloadOutlined />} 
              loading={loadingErrorLogs}
              type="text"
            >
              다시 가져오기
            </Button>
          </div>
        } bordered={false} className="mt-4">
          {loadingErrorLogs ? (
            <Spin tip="에러 로그 로딩 중..." />
          ) : (
            <div ref={errorLogRef} style={{ maxHeight: '300px', overflowY: 'auto' }} className="whitespace-pre-wrap">
              {errorLogs.length > 0 ? errorLogs.map((log, index) => (
                <div key={index}>{log}</div>
              )) : (
                <Alert message="에러 로그가 없습니다." type="info" />
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
} 