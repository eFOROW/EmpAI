import { NextResponse } from 'next/server';

//https://driving-skylark-grand.ngrok-free.app
//https://safe-harmless-shark.ngrok-free.app 셧다운
const BASE_URL = process.env.AI_SERVER_URL;
//https://52e6599bccb1c6.lhr.life 바뀜
//http://220.90.180.86:5001
export async function POST(request: Request) {
  try {
    const { uid, filename } = await request.json();
    
    if (!uid || !filename) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
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
    
    return new NextResponse(previewImageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': previewResponse.headers.get('content-length') || '0',
        'Cache-Control': 'public, max-age=3600'
      }
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
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');
    const filename = searchParams.get('filename');
    
    if (!uid || !filename) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 클라이언트의 Range 헤더 가져오기
    const range = request.headers.get('range');
    
    // 서버에 Range 헤더 포함하여 요청
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (range) {
      headers['Range'] = range;
    }

    const videoResponse = await fetch(`${BASE_URL}/video`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ uid, filename })
    });

    if (!videoResponse.ok && videoResponse.status !== 206) {
      throw new Error('Failed to fetch video');
    }

    const videoBuffer = await videoResponse.arrayBuffer();
    const responseHeaders = new Headers();

    // 응답 헤더 복사
    Array.from(videoResponse.headers.entries()).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });

    // 중요한 스트리밍 관련 헤더 설정
    responseHeaders.set('Accept-Ranges', 'bytes');
    
    if (videoResponse.status === 206) {
      responseHeaders.set('Content-Range', videoResponse.headers.get('content-range') || '');
    }

    return new NextResponse(videoBuffer, {
      status: videoResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}