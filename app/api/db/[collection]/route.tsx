import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb/mongodb';
import mongoose from 'mongoose';
import User from '@/lib/mongodb/models/User'; // User 모델 임포트

// POST 요청: 동적으로 컬렉션에 데이터 삽입
export async function POST(request: Request, { params }: { params: { collection: string } }) {
  const { collection } = params;
  await connectToDatabase();
  
  try {
    // 요청 본문에서 JSON 데이터 받기
    const data = await request.json();

    if (collection === 'Users') {
      // 'Users' 컬렉션인 경우, User 모델을 사용하여 데이터 삽입
      const newUser = new User(data);
      const savedUser = await newUser.save();
      
      return NextResponse.json(savedUser, { status: 201 });
    } else {
      // 그 외의 컬렉션인 경우, 모델을 사용하지 않고 직접 데이터 삽입
      const db = mongoose.connection;
      const dynamicCollection = db.collection(collection);  // 동적 컬렉션 선택
      
      // 데이터 삽입
      const result = await dynamicCollection.insertOne(data);
      
      return NextResponse.json(result, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create document', error: JSON.stringify(error) }, { status: 500 });
  }
}