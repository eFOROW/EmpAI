import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import connectToDatabase from "@/lib/mongodb/mongodb";
import { verifyAuth } from "@/lib/firebase/auth_middleware";

export async function GET(request: Request) {
  await connectToDatabase();
  let client;

  try {
    // 인증 검증
    await verifyAuth();
    
    // MongoDB 클라이언트 생성
    client = new MongoClient(process.env.MONGODB_URI as string);
    await client.connect();

    const db = client.db('EmpAI');
    const globalAveragesCollection = db.collection('globalaverages');

    // 가장 최근 데이터 가져오기
    const latestAverage = await globalAveragesCollection
      .findOne({}, { 
        sort: { timestamp: -1 },
        projection: {
          태도평가: 1,
          답변평가: 1,
          총점수: 1,
          timestamp: 1,
          date: 1,
          데이터수: 1,
          _id: 0
        }
      });

    // 데이터가 없을 경우 기본값 반환
    if (!latestAverage) {
      const today = new Date();
      return NextResponse.json({
        태도평가: 0,
        답변평가: 0,
        총점수: 0,
        timestamp: today,
        date: {
          year: today.getFullYear(),
          month: today.getMonth() + 1,
          day: today.getDate()
        },
        데이터수: 0
      }, { status: 200 });
    }

    // 데이터가 있는 경우 해당 데이터 반환
    return NextResponse.json({
      태도평가: latestAverage.태도평가 || 0,
      답변평가: latestAverage.답변평가 || 0,
      총점수: latestAverage.총점수 || 0,
      timestamp: latestAverage.timestamp,
      date: latestAverage.date,
      데이터수: latestAverage.데이터수 || 0
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching global averages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch global average data' },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}