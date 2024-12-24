import connectToDatabase from "@/lib/mongodb/mongodb";
import SelfIntroduction from "@/lib/mongodb/models/Self-introduction";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await connectToDatabase();

  try {
    const data = await request.json();
    const newDocument = new SelfIntroduction(data);
    const savedDocument = await newDocument.save();

    return NextResponse.json(savedDocument, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create document", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  await connectToDatabase();

  try {
    const { id, ...data } = await request.json(); // 요청 본문에서 id와 나머지 데이터를 분리합니다.

    // 문서를 찾아서 업데이트합니다.
    const updatedDocument = await SelfIntroduction.findByIdAndUpdate(id, data, {
      new: true, // 업데이트된 문서를 반환
      runValidators: true, // 유효성 검사
    });

    // 문서가 없다면 오류 처리
    if (!updatedDocument) {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedDocument, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update document", error: (error as Error).message },
      { status: 500 }
    );
  }
}


export async function GET(request: Request) {
  await connectToDatabase();

  // URL에서 query 파라미터(uid) 추출
  const url = new URL(request.url);
  const uid = url.searchParams.get("uid");

  if (!uid) {
    return NextResponse.json(
      { message: "UID parameter is required" },
      { status: 400 }
    );
  }

  try {
    // 'uid'로 필터링하여 해당하는 문서를 찾음
    const document = await SelfIntroduction.find({ uid });

    if (!document) {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(document, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to retrieve document", error: (error as Error).message },
      { status: 500 }
    );
  }
}
