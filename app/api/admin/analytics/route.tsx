import { NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || '7daysAgo';
    const endDate = searchParams.get('endDate') || 'today';

    try {
        const analyticsDataClient = new BetaAnalyticsDataClient({
            credentials: {
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
                private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }
        });

        const propertyId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?.replace('G-', '');

        const [hourlyData] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate, endDate }],
            metrics: [
                { name: 'activeUsers' },
                { name: 'sessions' },
                { name: 'screenPageViews' },
                { name: 'bounceRate' },
                { name: 'averageSessionDuration' }
            ],
            dimensions: [
                { name: 'date' },
                { name: 'hour' }
            ],
        });

        const [pageData] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate, endDate }],
            metrics: [
                { name: 'screenPageViews' },
                { name: 'activeUsers' }
            ],
            dimensions: [{ name: 'pagePath' }],
            orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
            limit: 10
        });

        const [countryData] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate, endDate }],
            metrics: [{ name: 'activeUsers' }],
            dimensions: [{ name: 'country' }],
            orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
            limit: 10
        });

        return NextResponse.json({
            hourlyData,
            pageData,
            countryData
        });
    } catch (error) {
        console.error('Analytics API 오류:', error);
        return NextResponse.json(
            { 
                message: '애널리틱스 데이터 가져오기 실패', 
                error: (error as Error).message,
                stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
            },
            { status: 500 }
        );
    }
}