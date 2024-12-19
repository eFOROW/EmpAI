import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb/mongodb';
import mongoose from 'mongoose';

// 동적으로 컬렉션을 받아 해당 컬렉션에 데이터를 삽입하는 코드
export async function POST(request: Request, { params }: { params: { collection: string } }) {
  const { collection } = params;
  await connectToDatabase();
  
  try {
    // 요청 본문에서 JSON 데이터 받기
    const data = await request.json();

    // 동적으로 컬렉션 이름을 사용하여 모델 생성
    const model = mongoose.model(collection, new mongoose.Schema({}, { strict: false }));

    // 받은 데이터를 해당 컬렉션에 삽입
    const newDocument = new model(data);
    await newDocument.save();
    
    return NextResponse.json(newDocument, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create document', error: JSON.stringify(error) }, { status: 500 });
  }
}

// GET 요청: 컬렉션의 모든 데이터 가져오기
export async function GET(request: Request, { params }: { params: { collection: string } }) {
  const { collection } = params;
  await connectToDatabase();
  
  try {
    // 동적으로 컬렉션 이름을 사용하여 모델 생성
    const model = mongoose.model(collection, new mongoose.Schema({}, { strict: false }));

    // 해당 컬렉션의 모든 데이터 가져오기
    const documents = await model.find();
    return NextResponse.json(documents);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch documents', error: JSON.stringify(error) }, { status: 500 });
  }
}