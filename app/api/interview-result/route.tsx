import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import connectToDatabase from "@/lib/mongodb/mongodb";

export async function GET(request: Request) {
  await connectToDatabase();
  let client;

  try {
    // URL에서 uid 파라미터 추출
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    // MongoDB 클라이언트 생성
    client = new MongoClient(process.env.MONGODB_URI as string);
    await client.connect();

    // 데이터베이스 및 컬렉션 선택
    const db = client.db('video_analysis');
    const collection = db.collection('video_analysis');

    // uid로 필터링하여 분석 데이터 조회
    const query = uid ? { uid: uid } : {};
    const analyses = await collection.find(query).toArray();

    return NextResponse.json(analyses, { status: 200 });
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis data' },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}