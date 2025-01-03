import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

const client = new MongoClient(process.env.MONGODB_URI as string);

export async function GET(request: Request) {
    try {
        // URL에서 쿼리 파라미터 가져오기
        const { searchParams } = new URL(request.url);
        const midCodeName = searchParams.get("midCodeName");
        const experienceLevelCode = searchParams.get("experienceLevelCode");
        const educationLevelName = searchParams.get("educationLevelName");

        // 만약 null이라면 빈 문자열이나 기본값을 할당
        if (!midCodeName || !experienceLevelCode || !educationLevelName) {
            return NextResponse.json(
                { message: "All parameters are required" },
                { status: 400 }
            );
        }

        // MongoDB 연결
        await client.connect();
        const db = client.db(); // 기본 DB 사용
        const jobListCollection = db.collection('job_list'); // job_list 컬렉션 선택

        // job_list에서 조건에 맞는 모든 문서 조회
        const documents = await jobListCollection.find({
            position_job_mid_code_name: midCodeName,
            position_experience_level_code: parseInt(experienceLevelCode, 10), // 숫자로 변환
            position_required_education_level_name: educationLevelName
        }).toArray(); // toArray()로 배열 형태로 반환

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
