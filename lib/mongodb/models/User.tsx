import mongoose, { Schema, Document } from "mongoose";

// `User` 스키마 정의
const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    ageRange: {
      type: String,
      enum: ["10대", "20대", "30대", "40대", "50대", "60대 이상"]
    },
    gender: {
      type: String,
      enum: ["남성", "여성"]
    },
    accountCreatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true } // createdAt, updatedAt 자동 생성
);

// `User` 모델 생성
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;