import { NextResponse } from 'next/server';

export async function GET() {
    let llmStatus = 'inactive';
    let interviewStatus = 'inactive';

    // LLM 서버 상태 확인
    try {
        const llmResponse = await fetch(process.env.LLM_SERVER_URL + '/gemma3', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            },
            cache: 'no-store'
        });

        const llmData = await llmResponse.json();
        llmStatus = llmData.status === 'ok' ? 'active' : 'inactive';
    } catch (error) {
        //console.error('LLM server check failed:', error);
    }

    // AI 면접 서버 상태 확인
    try {
        const interviewResponse = await fetch(process.env.AI_SERVER_URL + '/health', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            },
            cache: 'no-store'
        });

        const interviewData = await interviewResponse.json();
        interviewStatus = interviewData.status === 'ok' ? 'active' : 'inactive';
    } catch (error) {
        //console.error('Interview server check failed:', error);
    }

    return NextResponse.json({
        servers: [
            {
                name: '자기소개서 LLM 서버',
                status: llmStatus,
                lastChecked: new Date()
            },
            {
                name: 'AI 면접 분석 서버',
                status: interviewStatus,
                lastChecked: new Date()
            }
        ]
    });
}
