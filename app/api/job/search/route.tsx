import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

const client = new MongoClient(process.env.MONGODB_URI as string);

export async function GET(request: Request) {
    try {
        // URL에서 쿼리 파라미터 가져오기
        const { searchParams } = new URL(request.url);
        const code = searchParams.get("code");
        const text = searchParams.get("text");

        // 필수 파라미터 체크
        if (!code || !text) {
            return NextResponse.json(
                { message: "Code and text parameters are required" },
                { status: 400 }
            );
        }

        // MongoDB 연결
        await client.connect();
        const db = client.db();
        const jobListCollection = db.collection('job_list');

        let query = {};
        if (code === '0') {
            // 회사명으로 검색
            query = {
                company_name: { $regex: text, $options: 'i' } // 대소문자 구분 없이 검색
            };
        } else if (code === '1') {
            // 공고명으로 검색
            query = {
                position_title: { $regex: text, $options: 'i' }
            };
        } else {
            return NextResponse.json(
                { message: "Invalid code parameter" },
                { status: 400 }
            );
        }

        // 검색 조건에 맞는 문서 조회
        const documents = await jobListCollection.find(query).toArray();

        return NextResponse.json(documents, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Failed to retrieve data", error: (error as Error).message },
            { status: 500 }
        );
    } finally {
        await client.close(); // 연결 종료
    }
}
