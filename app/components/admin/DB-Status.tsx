'use client'

import { useEffect, useState } from 'react';
import { Card, Alert, Select, Table, Tooltip as AntTooltip } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DatabaseOutlined, InfoCircleOutlined } from '@ant-design/icons';

interface DBMetrics {
  connections: number;
  bytesIn: number;
  bytesOut: number;
  numRequests: number;
  opCounters: {
    insert: number;
    query: number;
    update: number;
    delete: number;
  };
  timestamp: string;
}

interface CollectionStats {
  name: string;
  count: number;
  size: number;
  avgObjSize: number;
  storageSize: number;
  totalIndexSize: number;
  operations: {
    reads: number;
    writes: number;
  };
  fieldCount: number;
  lastModified: number | null;
}

export default function DBStatus() {
  const [metrics, setMetrics] = useState<DBMetrics[]>([]);
  const [collections, setCollections] = useState<CollectionStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('1d');

  const fetchDBMetrics = async (range: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/db-metrics?range=${range}`);
      if (!response.ok) {
        throw new Error('DB 메트릭 응답이 좋지 않습니다.');
      }
      const data = await response.json();
      
      const convertedMetrics = data.metrics.map((metric: DBMetrics, index: number, array: DBMetrics[]) => {
        const prevMetric = index > 0 ? array[index - 1] : metric;
        return {
          ...metric,
          bytesIn: Number(Math.abs(metric.bytesIn - prevMetric.bytesIn)),
          bytesOut: Number(Math.abs(metric.bytesOut - prevMetric.bytesOut)),
          numRequests: Number(Math.abs(metric.numRequests - prevMetric.numRequests))
        };
      });
      
      setMetrics(convertedMetrics);
      setCollections(data.collections);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDBMetrics(timeRange);
    const interval = setInterval(() => fetchDBMetrics(timeRange), 300000); // 5분마다 갱신
    return () => clearInterval(interval);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <DatabaseOutlined className="text-5xl text-blue-500 animate-bounce mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">데이터베이스 분석 중...</h2>
        </div>
      </div>
    );
  }
  if (error) return <Alert message={error} type="error" />;

  const columns = [
    {
      title: '컬렉션명',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span className="flex items-center">
          <DatabaseOutlined className="mr-2" />
          {text}
        </span>
      ),
    },
    {
      title: '문서 수',
      dataIndex: 'count',
      key: 'count',
      sorter: (a: CollectionStats, b: CollectionStats) => a.count - b.count,
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: '크기',
      dataIndex: 'size',
      key: 'size',
      sorter: (a: CollectionStats, b: CollectionStats) => a.size - b.size,
      render: (size: number) => `${(size / 1024 / 1024).toFixed(3)} MB`,
    },
    {
      title: '필드 수',
      dataIndex: 'fieldCount',
      key: 'fieldCount',
      sorter: (a: CollectionStats, b: CollectionStats) => a.fieldCount - b.fieldCount,
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Database Status</h1>
        
        <Select
          defaultValue="1d"
          style={{ width: 120, marginBottom: 16 }}
          onChange={setTimeRange}
        >
          <Select.Option value="1h">최근 1시간</Select.Option>
          <Select.Option value="1d">최근 1일</Select.Option>
          <Select.Option value="1w">최근 1주일</Select.Option>
        </Select>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card title="Connections" bordered={false}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="connections" 
                  stroke="#8884d8"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card 
            title={
              <div className="flex items-center gap-2">
                <span>Operation Counters</span>
                <AntTooltip title="MongoDB의 각 작업(command, query, update, delete, getmore, insert)이 처리 가능한 평균시간">
                  <InfoCircleOutlined className="text-gray-400 cursor-help" />
                </AntTooltip>
              </div>
            } 
            bordered={false}
          >
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                        dataKey="timestamp"
                        tick={{ fontSize: 12 }}
                        interval="preserveStartEnd"
                    />
                    <YAxis domain={[0, 'auto']} />
                    <Tooltip 
                        formatter={(value: number, name: string) => {
                            const secondsPerOperation = value > 0 ? (1 / value).toFixed(6) : 0;
                            return [`${secondsPerOperation} /s`, name];
                        }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="opcounters.command" 
                        name="command" 
                        stroke="#8884d8"
                        dot={false}
                        strokeWidth={2}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="opcounters.query" 
                        name="query" 
                        stroke="#82ca9d"
                        dot={false}
                        strokeWidth={2}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="opcounters.update" 
                        name="update" 
                        stroke="#ffc658"
                        dot={false}
                        strokeWidth={2}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="opcounters.delete" 
                        name="delete" 
                        stroke="#ff8042"
                        dot={false}
                        strokeWidth={2}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="opcounters.getmore" 
                        name="getmore" 
                        stroke="#ea5545"
                        dot={false}
                        strokeWidth={2}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="opcounters.insert" 
                        name="insert" 
                        stroke="#87bc45"
                        dot={false}
                        strokeWidth={2}
                    />
                </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card title="Collection Status" bordered={false}>
          <Table 
            dataSource={collections} 
            columns={columns} 
            rowKey="name"
            pagination={false}
          />
          <div className="flex justify-between font-bold mt-4 p-4 border-t border-gray-300 bg-gray-50">
            <span>총계</span>
            <span>
              문서 수: {collections.reduce((total, col) => total + col.count, 0).toLocaleString()} | 
              크기: {((collections.reduce((total, col) => total + col.size, 0)) / 1024 / 1024).toFixed(3)} MB | 
              필드 수: {collections.reduce((total, col) => total + col.fieldCount, 0)}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}