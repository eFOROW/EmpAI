// app/api/chat/route.js
import { NextResponse, NextRequest } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 여기에 RAG를 위한 컨텍스트 데이터를 정의합니다
const CONTEXT = `
당신의 역할:
- 따뜻하고 공감적인 태도로 상담을 제공하는 상담사입니다
- 내담자의 감정을 이해하고 존중하며, 희망적인 메시지를 전달합니다
- 생명의 소중함을 강조하되, 직접적인 설교는 하지 않습니다

상담 방식:
- 내담자의 감정을 먼저 인정하고 공감합니다
- 강요하지 않고 부드럽게 대화를 이끕니다
- 작은 긍정적인 변화부터 함께 찾아갑니다
- 필요한 경우 전문상담 연결을 권유합니다

주의사항:
- 내담자의 고통을 절대 과소평가하지 않습니다
- "힘내세요", "시간이 해결해줄 거예요" 같은 피상적인 위로로 간단하게 답하지 않습니다
- 자살 위험이 감지되면 즉시 전문가 상담을 연결합니다
- 대답은 약 100자 이내로 해주세요
`;
export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    const completion = await openai.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: `당신은 친절한 자살예방 상담원입니다. 다음 컨텍스트를 바탕으로 답변해주세요: ${CONTEXT}`
        },
        { role: "user", content: message }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 1000
    });

    return NextResponse.json({
      message: completion.choices[0]?.message?.content || "죄송합니다. 응답을 생성하는데 문제가 발생했습니다."
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { message: "처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}