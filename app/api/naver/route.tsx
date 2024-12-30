import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        // URL에서 쿼리 파라미터 가져오기
        const { searchParams } = new URL(request.url);
        const start = searchParams.get("start");
        const goal = searchParams.get("goal");

        // 필수 파라미터가 없을 경우 오류 반환
        if (!start || !goal) {
            return NextResponse.json(
                { error: "Both 'start' and 'goal' parameters are required." },
                { status: 400 }
            );
        }

        // 환경변수 체크 및 헤더 정의
        const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
        const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;

        if (!clientId || !secretKey) {
            return NextResponse.json(
                { error: "Missing API credentials in environment variables." },
                { status: 500 }
            );
        }

        // 네이버 API 호출
        const response = await fetch(
            `https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving?start=${start}&goal=${goal}&option=traoptimal`,
            {
                method: 'GET',
                headers: {
                    'X-NCP-APIGW-API-KEY-ID': clientId, // string 타입으로 보장
                    'X-NCP-APIGW-API-KEY': secretKey,   // string 타입으로 보장
                },
            }
        );

        // 응답 확인
        if (!response.ok) {
            throw new Error("Failed to fetch data from Naver API.");
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 }); // 데이터를 JSON으로 반환
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}
