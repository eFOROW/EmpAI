import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { verifyAuth } from "@/lib/firebase/auth_middleware";
import connectToDatabase from "@/lib/mongodb/mongodb";
import SelfIntroduction from "@/lib/mongodb/models/Self-introduction";
import { ObjectId } from "mongodb";

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API Key');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface IntroductionItem {
  question: string;
  answer: string;
}

function parseAIResponse(content: string) {
  try {
    const jsonResult = JSON.parse(content);
    
    return {
      relevance: jsonResult.relevance || 7,
      specificity: jsonResult.specificity || 7,
      persuasiveness: jsonResult.persuasiveness || 7,
      feedback: jsonResult.feedback
        .replace(/relevance:?\s*/gi, '')
        .replace(/specificity:?\s*/gi, '')
        .replace(/persuasiveness:?\s*/gi, '')
        .trim() || '평가 처리 중 오류가 발생했습니다.'
    };
  } catch (error) {
    console.error('GPT 응답 파싱 실패:', error);
    return {
      relevance: 7,
      specificity: 7,
      persuasiveness: 7,
      feedback: '평가 처리 중 오류가 발생했습니다.'
    };
  }
}

// 답변 길이 검증 함수 추가
function isValidAnswer(answer: string): boolean {
  const minLength = 100;
  const text = answer.replace(/\s+/g, ' ').trim();
  return text.length >= minLength;
}

export async function POST(request: Request) {
  await connectToDatabase();

  try {
    const decodedToken = await verifyAuth();
    const { _id } = await request.json();

    // 1. 자기소개서 조회 (동일)
    const document = await SelfIntroduction.findOne({
      _id: new ObjectId(_id),
      uid: decodedToken.uid
    });

    if (!document) {
      return NextResponse.json(
        { message: "Document not found" },
        { status: 404 }
      );
    }

    // 2. AI 요청 데이터 가공 (동일)
    const requestData = {
      job_code: document.job_code,
      data: document.data.map((item: IntroductionItem) => ({
        question: item.question,
        answer: item.answer
      }))
    };

    // 각 자기소개서 항목별로 개별 평가 요청
    const results = await Promise.all(requestData.data.map(async (item: IntroductionItem) => {
      // 답변 길이 검증
      if (!isValidAnswer(item.answer)) {
        return {
          relevance: 0,
          specificity: 0,
          persuasiveness: 0,
          feedback: "답변이 100자 미만입니다. 질문의 요구사항을 충분히 반영하여 구체적으로 작성해주세요.",
          using_gpt: true
        };
      }

      const prompt = `[직무 맥락: ${requestData.job_code}] 당신은 ${requestData.job_code} 직무에 대한 자기소개서만을 평가하는 자기소개 전문가입니다. 직무와 관계 없는 자기소개인지 판단하고 평가하세요 예시를 들어서 출력해주세요.

[평가 대상]
질문: ${item.question}
답변: ${item.answer}

상세 평가 기준:
[세부 평가 지표]
1. Relevance (연관성) - 직무 적합성 및 질문 이해도:
- 10점: ${requestData.job_code} 직군의 핵심 역량이 3개 이상 구체적으로 드러나고, 질문 의도를 완벽히 파악하여 추가 인사이트 제공
- 8-9점: ${requestData.job_code} 핵심 역량이 1-2개 포함되고, 질문 의도를 정확히 파악
- 5-6점: ${requestData.job_code} 관련 내용이 있으나 직무 연관성이 부족하거나 질문 의도를 부분적으로만 이해
- 3-4점: ${requestData.job_code} 관련 내용이 모호하고 다른 직무 경험 위주로 서술
- 1-2점: ${requestData.job_code}와 관계없는 내용이거나 질문 의도를 전혀 파악하지 못함

2. Specificity (구체성) - 경험과 실적의 구체화:
- 8점 ~ 10점: 3개 이상의 구체적 수치/성과와 상세한 실행 과정이 포함됨, 1-2개의 구체적 수치/성과와 실행 과정이 포함됨
- 4점 ~ 8점: 실행 과정은 있으나 구체적 수치/성과 없음
- 4점 이하: 일반적이고 추상적인 설명만 존재, 구체적 내용이 전혀 없거나 두루뭉술한 서술

3. Persuasiveness (설득력) - 논리성과 차별성:
- 8점 ~ 10점: 논리적 구성이 명확하고 차별성이 있으나, 일부 보완이 필요 / 명확한 인과관계, 독창적 관점, 강력한 동기부여가 완벽하게 제시됨
- 4점 ~ 8점: 기본적인 논리는 있으나 차별성이 부족하고 설득력이 약함
- 4점 이하: 논리적 구조 없이 단순 나열식 서술, 주장과 근거의 연결이 없음



JSON 형식으로만 평가하세요. Markdown이나 다른 형식을 포함하지 마세요:
{{
    "relevance": <점수>,
    "specificity": <점수>,
    "persuasiveness": <점수>,
    "feedback": "<점수에 대한 구체적 근거, 건설적인 피드백 , 맞춤법 오류에 대한 피드백>"
   
}}



주의사항:
- 피드백은 점수와 완전히 일관되어야 함
- 단순 비판이 아닌 구체적인 개선 방향 제시
- 전문적이고 객관적인 tone 유지
- 맞춤법 피드백은 철자, 문장 구조의 기술적 측면에만 집중
- You must answer in korean`
;

      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-3.5-turbo",
        temperature: 0.2,
        response_format: { type: "json_object" }
      });

      if (!completion.choices[0]?.message?.content) {
        throw new Error('Invalid OpenAI response format');
      }

      const content = completion.choices[0].message.content;
      console.log("Raw OpenAI response:", content); // 디버깅용 로그

      const aiResult = parseAIResponse(content);

      // 필수 필드 검증
      if (!aiResult.relevance || !aiResult.specificity || !aiResult.persuasiveness || !aiResult.feedback) {
        console.error("Missing required fields in parsed result:", aiResult);
        throw new Error('Missing required fields in AI response');
      }
      
      return {
        relevance: aiResult.relevance,
        specificity: aiResult.specificity,
        persuasiveness: aiResult.persuasiveness,
        feedback: aiResult.feedback,
        using_gpt: true
      };
    }));

    return NextResponse.json({
      results: results
    }, { status: 200 });

  } catch (error) {
    if (error instanceof Error && (error.message === 'Invalid token' || error.message === 'No token provided')) {
      return NextResponse.json(
        { message: "인증되지 않은 사용자입니다" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: "첨삭 처리 실패", error: (error as Error).message },
      { status: 500 }
    );
  }
}