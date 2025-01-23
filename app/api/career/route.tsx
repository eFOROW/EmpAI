import connectToDatabase from "@/lib/mongodb/mongodb";
import Career from "@/lib/mongodb/models/Career";
import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/firebase/auth_middleware";

export async function GET(request: Request) {
  await connectToDatabase();

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

    const career = await Career.findOne({ uid: requestedUid });

    if (!career) {
      return NextResponse.json(
        { message: "해당 경력 정보를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json(career, { status: 200 });
  } catch (error) {
    if ((error as Error).message === 'Invalid token' || (error as Error).message === 'No token provided') {
      return NextResponse.json(
        { message: "인증되지 않은 사용자입니다" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: "경력 정보 조회 실패", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  await connectToDatabase();

  try {
    const data = await request.json();
    
    // _id 제거
    delete data._id;
    
    // certifications 배열 정리
    if (data.certifications) {
      data.certifications = data.certifications.map((cert: any) => ({
        name: cert.name || '',
        description: cert.description || ''
      }));
    }

    const newCareer = new Career(data);
    const savedCareer = await newCareer.save();

    return NextResponse.json(savedCareer, { status: 201 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json(
      { message: "경력 정보 생성 실패", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  await connectToDatabase();

  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json(
        { message: "사용자 UID가 필요합니다" },
        { status: 400 }
      );
    }

    const { highSchool, university, graduateSchool, certifications } = await request.json();

    const updateData = {
      highSchool,
      university,
      graduateSchool,
      certifications,
      last_modified: Date.now(),
    };

    const updatedCareer = await Career.findOneAndUpdate(
      { uid },
      updateData,
    );

    if (!updatedCareer) {
      return NextResponse.json(
        { message: "해당 경력 정보를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCareer, { status: 200 });
  } catch (error) {
    console.error("PUT 에러:", error);
    return NextResponse.json(
      { message: "경력 정보 업데이트 실패", error: (error as Error).message },
      { status: 500 }
    );
  }
}