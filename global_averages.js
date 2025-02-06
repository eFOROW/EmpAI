const mongoose = require('mongoose');
require('dotenv').config({ path: '/home/EmpAI/Server/.env.local' });

const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI, { dbName: 'EmpAI' });

// MongoDB 스키마 및 모델 정의
const globalAverageSchema = new mongoose.Schema({
  태도평가: Number,
  답변평가: Number,
  총점수: Number,
  timestamp: { type: Date, default: Date.now },
  date: {
    year: Number,
    month: Number,
    day: Number
  },
  데이터수: Number
});

const GlobalAverage = mongoose.model('GlobalAverage', globalAverageSchema);
const VideoAnalysis = mongoose.model('VideoAnalysis', {}, 'video_analysis');
const Posts = mongoose.model('Posts', {}, 'posts'); // EmpAI DB의 posts 컬렉션

// 삭제된 게시물 제거 함수
async function removeDeletedPosts() {
  try {
    const result = await Posts.deleteMany({ isDeleted: true });
    console.log(`${result.deletedCount}개의 삭제된 게시물이 영구적으로 제거되었습니다.`);
  } catch (error) {
    console.error('삭제된 게시물 제거 중 오류 발생:', error);
    throw error;
  }
}
async function calculateGlobalAverages() {
  try {
    // 오늘 날짜 계산
    const today = new Date();
    const existingRecord = await GlobalAverage.findOne({
      'date.year': today.getFullYear(),
      'date.month': today.getMonth() + 1,
      'date.day': today.getDate()
    });

    if (existingRecord) {
      console.log('오늘 날짜의 데이터가 이미 존재합니다.');
      await removeDeletedPosts();
      return;
    }

    // 100일 전 날짜 계산
    const hundredDaysAgo = new Date();
    hundredDaysAgo.setDate(hundredDaysAgo.getDate() - 100);

    // 비디오 분석 데이터 조회
    const analyses = await VideoAnalysis.find({
      time: {
        $gte: hundredDaysAgo.toISOString()
      }
    }).lean();

    // 유효한 점수 저장 배열
    const allValidScores = {
      태도평가: [],
      답변평가: []
    };

    // 모든 분석 데이터에서 점수 추출
    analyses.forEach(analysis => {
      const interviewData = analysis[analysis.uid];
      if (!interviewData) return;

      Object.values(interviewData).forEach((round) => {
        if (!round?.Score) return;

        // 태도평가 관련 점수 추출
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

    // 평균 계산 함수
    const calculateAverage = (scores) => {
      if (scores.length === 0) return 0;
      return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
    };

    // 최종 평균 계산
    const 태도평가Average = calculateAverage(allValidScores.태도평가);
    const 답변평가Average = calculateAverage(allValidScores.답변평가);

    const globalAverage = new GlobalAverage({
      태도평가: 태도평가Average,
      답변평가: 답변평가Average,
      총점수: 태도평가Average + 답변평가Average,  // 총점수는 태도평가 + 답변평가
      timestamp: today,
      date: {
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        day: today.getDate()
      },
      데이터수: analyses.length
    });

    // 글로벌 평균 저장
    await globalAverage.save();
    console.log('글로벌 평균이 저장되었습니다:', globalAverage.toObject());
    await removeDeletedPosts();

  } catch (error) {
    console.error('글로벌 평균 계산 중 오류 발생:', error);
    throw error;
  } finally {
    // MongoDB 연결 종료
    await mongoose.connection.close();
    console.log('MongoDB 연결이 종료되었습니다.');
    process.exit(0); // 프로세스 종료
  }
}

// 프로그램 시작 시 즉시 실행
calculateGlobalAverages()
  .catch(error => {
    console.error('초기 실행 중 오류 발생:', error);
  });