import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL이 필요합니다" }, { status: 400 });
  }

  try {
    const response = await fetch(url);
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