
import { NextResponse } from 'next/server';
//https://driving-skylark-grand.ngrok-free.app
//https://safe-harmless-shark.ngrok-free.app 셧다운
const BASE_URL = 'https://driving-skylark-grand.ngrok-free.app';
//https://52e6599bccb1c6.lhr.life 바뀜

interface AnalysisResult {
 [key: string]: any;
}
interface InterviewData {
  status: string;
  // 필요한 다른 속성들 추가 가능
}
export async function POST(request: Request) {
 try {
   const formData = await request.formData();
   
   // 기본 데이터 추출
   const userUid = formData.get('userUid');
   const resumeUid = formData.get('resumeUid');
   const job_code = formData.get('job_code');
   const resume_title = formData.get('resume_title');
   const timestamp = formData.get('timestamp');
   const company = formData.get('company');
  
   // 자기소개서 데이터를 JSON 문자열로 받아서 파싱
   const rawData = formData.get('data');
    
    if (!rawData) {
      return NextResponse.json(
        { message: '인터뷰 데이터가 전송되지 않았습니다.' },
        { status: 400 }
      );
    }

    let parsedData;
    try {
      parsedData = JSON.parse(rawData.toString());
      
      // 배열 형태인지 확인
      if (!Array.isArray(parsedData)) {
        return NextResponse.json(
          { message: '올바른 형식의 데이터가 아닙니다.' },
          { status: 400 }
        );
      }
      const isValidData = parsedData.every(item => 
        item.question && 
        item.answer
      );
      if (!isValidData) {
        return NextResponse.json(
          { message: '데이터 형식이 올바르지 않습니다.' },
          { status: 400 }
        );
      }

    } catch (e) {
      console.error('JSON 파싱 에러:', e);
      return NextResponse.json(
        { message: 'JSON 파싱에 실패했습니다.' },
        { status: 400 }
      );
    }
   // 질문들 추출
   const questions = [];
   for (let i = 0; i < 4; i++) {
     const question = formData.get(`questions[${i}]`);
     if (question) questions.push(question);
   }

   // 디버깅용 로그
   console.log('Received data:', {
     userUid,
     resumeUid,
     job_code,
     resume_title,
     timestamp,
     company,
     questions,
     rawData
   });

   // 데이터 검증
   if (!userUid || !resumeUid) {
     console.error('Missing required fields:', { userUid, resumeUid });
     return NextResponse.json(
       { 
         success: false, 
         data: null,
         error: '사용자 ID 또는 이력서 ID가 누락되었습니다.' 
       },
       { status: 400 }
     );
   }

   const videoFiles = Array.from(formData.entries())
     .filter(([key, value]) => key === 'videoFiles' && value instanceof File)
     .map(([_, value]) => value as File);

   if (videoFiles.length === 0) {
     console.error('No video files found');
     return NextResponse.json(
       { 
         success: false, 
         data: null,
         error: '비디오 파일이 누락되었습니다.' 
       },
       { status: 400 }
     );
   }

   // 각 파일에 대한 디버깅 로그
   videoFiles.forEach((file, index) => {
     console.log(`Video File ${index + 1}:`, {
       name: file.name,
       size: file.size,
       type: file.type
     });
   });

   // 분석 서버로 전송할 새 FormData 생성
   const analyzeFormData = new FormData();
   analyzeFormData.append('userUid', userUid as string);
   analyzeFormData.append('resumeUid', resumeUid as string);
   analyzeFormData.append('job_code', job_code as string);
   analyzeFormData.append('resume_title', resume_title as string);
   analyzeFormData.append('timestamp', timestamp as string);
   analyzeFormData.append('company', company as string);
   
  analyzeFormData.append('data', JSON.stringify(parsedData));

   questions.forEach((question, index) => {
     analyzeFormData.append(`question_${index}`, question);
   });
   
   videoFiles.forEach((file, index) => {
     analyzeFormData.append(`videoFile_${index}`, file);
   });

   // FormData 내용 로깅
  console.log('Sending to analysis server:', {
     userUid: analyzeFormData.get('userUid'),
     resumeUid: analyzeFormData.get('resumeUid'),
     company: analyzeFormData.get('company'),
     questionCount: questions.length,
     videoCount: videoFiles.length,
     dataCount: analyzeFormData.get('data')  // 자기소개서 데이터 개수 로깅 추가
   });

   // 분석 서버로 전송
   const analyzeResponse = await fetch(process.env.AI_SERVER_URL + '/analyze', {
    method: 'POST',
    body: analyzeFormData
  });

   // 응답 상태 로깅
   console.log('Analysis server status:', analyzeResponse.status);

   if (!analyzeResponse.ok) {
     const errorText = await analyzeResponse.text();
     console.error('Analysis server error:', {
       status: analyzeResponse.status,
       statusText: analyzeResponse.statusText,
       errorText
     });
     
     return NextResponse.json(
       { 
         success: false, 
         data: null,
         error: `분석 서버 오류: ${analyzeResponse.status} - ${errorText}` 
       },
       { status: analyzeResponse.status }
     );
   }

   // 응답 파싱 및 검증
   const result = await analyzeResponse.json();
   console.log('Analysis server response:', result);

   if (!result || typeof result !== 'object') {
     throw new Error('Invalid response format from analysis server');
   }

   // 성공 응답
   return NextResponse.json({
     success: true,
     data: result,
     error: null
   });

 } catch (error) {
   // 에러 로깅
   console.error('Error processing interview:', error);
   
   // 에러 응답
   return NextResponse.json(
     { 
       success: false,
       data: null,
       error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
     },
     { status: 500 }
   );
 }
}



export async function GET() {
  try {
    // 외부 분석 서버로 인터뷰 분석 요청
    const analyzeResponse = await fetch(process.env.AI_SERVER_URL + '/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // 응답 확인
    if (!analyzeResponse.ok) {
      throw new Error('Network response was not ok');
    }

    // 응답 파싱
    const data = await analyzeResponse.json();

    // 성공적인 경우 데이터 반환
    return NextResponse.json({
      status: data.status || 'ok',
      // 필요한 추가 데이터 전달 가능
    }, { status: 200 });

  } catch (error) {
    // 오류 처리
    console.error('Failed to start interview:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}