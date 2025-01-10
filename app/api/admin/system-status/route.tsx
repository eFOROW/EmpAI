import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb/mongodb';
import SystemStatus from '@/lib/mongodb/models/SystemStatus';

export async function GET(request: Request) {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '1d';
    const now = new Date();
    let startDate;

    switch (range) {
        case '1h':
            startDate = new Date(now.getTime() - 60 * 60 * 1000); // 1시간 전
            break;
        case '1w':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 1주일 전
            break;
        case '1d':
        default:
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1일 전
            break;
    }

    try {
        const statuses = await SystemStatus.find({ timestamp: { $gte: startDate } }).sort({ timestamp: 1 });
        return NextResponse.json(statuses, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: '데이터를 가져오는 중 오류가 발생했습니다.', error: (error as Error).message },
            { status: 500 }
        );
    }
}