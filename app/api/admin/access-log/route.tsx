import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
    const logFilePath = path.join('/var/log/nginx', 'access.log');

    try {
        const data = await fs.promises.readFile(logFilePath, 'utf8');
        const logs = data.split('\n').filter(Boolean);

        const recentLogs = logs.slice(-500);

        return NextResponse.json(recentLogs, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: '로그 파일을 읽는 중 오류가 발생했습니다.', error: (error as Error).message },
            { status: 500 }
        );
    }
}