import connectToDatabase from "@/lib/mongodb/mongodb";
import Career from "@/lib/mongodb/models/Career";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  await connectToDatabase();

  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");

  if (!uid) {
    return NextResponse.json(
      { message: "사용자 UID가 필요합니다" },
      { status: 400 }
    );
  }

  try {
    const career = await Career.findOne({ uid });

    if (!career) {
      return NextResponse.json(
        { message: "해당 경력 정보를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json(career, { status: 200 });
  } catch (error) {
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
    const newCareer = new Career(data)
    const savedCareer = await newCareer.save();

    return NextResponse.json(savedCareer, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "력 정보 생성 실패", error: (error as Error).message },
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

    const { education, certifications } = await request.json();

    const updateData = {
      education,
      certifications,
      last_modified: Date.now(),
    };

    const updatedCareer = await Career.findOneAndUpdate(
      { uid },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedCareer) {
      return NextResponse.json(
        { message: "해당 경력 정보를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCareer, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "경력 정보 업데이트 실패", error: (error as Error).message },
      { status: 500 }
    );
  }
}