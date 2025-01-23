import mongoose, { Schema } from "mongoose";

// `Career` 스키마 정의
const CareerSchema = new Schema(
  {
    uid: { type: String, required: true, unique: true },
    highSchool: {
      status: {
        type: String,
        required: true,
        enum: ['중퇴', '졸업'],
      },
      field: {
        type: String,
        required: true,
        enum: ['인문계', '자연계', '예체능계', '검정고시'],
      },
    },
    university: {
      status: {
        type: String,
        required: true,
        enum: ['해당없음', '재학중', '중퇴', '2,3년 수료/졸업', '4년 졸업'],
      },
      major: {
        type: String,
        default: null,
      },
    },
    graduateSchool: {
      status: {
        type: String,
        required: true,
        enum: ['해당없음', '재학중', '수료', '졸업'],
      },
      major: {
        type: String,
        default: null,
      },
    },
    certifications: [
      {
        name: {
          type: String,
        },
        description: {
          type: String,
        },
      },
    ],
  },
);

// `Career` 모델 생성
const Career = mongoose.models.Career || mongoose.model("Career", CareerSchema);

export default Career;
