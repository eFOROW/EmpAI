// app/api/video/route.ts
import { NextResponse } from 'next/server';

//https://driving-skylark-grand.ngrok-free.app
//https://safe-harmless-shark.ngrok-free.app 셧다운
const BASE_URL = 'https://driving-skylark-grand.ngrok-free.app';
//https://52e6599bccb1c6.lhr.life 바뀜


export async function POST(request: Request) {
  try {
    // JSON 본문으로 받기
    const { uid, filename } = await request.json();

    if (!uid || !filename) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 비디오 프리뷰 요청
    const previewResponse = await fetch(`${BASE_URL}/video/preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uid, filename })
    });

    if (!previewResponse.ok) {
      throw new Error('Failed to fetch preview');
    }

    const previewImageBuffer = await previewResponse.arrayBuffer();

    const previewHeaders = new Headers({
      'Content-Type': 'image/jpeg',
      'Content-Length': previewResponse.headers.get('content-length') || '0',
      'Cache-Control': 'public, max-age=3600'
    });

    return new NextResponse(previewImageBuffer, {
      status: 200,
      headers: previewHeaders,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // 파라미터로 받기
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');
    const filename = searchParams.get('filename');

    if (!uid || !filename) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 비디오 스트리밍 요청
    const videoResponse = await fetch(`${BASE_URL}/video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uid, filename })
    });

    if (!videoResponse.ok) {
      throw new Error('Failed to fetch video');
    }

    const videoBuffer = await videoResponse.arrayBuffer();

    const videoHeaders = new Headers({
      'Content-Type': 'video/webm',
      'Content-Length': videoResponse.headers.get('content-length') || '0',
      'Content-Range': videoResponse.headers.get('content-range') || '',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600'
    });

    return new NextResponse(videoBuffer, {
      status: 200,
      headers: videoHeaders,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}