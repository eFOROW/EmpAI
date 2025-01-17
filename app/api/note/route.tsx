import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb/mongodb';
import Note from '@/lib/mongodb/models/Note';
import { verifyAuth } from "@/lib/firebase/auth_middleware";

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const decodedToken = await verifyAuth();
        const { uid, noteId, title, content } = await request.json();

        if (uid !== decodedToken.uid) {
            return NextResponse.json(
                { message: "접근 권한이 없습니다" },
                { status: 403 }
            );
        }

        if (noteId) {
            // 기존 노트 업데이트
            await Note.findByIdAndUpdate(
                noteId,
                { content, title, updatedAt: new Date() }
            );
        } else {
            // 새 노트 생성
            await Note.create({
                uid: decodedToken.uid,
                title,
                content,
                updatedAt: new Date()
            });
        }

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
        const decodedToken = await verifyAuth();
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get('uid');
        const noteId = searchParams.get('noteId');
        
        if (!uid) {
            return NextResponse.json({ error: 'UID가 필요합니다' }, { status: 400 });
        }

        if (uid !== decodedToken.uid) {
            return NextResponse.json(
                { message: "접근 권한이 없습니다" },
                { status: 403 }
            );
        }

        if (noteId) {
            // 특정 노트 조회
            const note = await Note.findById(noteId);
            return NextResponse.json({ content: note?.content || [] });
        } else {
            // 사용자의 모든 노트 목록 조회 (생성일 기준)
            const notes = await Note.find(
                { uid: decodedToken.uid }, 
                'title updatedAt createdAt _id'
            ).sort({ createdAt: 1 }); // 1은 오름차순(오래된 순)
            return NextResponse.json({ notes });
        }
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

export async function DELETE(request: Request) {
    try {
        await connectToDatabase();
        const decodedToken = await verifyAuth();
        const { searchParams } = new URL(request.url);
        const noteId = searchParams.get('noteId');
        
        if (!noteId) {
            return NextResponse.json({ error: '노트 ID가 필요합니다' }, { status: 400 });
        }

        const note = await Note.findById(noteId);
        if (!note || note.uid !== decodedToken.uid) {
            return NextResponse.json(
                { message: "접근 권한이 없습니다" },
                { status: 403 }
            );
        }

        await Note.findByIdAndDelete(noteId);
        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof Error && (error.message === 'Invalid token' || error.message === 'No token provided')) {
            return NextResponse.json(
                { message: "인증되지 않은 사용자입니다" },
                { status: 401 }
            );
        }
        return NextResponse.json(
            { message: "노트 삭제 실패", error: (error as Error).message },
            { status: 500 }
        );
    }
} 