import { verifyAuth } from "@/lib/firebase/auth_middleware";
import connectToDatabase from "@/lib/mongodb/mongodb";
import SelfIntroduction from "@/lib/mongodb/models/Self-introduction";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
    try {
      // AI 서버 상태 체크
      const healthCheck = await fetch(process.env.LLM_SERVER_URL + '/gemma', {
        method: 'GET',
        headers: {
            'Cache-Control': 'no-cache'
        }
      });
  
      if (!healthCheck.ok) {
        return NextResponse.json(
          { message: "AI 서버가 응답하지 않습니다." },
          { status: 503 }
        );
      }
  
      return NextResponse.json({ status: "ok" }, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { message: "AI 서버 연결 실패" },
        { status: 500 }
      );
    }
  }
  
  export async function POST(request: Request) {
    await connectToDatabase();
  
    try {
      const decodedToken = await verifyAuth();
      const { _id } = await request.json();
  
      // 1. 자기소개서 조회
      const document = await SelfIntroduction.findOne({
        _id: new ObjectId(_id),
        uid: decodedToken.uid  // 본인 문서만 조회
      });
  
      if (!document) {
        return NextResponse.json(
          { message: "Document not found" },
          { status: 404 }
        );
      }
  
      // 2. AI 서버 요청 형식으로 데이터 가공
      const requestData = {
        job_code: document.job_code,
        data: document.data.map((item: { question: string; answer: string }) => ({
          question: item.question,
          answer: item.answer
        }))
      };
  
      // 3. AI 서버로 요청
      const aiResponse = await fetch(process.env.LLM_SERVER_URL + '/gemma', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
  
      if (!aiResponse.ok) {
        throw new Error('AI server response failed');
      }
  
      const aiResult = await aiResponse.json();
      return NextResponse.json(aiResult, { status: 200 });
  
    } catch (error) {
      if (error instanceof Error && (error.message === 'Invalid token' || error.message === 'No token provided')) {
        return NextResponse.json(
          { message: "인증되지 않은 사용자입니다" },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { message: "첨삭 처리 실패", error: (error as Error).message },
        { status: 500 }
      );
    }
  }