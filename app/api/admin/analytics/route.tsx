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

        const propertyId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID

        const defaultResponse = {
            rows: [],
            rowCount: 0,
            metadata: {}
        };

        const [hourlyData] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ 
                startDate: startDate,
                endDate: endDate 
            }],
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
        }).catch(error => {
            console.error('Hourly Data Error:', error);
            return [defaultResponse];
        });

        const [pageData] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate, endDate }],
            metrics: [
                { name: 'screenPageViews' },
                { name: 'activeUsers' },
                { name: 'averageSessionDuration' },
                { name: 'bounceRate' },
                { name: 'engagementRate' }
            ],
            dimensions: [{ name: 'pagePath' }],
            orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
            limit: 10
        }).catch(error => {
            console.error('Page Data Error:', error);
            return [defaultResponse];
        });

        const [countryData] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate, endDate }],
            metrics: [
                { name: 'activeUsers' },
                { name: 'sessions' },
                { name: 'averageSessionDuration' },
                { name: 'screenPageViews' }
            ],
            dimensions: [{ name: 'country' }],
            orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
            limit: 10
        }).catch(error => {
            console.error('Country Data Error:', error);
            return [defaultResponse];
        });

        const [deviceData] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate, endDate }],
            metrics: [
                { name: 'activeUsers' },
                { name: 'sessions' },
                { name: 'screenPageViews' },
                { name: 'bounceRate' }
            ],
            dimensions: [{ name: 'deviceCategory' }],
        }).catch(error => {
            console.error('Device Data Error:', error);
            return [defaultResponse];
        });

        const [engagementData] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate, endDate }],
            metrics: [
                { name: 'engagementRate' },
                { name: 'bounceRate' },
                { name: 'eventsPerSession' },
                { name: 'averageSessionDuration' },
                { name: 'totalUsers' }
            ]
        }).catch(error => {
            console.error('Engagement Data Error:', error);
            return [{ rows: [] }];
        });

        const [userTypeData] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: 'newVsReturning' }],
            metrics: [
                { name: 'totalUsers' },
                { name: 'activeUsers' },
                { name: 'averageSessionDuration' }
            ]
        }).catch(error => {
            console.error('User Type Data Error:', error);
            return [{ rows: [] }];
        });

        const [trafficSourceData] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate, endDate }],
            metrics: [
                { name: 'activeUsers' },
                { name: 'sessions' },
                { name: 'engagementRate' },
                { name: 'bounceRate' }
            ],
            dimensions: [{ name: 'sessionSource' }],
            orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
            limit: 10
        }).catch(error => {
            console.error('Traffic Source Data Error:', error);
            return [defaultResponse];
        });

        return NextResponse.json({
            hourlyData: hourlyData || defaultResponse,
            pageData: pageData || defaultResponse,
            countryData: countryData || defaultResponse,
            deviceData: deviceData || defaultResponse,
            engagementData: engagementData || { rows: [] },
            userTypeData: userTypeData || { rows: [] },
            trafficSourceData: trafficSourceData || defaultResponse
        });

    } catch (error) {
        console.error('Analytics API 상세 오류:', {
            message: (error as Error).message,
            code: (error as any).code,
            details: (error as any).details,
            stack: (error as any).stack
        });

        return NextResponse.json(
            { 
                message: '애널리틱스 데이터 가져오기 실패', 
                error: (error as Error).message,
                details: process.env.NODE_ENV === 'development' ? {
                    code: (error as any).code,
                    details: (error as any).details
                } : undefined
            },
            { status: 500 }
        );
    }
}