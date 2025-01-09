const mongoose = require('mongoose');

// 시스템 상태 스키마 정의
const systemStatusSchema = new mongoose.Schema({
  cpuUsage: {
    type: Number,
    required: true, // 필수 항목
  },
  memoryUsage: {
    type: Number,
    required: true, // 필수 항목
  },
  inboundTraffic: {
    type: Number,
    required: true, // 필수 항목
  },
  outboundTraffic: {
    type: Number,
    required: true, // 필수 항목
  },
  timestamp: {
    type: Date,
    default: Date.now, // 기본값으로 현재 시간
  },
});

// 모델 생성
const SystemStatus = mongoose.models.SystemStatus || mongoose.model('SystemStatus', systemStatusSchema);
export default SystemStatus;