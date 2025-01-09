import { verifyAuth } from "@/lib/firebase/auth_middleware";
import connectToDatabase from "@/lib/mongodb/mongodb";
import SelfIntroduction from "@/lib/mongodb/models/Self-introduction";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  await connectToDatabase();

  try {
    // 인증 검증
    const decodedToken = await verifyAuth();
    const data = await request.json();

    // 요청의 uid와 토큰의 uid가 일치하는지 확인
    if (data.uid !== decodedToken.uid) {
      return NextResponse.json(
        { message: "접근 권한이 없습니다" },
        { status: 403 }
      );
    }

    const newDocument = new SelfIntroduction(data);
    const savedDocument = await newDocument.save();

    return NextResponse.json(savedDocument, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Invalid token' || error.message === 'No token provided')) {
      return NextResponse.json(
        { message: "인증되지 않은 사용자입니다" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: "Failed to create document", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  await connectToDatabase();

  try {
    // 인증 검증
    const decodedToken = await verifyAuth();
    const { _id, title, job_code, last_modified, data, uid } = await request.json();

    // uid 확인
    if (uid !== decodedToken.uid) {
      return NextResponse.json(
        { message: "접근 권한이 없습니다" },
        { status: 403 }
      );
    }

    if (!_id) {
      return NextResponse.json(
        { message: "Document ID is required" },
        { status: 400 }
      );
    }

    const updateData = {
      title,
      job_code,
      last_modified,
      data,
    };

    const updatedDocument = await SelfIntroduction.findOneAndUpdate(
      { _id: _id, uid: decodedToken.uid }, // uid도 확인
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedDocument) {
      return NextResponse.json(
        { message: "Document not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedDocument, { status: 200 });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Invalid token' || error.message === 'No token provided')) {
      return NextResponse.json(
        { message: "인증되지 않은 사용자입니다" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: "Failed to update document", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  await connectToDatabase();

  try {
    // 인증 검증
    const decodedToken = await verifyAuth();
    
    const url = new URL(request.url);
    const _id = url.searchParams.get("_id");
    const uid = url.searchParams.get("uid");

    if (!_id && !uid) {
      return NextResponse.json(
        { message: "Either _id or uid parameter is required" },
        { status: 400 }
      );
    }

    // uid로 조회할 경우 본인 것만 조회 가능
    if (uid && uid !== decodedToken.uid) {
      return NextResponse.json(
        { message: "접근 권한이 없습니다" },
        { status: 403 }
      );
    }

    let document;
    if (_id) {
      document = await SelfIntroduction.findOne({ 
        _id: new ObjectId(_id),
        uid: decodedToken.uid // 본인 것만 조회 가능
      });
    } else {
      document = await SelfIntroduction.find({ uid: decodedToken.uid });
    }

    // if (!document || (Array.isArray(document) && document.length === 0)) {
    //   return NextResponse.json(
    //     { message: "Document not found" },
    //     { status: 404 }
    //   );
    // }

    return NextResponse.json(document, { status: 200 });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Invalid token' || error.message === 'No token provided')) {
      return NextResponse.json(
        { message: "인증되지 않은 사용자입니다" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: "Failed to retrieve document", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  await connectToDatabase();

  try {
    // 인증 검증
    const decodedToken = await verifyAuth();
    const { _id, uid } = await request.json();

    if (!_id) {
      return NextResponse.json(
        { message: "Document ID is required" },
        { status: 400 }
      );
    }

    // uid 확인
    if (uid !== decodedToken.uid) {
      return NextResponse.json(
        { message: "접근 권한이 없습니다" },
        { status: 403 }
      );
    }

    const deletedDocument = await SelfIntroduction.findOneAndDelete({
      _id: _id,
      uid: decodedToken.uid // 본인 것만 삭제 가능
    });

    if (!deletedDocument) {
      return NextResponse.json(
        { message: "Document not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Document successfully deleted" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && (error.message === 'Invalid token' || error.message === 'No token provided')) {
      return NextResponse.json(
        { message: "인증되지 않은 사용자입니다" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: "Failed to delete document", error: (error as Error).message },
      { status: 500 }
    );
  }
}