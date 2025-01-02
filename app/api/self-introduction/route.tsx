import connectToDatabase from "@/lib/mongodb/mongodb";
import SelfIntroduction from "@/lib/mongodb/models/Self-introduction";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

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
  // 데이터베이스 연결
  await connectToDatabase();

  try {
    // 요청 본문에서 데이터 파싱
    const { _id, title, job_code, last_modified, data } = await request.json();

    // _id가 없으면 오류 반환
    if (!_id) {
      return NextResponse.json(
        { message: "Document ID is required" },
        { status: 400 }
      );
    }

    // 업데이트할 필드 구성
    const updateData = {
      title,
      job_code,
      last_modified,
      data,
    };

    // 문서 업데이트
    const updatedDocument = await SelfIntroduction.findByIdAndUpdate(
      _id,
      updateData,
      {
        new: true, // 업데이트된 문서를 반환
        runValidators: true, // 유효성 검사 수행
      }
    );

    // 문서가 없을 경우 처리
    if (!updatedDocument) {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404 }
      );
    }

    // 성공적으로 업데이트된 문서 반환
    return NextResponse.json(updatedDocument, { status: 200 });
  } catch (error) {
    // 예외 처리
    return NextResponse.json(
      { message: "Failed to update document", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  await connectToDatabase();

  const url = new URL(request.url);
  const _id = url.searchParams.get("_id");
  const uid = url.searchParams.get("uid");

  if (!_id && !uid) {
    return NextResponse.json(
      { message: "Either _id or uid parameter is required" },
      { status: 400 }
    );
  }

  try {
    let document;

    if (_id) {
      document = await SelfIntroduction.findById(new ObjectId(_id));
    } else if (uid) {
      document = await SelfIntroduction.find({ uid });
    }

    if (!document || (Array.isArray(document) && document.length === 0)) {
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

export async function DELETE(request: Request) {
  await connectToDatabase();

  // 요청에서 _id 추출
  const { _id } = await request.json();

  if (!_id) {
    return NextResponse.json(
      { message: "Document ID is required" },
      { status: 400 }
    );
  }

  try {
    // 문서 삭제
    const deletedDocument = await SelfIntroduction.findByIdAndDelete(_id);

    if (!deletedDocument) {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Document successfully deleted" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete document", error: (error as Error).message },
      { status: 500 }
    );
  }
}