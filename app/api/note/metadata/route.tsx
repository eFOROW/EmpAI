import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const encodedUrl = searchParams.get("encodedUrl");

    if (!encodedUrl) {
      return NextResponse.json({ error: "URL이 필요합니다" }, { status: 400 });
    }

    const url = atob(encodedUrl);

    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json({ error: "유효하지 않은 URL입니다" }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch URL');
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const metadata = {
      url: url,
      title: $('meta[property="og:title"]').attr('content') || 
             $('title').text() || 
             url,
      description: $('meta[property="og:description"]').attr('content') || 
                  $('meta[name="description"]').attr('content') || 
                  '',
      image: $('meta[property="og:image"]').attr('content') || 
             $('meta[name="image"]').attr('content') || 
             '',
    };

    return NextResponse.json(metadata);
  } catch (error) {
    return NextResponse.json({ error: "메타데이터 가져오기 실패" }, { status: 500 });
  }
}