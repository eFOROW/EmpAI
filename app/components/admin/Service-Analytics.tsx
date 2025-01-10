import { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from 'recharts';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { Space } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';

// DatePicker를 클라이언트 사이드에서만 렌더링하도록 dynamic import
const DatePicker = dynamic(
    () => import('antd').then((antd) => antd.DatePicker),
    { ssr: false }
);

// DatePicker를 클라이언트 사이드에서만 렌더링하도록 dynamic import
const RangePicker = dynamic(
    () => import('antd').then((antd) => antd.DatePicker.RangePicker),
    { ssr: false }
);

// 컴포넌트 외부에 COLORS 배열 정의
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalyticsDisplay = () => {
    const [analyticsData, setAnalyticsData] = useState<any>({
        hourlyData: { rows: [] },
        pageData: { rows: [] },
        countryData: { rows: [] },
        deviceData: { rows: [] },
        userTypeData: { rows: [] },
        trafficSourceData: { rows: [] }
    });
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>(() => [
        dayjs().subtract(1, 'month'),
        dayjs()
    ]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            setLoading(true);
            try {
                const [startDate, endDate] = dateRange;
                const formatDate = (date: Dayjs) => date.format('YYYY-MM-DD');

                const response = await fetch(
                    `/api/admin/analytics?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`
                );
                
                if (!response.ok) {
                    throw new Error('API 응답이 올바르지 않습니다.');
                }
                
                const data = await response.json();
                
                if (!data || typeof data !== 'object') {
                    throw new Error('잘못된 데이터 형식입니다.');
                }

                setAnalyticsData({
                    hourlyData: data.hourlyData || { rows: [] },
                    pageData: data.pageData || { rows: [] },
                    countryData: data.countryData || { rows: [] },
                    deviceData: data.deviceData || { rows: [] },
                    userTypeData: data.userTypeData || { rows: [] },
                    trafficSourceData: data.trafficSourceData || { rows: [] }
                });
            } catch (error) {
                console.error('Analytics 데이터 가져오기 실패:', error);
                setError((error as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalyticsData();
    }, [dateRange]);

    const handleDateRangeChange = (dates: any) => {
        if (dates) {
            setDateRange([dates[0], dates[1]]);
        }
    };

    // 데이터 변환 함수들
    const processLineChartData = (hourlyData: any) => {
        if (!hourlyData?.rows) return [];
        
        return hourlyData.rows.map((row: any) => {
            const date = row.dimensionValues[0].value;
            const hour = row.dimensionValues[1].value;
            const monthDay = `${date.slice(4, 6)}-${date.slice(6, 8)}`;
            
            return {
                timestamp: `${monthDay} ${hour}:00`,
                users: parseInt(row.metricValues[0].value || 0),
                sessions: parseInt(row.metricValues[1].value || 0),
                pageViews: parseInt(row.metricValues[2].value || 0)
            };
        });
    };

    const processPageData = (pageData: any) => {
        if (!pageData?.rows) return [];
        
        return pageData.rows.map((row: any) => ({
            page: row.dimensionValues[0].value,
            views: parseInt(row.metricValues[0].value || 0),
            users: parseInt(row.metricValues[1].value || 0)
        }));
    };

    const processCountryData = (countryData: any) => {
        if (!countryData?.rows) return [];
        
        return countryData.rows.map((row: any) => ({
            country: row.dimensionValues[0].value,
            users: parseInt(row.metricValues[0].value || 0)
        }));
    };

    const processDeviceData = (deviceData: any) => {
        if (!deviceData?.rows) return [];
        
        return deviceData.rows.map((row: any) => ({
            name: row.dimensionValues[0].value,
            value: parseInt(row.metricValues[0].value || 0)
        }));
    };

    const processUserTypeData = (userTypeData: any) => {
        if (!userTypeData?.rows) return [];
        
        // 데이터를 신규와 재방문으로만 분류하여 합산
        const result = userTypeData.rows.reduce((acc: any, row: any) => {
            const type = row.dimensionValues[0].value.toLowerCase();
            // 'new'가 아닌 모든 케이스를 'return'으로 처리
            const category = type === 'new' ? 'new' : 'return';
            const value = parseInt(row.metricValues[0].value || 0);
            
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += value;
            return acc;
        }, {});

        return [
            { name: '신규 방문자', value: result.new || 0 },
            { name: '재방문자', value: result.return || 0 }
        ];
    };

    const processTrafficSourceData = (trafficSourceData: any) => {
        if (!trafficSourceData?.rows) return [];
        
        return trafficSourceData.rows.map((row: any) => ({
            source: row.dimensionValues[0].value,
            users: parseInt(row.metricValues[0].value || 0),
            engagementRate: parseFloat(row.metricValues[2]?.value || 0) * 100
        }));
    };

    const processEngagementData = (engagementData: any) => {
        if (!engagementData?.rows?.[0]?.metricValues) {
            return {
                engagementRate: 0,
                bounceRate: 0,
                eventsPerSession: 0,
                averageSessionDuration: 0
            };
        }

        const metrics = engagementData.rows[0].metricValues;
        return {
            engagementRate: (parseFloat(metrics[0].value || 0) * 100).toFixed(1),
            bounceRate: (parseFloat(metrics[1].value || 0) * 100).toFixed(1),
            eventsPerSession: parseFloat(metrics[2].value || 0).toFixed(1),
            averageSessionDuration: (parseFloat(metrics[3].value || 0) / 60).toFixed(1)
        };
    };

    // 데이터 처리 함수들
    const safelyProcessData = (data: any, processor: (d: any) => any[]) => {
        try {
            return processor(data);
        } catch (error) {
            console.error('데이터 처리 중 오류:', error);
            return [];
        }
    };

    // 실제 렌더링 전에 모든 데이터 미리 처리
    const processedData = {
        lineChartData: safelyProcessData(analyticsData.hourlyData, processLineChartData),
        pageData: safelyProcessData(analyticsData.pageData, processPageData),
        countryData: safelyProcessData(analyticsData.countryData, processCountryData),
        deviceData: safelyProcessData(analyticsData.deviceData, processDeviceData),
        userTypeData: safelyProcessData(analyticsData.userTypeData, processUserTypeData),
        trafficSourceData: safelyProcessData(analyticsData.trafficSourceData, processTrafficSourceData)
    };

    const engagementMetrics = processEngagementData(analyticsData.engagementData);
    const userTypeInfo = processUserTypeData(analyticsData.userTypeData);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center">
                    <LineChartOutlined className="text-5xl text-blue-500 animate-bounce mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700">서비스 분석 데이터 로딩 중...</h2>
                </div>
            </div>
        );
    }

    if (!analyticsData) {
        return <div>데이터를 불러올 수 없습니다.</div>;
    }

    return (
        <div className="p-8 min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Service Analytics</h2>
                    <div className="flex items-center gap-4">
                        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-full">
                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-600">평균 체류시간</span>
                                    <span className="text-lg font-bold text-gray-800">
                                        {(parseFloat(analyticsData?.hourlyData?.rows?.[0]?.metricValues?.[4]?.value || "0") / 60).toFixed(2)}분
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Space>
                            <RangePicker
                                value={dateRange}
                                onChange={handleDateRangeChange}
                                disabledDate={(current) => current && current > dayjs().endOf('day')}
                                className="h-[50px]"
                                presets={[
                                    { label: '오늘', value: [dayjs(), dayjs()] },
                                    { label: '어제', value: [dayjs().subtract(1, 'day'), dayjs().subtract(1, 'day')] },
                                    { label: '지난 7일', value: [dayjs().subtract(7, 'day'), dayjs()] },
                                    { label: '지난 30일', value: [dayjs().subtract(30, 'day'), dayjs()] },
                                    { label: '이번 달', value: [dayjs().startOf('month'), dayjs()] },
                                    { 
                                        label: '지난 달', 
                                        value: [
                                            dayjs().subtract(1, 'month').startOf('month'),
                                            dayjs().subtract(1, 'month').endOf('month')
                                        ]
                                    }
                                ]}
                                defaultValue={[dayjs().subtract(1, 'month'), dayjs()]}
                                style={{ height: '50px' }}
                            />
                        </Space>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h3 className="text-base font-semibold text-gray-800 mb-4">디바이스 분포</h3>
                        <div className="h-[160px]">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={processedData.deviceData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={60}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        labelLine={{ strokeWidth: 1, stroke: '#666' }}
                                    >
                                        {processedData.deviceData.map((_: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h3 className="text-base font-semibold text-gray-800 mb-4">사용자 유형</h3>
                        <div className="h-[160px]">
                            <ResponsiveContainer>
                                <BarChart
                                    data={userTypeInfo}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis 
                                        type="number"
                                        tick={{ fontSize: 12, fill: '#666' }}
                                    />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        tick={{ fontSize: 12, fill: '#666' }}
                                        width={100}
                                    />
                                    <Tooltip
                                        formatter={(value: any) => [`${value}명`, '사용자 수']}
                                        labelStyle={{ color: '#666' }}
                                    />
                                    <Legend />
                                    <Bar 
                                        dataKey="value" 
                                        name="사용자 수" 
                                        fill="#8884d8"
                                        radius={[0, 4, 4, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h3 className="text-base font-semibold text-gray-800 mb-4">기간별 사용자 트래픽</h3>
                        <div className="h-[400px]">
                            <ResponsiveContainer>
                                <LineChart data={processedData.lineChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis 
                                        dataKey="timestamp" 
                                        angle={-45} 
                                        textAnchor="end" 
                                        height={70}
                                        tick={{ fontSize: 12, fill: '#666' }}
                                    />
                                    <YAxis tick={{ fontSize: 12, fill: '#666' }} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="users" name="활성 사용자" stroke="#8884d8" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="sessions" name="세션 수" stroke="#82ca9d" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="pageViews" name="페이지뷰" stroke="#ffc658" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h3 className="text-base font-semibold text-gray-800 mb-4">페이지별 방문 현황</h3>
                        <div className="h-[400px]">
                            <ResponsiveContainer>
                                <BarChart 
                                    data={processedData.pageData}
                                    layout="vertical"
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis type="number" tick={{ fontSize: 12, fill: '#666' }} />
                                    <YAxis 
                                        dataKey="page" 
                                        type="category" 
                                        width={200}
                                        tick={{ fontSize: 12, fill: '#666' }}
                                    />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="views" name="페이지뷰" fill="#8884d8" />
                                    <Bar dataKey="users" name="사용자" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h3 className="text-base font-semibold text-gray-800 mb-4">트래픽 유입 경로</h3>
                        <div className="h-[280px]">
                            <ResponsiveContainer>
                                <BarChart 
                                    data={processedData.trafficSourceData}
                                    layout="vertical"
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis type="number" tick={{ fontSize: 12, fill: '#666' }} />
                                    <YAxis 
                                        dataKey="source" 
                                        type="category" 
                                        width={120}
                                        tick={{ fontSize: 12, fill: '#666' }}
                                    />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="users" name="사용자 수" fill="#8884d8" />
                                    <Bar dataKey="engagementRate" name="참여율 (%)" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h3 className="text-base font-semibold text-gray-800 mb-4">국가별 방문자 분포</h3>
                        <div className="h-[280px]">
                            <ResponsiveContainer>
                                <BarChart 
                                    data={processedData.countryData}
                                    layout="vertical"
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis type="number" tick={{ fontSize: 12, fill: '#666' }} />
                                    <YAxis 
                                        dataKey="country" 
                                        type="category" 
                                        width={100}
                                        tick={{ fontSize: 12, fill: '#666' }}
                                    />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="users" name="사용자 수" fill="#8884d8" />
                                    <Bar dataKey="avgSessionDuration" name="평균 체류시간 (분)" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDisplay;