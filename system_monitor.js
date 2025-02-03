const mongoose = require('mongoose');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const si = require('systeminformation');
require('dotenv').config({ path: '/home/EmpAI/Server/.env.local' });

// MongoDB Atlas 연결 문자열
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI);

// MongoDB 스키마 및 모델 정의
const systemStatusSchema = new mongoose.Schema({
  cpuUsage: Number,
  memoryUsage: Number,
  inboundTraffic: Number,
  outboundTraffic: Number,
  timestamp: { type: Date, default: Date.now },
});

const SystemStatus = mongoose.model('SystemStatus', systemStatusSchema);

async function checkSystemStatus() {
  try {
    const cpuDataArray = [];
    const memDataArray = [];
    const networkDataArray = [];
    
    // 5분(300초) 동안 CPU, 메모리, 네트워크 모두 1초마다 측정
    for (let i = 0; i < 300; i++) {
      const cpuData = await si.currentLoad();
      const memData = await si.mem();
      const networkStats = await si.networkStats();
      
      cpuDataArray.push(cpuData.currentLoad);
      memDataArray.push((memData.total - memData.available) / memData.total * 100);
      
      // 모든 네트워크 인터페이스의 rx_bytes와 tx_bytes 합계 저장
      const rxBytes = networkStats.reduce((total, stat) => total + stat.rx_bytes, 0);
      const txBytes = networkStats.reduce((total, stat) => total + stat.tx_bytes, 0);
      networkDataArray.push({ rxBytes, txBytes });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 평균 계산
    const avgCpuUsage = cpuDataArray.reduce((a, b) => a + b, 0) / cpuDataArray.length;
    const avgMemoryUsage = memDataArray.reduce((a, b) => a + b, 0) / memDataArray.length;
    
    // 1초당 평균 네트워크 전송량 계산 (Mbps)
    let totalInbound = 0;
    let totalOutbound = 0;
    
    for (let i = 1; i < networkDataArray.length; i++) {
      const rxDiff = networkDataArray[i].rxBytes - networkDataArray[i-1].rxBytes;
      const txDiff = networkDataArray[i].txBytes - networkDataArray[i-1].txBytes;
      totalInbound += rxDiff;
      totalOutbound += txDiff;
    }
    
    const inboundMbps = (totalInbound / (networkDataArray.length - 1)) * 8 / (1024 * 1024);
    const outboundMbps = (totalOutbound / (networkDataArray.length - 1)) * 8 / (1024 * 1024);

    const systemStatus = new SystemStatus({
      cpuUsage: avgCpuUsage,
      memoryUsage: avgMemoryUsage,
      inboundTraffic: inboundMbps,
      outboundTraffic: outboundMbps
    });
    
    await systemStatus.save();
    console.log('Saved system status:', {
      avgCpuUsage,
      avgMemoryUsage,
      inboundMbps,
      outboundMbps
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error checking system status:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

checkSystemStatus();