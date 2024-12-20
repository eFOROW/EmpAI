import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb/mongodb';
import User from '@/lib/mongodb/models/User'; // User 모델 임포트

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
  const url = new URL(request.url);
  const uid = url.searchParams.get("uid"); // URL에서 uid 파라미터 추출
  
  if (!uid) {
    return NextResponse.json({ message: "UID is required" }, { status: 400 });
  }

  await connectToDatabase();

  try {
    // uid에 해당하는 사용자 데이터 조회
    const user = await User.findOne({ uid });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 사용자 데이터 반환
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch user", error: JSON.stringify(error) }, { status: 500 });
  }
}