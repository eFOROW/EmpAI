import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// 타입 정의
interface ResumeItem {
  question: string;
  answer: string;
}

interface RequestBody {
  job_code: string;
  data: ResumeItem[];
}

// OpenAI 설정
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API Key');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const { job_code, data } = (await request.json()) as RequestBody;
    
    // 자기소개서 내용을 문자열로 변환
    const resumeContent = data
      .map((item: ResumeItem) => `질문: ${item.question}\n답변: ${item.answer}`)
      .join('\n\n');

    const prompt = `
당신은 전문 면접관입니다. 다음 자기소개서와 직무 정보를 바탕으로 실제 면접에서 물어볼 만한 구체적인 질문 4개를 생성해주세요.

자기소개서 내용:
${resumeContent}

직무: ${job_code}

다음 기준으로 질문을 생성해주세요:
1. 자기소개서에 언급된 내용을 더 깊이 파고드는 질문 3개
2. 해당 직무(${job_code})와 관련된 전문성을 평가할 수 있는 질문 1개

응답은 다음 JSON 형식으로 해주세요:
{
  "questions": [
    "질문1",
    "질문2",
    "질문3",
    "질문4"
  ]
}
`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo", // 모델 변경
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    // TypeScript가 null을 허용하지 않도록 체크
    if (!completion.choices[0].message.content) {
      throw new Error('No content in OpenAI response');
    }

    const result = JSON.parse(completion.choices[0].message.content);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error:', error);
    // 에러 발생 시 기본 질문 반환
    return NextResponse.json({
      questions: [
        "(기본)자기소개서에 언급하신 경험에서 가장 큰 도전과제는 무엇이었나요?",
        "(기본)자기소개서에서 언급하신 성과에 대해 구체적으로 설명해주세요.",
        "(기본)자기소개서에 기재된 역량을 어떻게 개발하셨나요?",
        "(기본)지원하신 직무에서 가장 중요하다고 생각하는 역량은 무엇인가요?"
      ]
    });
  }
}