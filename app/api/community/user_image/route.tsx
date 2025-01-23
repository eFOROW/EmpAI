import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb/mongodb';
import User from '@/lib/mongodb/models/User'; // User 모델 임포트

export async function GET(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
      const requestedUid = searchParams.get("uid");
  
      if (!requestedUid) {
        return NextResponse.json(
          { message: "사용자 ID가 필요합니다" },
          { status: 400 }
        );
      }
  
      await connectToDatabase();
  
      const user = await User.findOne({ uid: requestedUid }, { imgUrl: 1 });
  
      if (!user) {
        return NextResponse.json({ message: "사용자를 찾을 수 없습니다" }, { status: 404 });
      }
  
      // 이미지 데이터만 반환
      return NextResponse.json({ imgUrl: user.imgUrl }, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { message: "이미지 조회 실패", error: (error as Error).message },
        { status: 500 }
      );
    }
}