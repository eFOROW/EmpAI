import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb/mongodb';
import User from '@/lib/mongodb/models/User'; // User 모델 임포트
import { verifyAuth } from "@/lib/firebase/auth_middleware";

// POST 요청: 동적으로 컬렉션에 데이터 삽입
export async function POST(request: Request) {
  await connectToDatabase();
  
  try {
    // 요청 본문에서 JSON 데이터 받기
    const data = await request.json();

    const newUser = new User(data);
    const savedUser = await newUser.save();
    
    return NextResponse.json(savedUser, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create document', error: JSON.stringify(error) }, { status: 500 });
  }
}


export async function GET(request: Request) {
  try {
    // 인증 검증
    const decodedToken = await verifyAuth();
    
    const { searchParams } = new URL(request.url);
    const requestedUid = searchParams.get("uid");

    // 요청한 uid와 토큰의 uid가 일치하는지 확인
    if (decodedToken.uid !== requestedUid) {
      return NextResponse.json(
        { message: "접근 권한이 없습니다" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // uid에 해당하는 사용자 데이터 조회
    const user = await User.findOne({ uid: requestedUid });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 사용자 데이터 반환
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Invalid token' || error.message === 'No token provided')) {
      return NextResponse.json(
        { message: "인증되지 않은 사용자입니다" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: "사용자 정보 조회 실패", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const decodedToken = await verifyAuth();
    const { searchParams } = new URL(request.url);
    const requestedUid = searchParams.get("uid");

    if (decodedToken.uid !== requestedUid) {
      return NextResponse.json(
        { message: "접근 권한이 없습니다" },
        { status: 403 }
      );
    }

    await connectToDatabase();
    
    const updateData = await request.json();
    const updatedUser = await User.findOneAndUpdate(
      { uid: requestedUid },
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Invalid token' || error.message === 'No token provided')) {
      return NextResponse.json(
        { message: "인증되지 않은 사용자입니다" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: "사용자 정보 수정 실패", error: (error as Error).message },
      { status: 500 }
    );
  }
}