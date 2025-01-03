// app/api/interview/route.ts
import { NextResponse } from 'next/server';

interface AnalysisResult {
  // 분석 서버 응답 타입 정의
  [key: string]: any;  // 실제 응답 구조에 맞게 수정 필요
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
      questions
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
      questionCount: questions.length,
      videoCount: videoFiles.length
    });

    // 분석 서버로 전송
    const analyzeResponse = await fetch('http://220.90.180.86:5001/analyze', {
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