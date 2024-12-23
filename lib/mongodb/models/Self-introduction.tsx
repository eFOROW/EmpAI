import mongoose, { Schema, Document } from 'mongoose';

// 이미 모델이 존재하면 기존 모델을 사용하도록 합니다.
const SelfIntroductionSchema = new Schema({
  uid: { type: String, required: true },
  title: { type: String, required: true },
  job_code: { type: String, required: true },
  last_modified: { type: Date, default: Date.now },
  data: [
    {
      question: { type: String, required: true },
      answer: { type: String, required: true },
    },
  ],
});

SelfIntroductionSchema.index({ uid: 1 });

// 이미 모델이 존재하면 해당 모델을 반환하고, 없다면 새로 정의하여 반환
const SelfIntroduction =
  mongoose.models.SelfIntroduction ||
  mongoose.model('SelfIntroduction', SelfIntroductionSchema);

export default SelfIntroduction;
