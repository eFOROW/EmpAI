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
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
        dayjs().subtract(7, 'day'),
        dayjs()
    ]);

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            setLoading(true);
            try {
                const [startDate, endDate] = dateRange;
                const formatDate = (date: Dayjs) => date.format('YYYY-MM-DD');

                const response = await fetch(
                    `/api/admin/analytics?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`
                );
                const data = await response.json();
                setAnalyticsData(data);
            } catch (error) {
                console.error('Analytics 데이터 가져오기 실패:', error);
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

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center">
                    <p className="text-gray-700 font-semibold text-xl mb-4">분석정보를 불러오는 중...</p>
                    <div className="w-16 h-16 relative mb-6">
                        <div className="absolute w-full h-full border-4 border-blue-200 rounded-full animate-pulse"></div>
                        <div className="absolute w-full h-full border-t-4 border-blue-500 rounded-full animate-spin"></div>
                    </div>
                </div>
            </div>
        );
    }

    const lineChartData = analyticsData.hourlyData.rows.map((row: any) => {
        const date = row.dimensionValues[0].value; // YYYYMMDD 형식
        const hour = row.dimensionValues[1].value;
        
        // 날짜에서 월-일만 추출 (MMDD)
        const monthDay = `${date.slice(4, 6)}-${date.slice(6, 8)}`;
        
        return {
            timestamp: `${monthDay} ${hour}:00`,
            users: parseInt(row.metricValues[0].value),
            sessions: parseInt(row.metricValues[1].value),
            pageViews: parseInt(row.metricValues[2].value)
        };
    });

    const pageData = analyticsData.pageData.rows.map((row: any) => ({
        page: row.dimensionValues[0].value,
        views: parseInt(row.metricValues[0].value),
        users: parseInt(row.metricValues[1].value)
    }));

    const countryData = analyticsData.countryData.rows.map((row: any) => ({
        country: row.dimensionValues[0].value,
        users: parseInt(row.metricValues[0].value)
    }));

    return (
        <div className="p-8 min-h-screen bg-gray-50">
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Service Analytics</h2>
                <Space>
                    <RangePicker
                        value={dateRange}
                        onChange={handleDateRangeChange}
                    />
                </Space>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">시간별 트래픽</h3>
                    <div className="h-[400px]">
                        <ResponsiveContainer>
                            <LineChart data={lineChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="timestamp" angle={-45} textAnchor="end" height={70} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="users" name="활성 사용자" stroke="#8884d8" />
                                <Line type="monotone" dataKey="sessions" name="세션 수" stroke="#82ca9d" />
                                <Line type="monotone" dataKey="pageViews" name="페이지뷰" stroke="#ffc658" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">인기 페이지</h3>
                    <div className="h-[400px]">
                        <ResponsiveContainer>
                            <BarChart data={pageData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="page" angle={-45} textAnchor="end" height={70} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="views" name="페이지뷰" fill="#8884d8" />
                                <Bar dataKey="users" name="사용자" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">국가별 사용자</h3>
                    <div className="h-[400px]">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={countryData}
                                    dataKey="users"
                                    nameKey="country"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={150}
                                    label={({ country, percent }) => 
                                        `${country} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {countryData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDisplay;