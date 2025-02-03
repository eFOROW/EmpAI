// crontab으로 일 1회씩 정기적으로 저장되도록 수정할 예정

import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import connectToDatabase from "@/lib/mongodb/mongodb";
import { verifyAuth } from "@/lib/firebase/auth_middleware";

export async function GET(request: Request) {
  await connectToDatabase();
  let client;

  try {
    await verifyAuth();
    client = new MongoClient(process.env.MONGODB_URI as string);
    await client.connect();

    const db = client.db('EmpAI');
    const collection = db.collection('video_analysis');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 100);

    const analyses = await collection
      .find({
        time: {
          $gte: thirtyDaysAgo.toISOString()
        }
      })
      .toArray();

    // 모든 사용자의 유효한 Score 수집
    const allValidScores = {
      태도평가: [] as number[],
      답변평가: [] as number[]
    };

    // 모든 분석 데이터를 순회하며 Score 수집
    analyses.forEach(analysis => {
      // analysis[analysis.uid]가 존재하는지 확인
      const interviewData = analysis[analysis.uid];
      if (!interviewData) return;

      Object.values(interviewData).forEach((round: any) => {
        // round와 round.Score가 존재하는지 확인
        if (!round?.Score) return;

        // 태도평가 관련 점수들 추출
        const attitudeScores = [
          round.Score.말하기속도,
          round.Score["추임새/침묵"],
          round.Score.목소리변동성,
          round.Score.표정분석,
          round.Score.머리기울기,
          round.Score.시선분석
        ].filter(score => score !== null && score !== undefined);

        // 태도평가: 6개 항목이 모두 있을 때만 합산
        if (attitudeScores.length === 6) {
          const attitudeSum = attitudeScores.reduce((a, b) => a + b, 0);
          allValidScores.태도평가.push(attitudeSum);
        }

        // 답변평가: 값이 있을 때만 추가
        if (round.Score?.답변평가 !== null && round.Score?.답변평가 !== undefined) {
          allValidScores.답변평가.push(round.Score.답변평가);
        }
      });
    });

    // 평균 계산
    const calculateAverage = (scores: number[]) => {
      if (scores.length === 0) return 0;
      return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
    };
    
    const averages = {
      태도평가: calculateAverage(allValidScores.태도평가),
      답변평가: calculateAverage(allValidScores.답변평가),
      총점수: Math.round(calculateAverage([
        ...allValidScores.태도평가,
        ...allValidScores.답변평가
      ]) / 2 * 10) / 10
    };

    return NextResponse.json(averages, { status: 200 });
  } catch (error) {
    console.error('Error fetching global averages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch global average data' },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}