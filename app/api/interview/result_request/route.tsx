import { NextResponse } from 'next/server';
import { MongoClient, ObjectId  } from 'mongodb';
import connectToDatabase from "@/lib/mongodb/mongodb";
import { verifyAuth } from "@/lib/firebase/auth_middleware";

export async function GET(request: Request) {
  await connectToDatabase();
  let client;

  try {
    // 인증 검증
    const decodedToken = await verifyAuth();

    // URL에서 uid 파라미터 추출
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    // uid와 토큰의 uid가 일치하는지 확인
    if (decodedToken.uid !== uid) {
      return NextResponse.json(
        { message: "접근 권한이 없습니다" },
        { status: 403 }
      );
    }

    // MongoDB 클라이언트 생성
    client = new MongoClient(process.env.MONGODB_URI as string);
    await client.connect();

    // 데이터베이스 및 컬렉션 선택
    const db = client.db('EmpAI');
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

export async function DELETE(request: Request) {
  await connectToDatabase();
  let client;

  try {
    // 인증 검증
    const decodedToken = await verifyAuth();

    // 요청 본문 파싱
    const body = await request.json();
    const { analysisId, uid } = body;

    // uid와 토큰의 uid가 일치하는지 확인
    if (decodedToken.uid !== uid) {
      return NextResponse.json(
        { message: "접근 권한이 없습니다" },
        { status: 403 }
      );
    }

    // 1. 먼저 분석 서버에 삭제 요청
    try {
      const analysisServerResponse = await fetch(
        `${process.env.AI_SERVER_URL}/delete/${analysisId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!analysisServerResponse.ok) {
        const errorData = await analysisServerResponse.json();
        return NextResponse.json(
          { message: `분석 서버 삭제 실패: ${errorData.message}` },
          { status: analysisServerResponse.status }
        );
      }

      // 분석 서버에서의 삭제가 성공했을 때만 MongoDB 문서 삭제 진행
      const analysisData = await analysisServerResponse.json();
      if (!analysisData.success) {
        return NextResponse.json(
          { message: "분석 서버에서 데이터 삭제 실패" },
          { status: 500 }
        );
      }

      // 2. MongoDB 클라이언트 생성 및 문서 삭제
      client = new MongoClient(process.env.MONGODB_URI as string);
      await client.connect();

      const db = client.db('EmpAI');
      const collection = db.collection('video_analysis');

      const objectId = new ObjectId(analysisId);

      const result = await collection.deleteOne({
        _id: objectId,
        uid: uid
      });

      if (result.deletedCount === 0) {
        return NextResponse.json(
          { message: "MongoDB에서 문서를 찾을 수 없거나 권한이 없습니다" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { message: "분석 결과가 성공적으로 삭제되었습니다" },
        { status: 200 }
      );

    } catch (analysisServerError) {
      console.error('Analysis server error:', analysisServerError);
      return NextResponse.json(
        { message: "분석 서버 연결 중 오류가 발생했습니다" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in delete operation:', error);
    return NextResponse.json(
      { error: '삭제 작업 중 오류가 발생했습니다' },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}