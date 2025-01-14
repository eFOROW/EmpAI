import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb/mongodb';
import Note from '@/lib/mongodb/models/Note';
import { verifyAuth } from "@/lib/firebase/auth_middleware";

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        // 인증 검증
        const decodedToken = await verifyAuth();
        const { uid, content } = await request.json();

        // 요청의 uid와 토큰의 uid가 일치하는지 확인
        if (uid !== decodedToken.uid) {
            return NextResponse.json(
                { message: "접근 권한이 없습니다" },
                { status: 403 }
            );
        }

        await Note.findOneAndUpdate(
            { uid: decodedToken.uid },
            { content, updatedAt: new Date() },
            { upsert: true }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof Error && (error.message === 'Invalid token' || error.message === 'No token provided')) {
            return NextResponse.json(
                { message: "인증되지 않은 사용자입니다" },
                { status: 401 }
            );
        }
        return NextResponse.json(
            { message: "노트 저장 실패", error: (error as Error).message },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        await connectToDatabase();
        // 인증 검증
        const decodedToken = await verifyAuth();
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get('uid');
        
        if (!uid) {
            return NextResponse.json({ error: 'UID가 필요합니다' }, { status: 400 });
        }

        // uid 확인
        if (uid !== decodedToken.uid) {
            return NextResponse.json(
                { message: "접근 권한이 없습니다" },
                { status: 403 }
            );
        }

        const note = await Note.findOne({ uid: decodedToken.uid });
        return NextResponse.json({ content: note?.content || [] });
    } catch (error) {
        if (error instanceof Error && (error.message === 'Invalid token' || error.message === 'No token provided')) {
            return NextResponse.json(
                { message: "인증되지 않은 사용자입니다" },
                { status: 401 }
            );
        }
        return NextResponse.json(
            { message: "노트 불러오기 실패", error: (error as Error).message },
            { status: 500 }
        );
    }
} 