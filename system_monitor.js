const mongoose = require('mongoose');
const si = require('systeminformation');

// MongoDB Atlas 연결 문자열
const mongoURI = 'mongodb+srv://bit_5:bit_5%40@cluster.zw98c.mongodb.net/EmpAI?retryWrites=true&w=majority&appName=Cluster';

// MongoDB 연결 설정
mongoose.connect(mongoURI);

// MongoDB 스키마 및 모델 정의
const systemStatusSchema = new mongoose.Schema({
  cpuUsage: Number,
  memoryUsage: Number,
  inboundTraffic: Number, // Mbps
  outboundTraffic: Number, // Mbps
  timestamp: { type: Date, default: Date.now },
});

const SystemStatus = mongoose.model('SystemStatus', systemStatusSchema);

// 이전 트래픽 값을 저장할 변수
let previousInboundTraffic = 0;
let previousOutboundTraffic = 0;

// 시스템 상태 체크 함수
async function checkSystemStatus() {
  try {
    const cpuData = await si.currentLoad();
    const memData = await si.mem();
    const netData = await si.networkStats();

    const cpuUsage = cpuData.currentLoad; // CPU 사용량 (%)
    const memoryUsage = (memData.total - memData.available) / memData.total * 100; // 메모리 사용 비율 (%)

    // 모든 네트워크 인터페이스의 트래픽 합산
    const inboundTraffic = netData.reduce((total, iface) => total + iface.rx_bytes, 0);
    const outboundTraffic = netData.reduce((total, iface) => total + iface.tx_bytes, 0);

    // 이전 트래픽과의 차이 계산
    const inboundTrafficDelta = inboundTraffic - previousInboundTraffic; // 바이트
    const outboundTrafficDelta = outboundTraffic - previousOutboundTraffic; // 바이트

    // Mbps로 변환 (1 byte = 8 bits, 1 minute = 60 seconds)
    const inboundTrafficMbps = (inboundTrafficDelta * 8) / 300 / 1000000; // 5분 = 300초
    const outboundTrafficMbps = (outboundTrafficDelta * 8) / 300 / 1000000; // 5분 = 300초

    // MongoDB에 상태 기록
    const systemStatus = new SystemStatus({
      cpuUsage,
      memoryUsage,
      inboundTraffic: inboundTrafficMbps >= 0 ? inboundTrafficMbps : 0, // 음수 방지
      outboundTraffic: outboundTrafficMbps >= 0 ? outboundTrafficMbps : 0, // 음수 방지
    });
    await systemStatus.save();

    // 이전 트래픽 값 업데이트
    previousInboundTraffic = inboundTraffic;
    previousOutboundTraffic = outboundTraffic;

    // MongoDB 연결 종료
    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('Error checking system status:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// setInterval 제거하고 즉시 실행
checkSystemStatus();