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
    
    const requiredFields = [
      'relevance', 'specificity', 'persuasiveness',
      'relevance평가', 'specificity평가', 'persuasiveness평가'
    ];

    for (const field of requiredFields) {
      if (!jsonResult[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // 점수 필드 검증 및 정규화 (1-100 범위)
    const scoreFields = ['relevance', 'specificity', 'persuasiveness'];
    for (const field of scoreFields) {
      const score = Number(jsonResult[field]);
      if (isNaN(score) || score < 1 || score > 100) {
        jsonResult[field] = 0; 
      }
    }

    return {
      relevance: jsonResult.relevance,
      specificity: jsonResult.specificity,
      persuasiveness: jsonResult.persuasiveness,
      relevance평가: jsonResult.relevance평가?.trim() || '평가 처리 중 오류가 발생했습니다.',
      specificity평가: jsonResult.specificity평가?.trim() || '평가 처리 중 오류가 발생했습니다.',
      persuasiveness평가: jsonResult.persuasiveness평가?.trim() || '평가 처리 중 오류가 발생했습니다.',
      using_gpt: true
    };
  } catch (error) {
    console.error('GPT 응답 파싱 실패:', error);
    return {
      relevance: 0,
      specificity: 0,
      persuasiveness: 0,
      relevance평가: '평가 처리 중 오류가 발생했습니다.',
      specificity평가: '평가 처리 중 오류가 발생했습니다.',
      persuasiveness평가: '평가 처리 중 오류가 발생했습니다.',
      using_gpt: true
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
          relevance평가 : "답변이 100자 미만입니다. 질문의 요구사항을 충분히 반영하여 구체적으로 작성해주세요.",
          specificity평가 : "답변이 100자 미만입니다. 질문의 요구사항을 충분히 반영하여 구체적으로 작성해주세요.",
          persuasiveness평가 : "답변이 100자 미만입니다. 질문의 요구사항을 충분히 반영하여 구체적으로 작성해주세요.",
          using_gpt: true
        };
      }

      const prompt = `[직무 맥락: ${requestData.job_code}] 당신은 자기소개서만을 평가하는 자기소개 전문가입니다. 직무와 관계 없는 자기소개인지 판단하고 평가하세요 예시를 들어서 출력해주세요.

[평가 대상]
질문: ${item.question}
답변: ${item.answer}

[세부 평가 지표]
1. Relevance (연관성) - 직무 적합성 및 질문 이해도:
- [평가 대상]이 ${requestData.job_code}직무와 관련이 있을 경우: 직무 적합성과 질문 이해도를 모두 평가
- [평가 대상]이 ${requestData.job_code} 직무와 관련이 없을 경우: 질문 이해도만 평가하며, 직무 적합성은 감점 요소에서 제외

점수 기준:
- 90~100점: ${requestData.job_code} 직군의 핵심 역량/경험이 명확히 드러나며, 질문 의도를 완벽히 파악하여 추가 인사이트까지 제공
- 80~90점: ${requestData.job_code} 관련성이 매우 높으며 질문의 핵심 요소를 잘 반영
- 70~80점: 직무 관련 내용이 주를 이루며, 질문 의도를 상당 부분 반영
- 60~70점: 직무 관련 내용이 많지만 일부 보완 필요
- 50~60점: 직무 연관성이 존재하나 개선이 필요
- 40~50점: 직무 관련성이 다소 낮고 질문과의 연결성이 부족
- 30~40점: 직무 관련 내용이 거의 없으며 일반적인 경험 서술
- 20~30점: 직무 연관성이 거의 없고 질문과 동떨어진 답변
- 10~20점: 직무와 무관한 내용을 중심으로 서술 (이 경우 질문 이해도만 평가)
- 1~10점: 직무와 전혀 무관한 다른 경험만을 서술하거나 질문 의도를 전혀 이해하지 못함

2. Specificity (구체성) - 경험과 실적의 구체화:
- 90~100점: 모든 주장이 구체적 수치, 사례, 경험으로 뒷받침됨
- 80~90점: 대부분의 주장이 구체적 증거로 뒷받침됨
- 70~80점: 중요한 경험이 구체적으로 서술되었으나 일부 부족한 부분이 있음
- 60~70점: 경험이 구체적으로 제시되었으나 추가 보완 필요
- 50~60점: 일부 구체적 사례가 있으나 개선 필요
- 40~50점: 경험이 대체로 추상적으로 서술됨
- 30~40점: 대부분 추상적 설명에 그침
- 20~30점: 구체적인 사례나 수치가 거의 없음
- 10~20점: 구체적 내용이 전혀 없으며 전반적으로 모호한 설명
- 1~10점: 실제 경험이 없어 보이며, 내용이 매우 부실함

3. Persuasiveness (설득력) - 논리성과 차별성:
- 90~100점: 명확한 인과관계, 독창적 관점, 강력한 동기부여가 모두 포함
- 80~90점: 논리적 구성과 차별성이 있으며 설득력이 높음
- 70~80점: 논리적인 흐름이 잘 정리되어 있으며 차별성이 어느 정도 있음
- 60~70점: 기본적인 논리를 갖추고 있으나 차별성이 부족
- 50~60점: 논리가 다소 부족하고 설득력이 약함
- 40~50점: 논리적 전개가 매끄럽지 않으며 설득력이 낮음
- 30~40점: 주장과 근거의 연결이 미약함
- 20~30점: 논리적 흐름이 부실하고 차별성이 거의 없음
- 10~20점: 설득력이 거의 없으며 논리적 연결이 부족
- 1~10점: 논리가 없거나 내용이 매우 부실함

[평가 시 필수 고려사항]
1. {job_code} 직군과 내용이 관계성이 있는지 판단
2. 각 점수대별 명확한 근거 제시
3. [참고 사례]와의 구체적인 비교 분석
4. 실천 가능한 개선 방향 제시



JSON 형식으로만 평가하세요. Markdown이나 다른 형식을 포함하지 마세요:
{{
    "relevance": <점수>,
    "specificity": <점수>,
    "persuasiveness": <점수>,
    "relevance평가": "<relevance 점수에 대한 근거, 건설적인 피드백>",
    "specificity평가": "<specificity 점수에 대한 근거, 건설적인 피드백>",
    "persuasiveness평가": "<persuasiveness 점수에 대한 근거, 건설적인 피드백>"
   
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

      const aiResult = parseAIResponse(content);

      // 필수 필드 검증
      if (!aiResult.relevance || !aiResult.specificity || !aiResult.persuasiveness || !aiResult.relevance평가 || !aiResult.specificity평가 || !aiResult.persuasiveness평가 ) {
        console.error("Missing required fields in parsed result:", aiResult);
        throw new Error('Missing required fields in AI response');
      }
      
      return {
        relevance: aiResult.relevance,
        specificity: aiResult.specificity,
        persuasiveness: aiResult.persuasiveness,
        relevance평가: aiResult.relevance평가,
        specificity평가: aiResult.specificity평가,
        persuasiveness평가: aiResult.persuasiveness평가,
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