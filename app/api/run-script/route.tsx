import { NextResponse } from 'next/server';
import { spawn, type ChildProcess } from 'child_process';

let runningProcess: ChildProcess | null = null;
let currentOutput = '';
let activeWriters: Set<WritableStreamDefaultWriter<Uint8Array>> = new Set();

export async function POST(): Promise<Response> {
  const encoder = new TextEncoder();
  const stream = new TransformStream<Uint8Array, Uint8Array>();
  const writer = stream.writable.getWriter();
  
  try {
    // 새로운 writer를 추가
    activeWriters.add(writer);

    // 이미 실행 중인 프로세스가 있는 경우
    if (runningProcess) {
      // 현재까지의 출력을 즉바꿈으로 분리하고 각각 전송
      currentOutput.split('\n').forEach(line => {
        if (line.trim()) {  // 빈 줄 제외
          writer.write(encoder.encode(`${line}\n`));
        }
      });
    } else {
      // 새 프로세스 시작
      const pythonProcess: ChildProcess = spawn('python', ['web.py'], {
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
      });
      
      runningProcess = pythonProcess;
      currentOutput = '';

      pythonProcess.stdout?.on('data', (data: Buffer) => {
        const text = new TextDecoder('utf-8').decode(data);
        currentOutput += text;
        // 모든 활성 writer에게 데이터 전송
        activeWriters.forEach(w => {
          w.write(encoder.encode(`${text}`));
        });
      });

      pythonProcess.on('close', (code: number | null) => {
        if (code !== 0) {
          console.error(`Process exited with code ${code}`);
        }
        runningProcess = null;
        // 모든 writer 종료
        activeWriters.forEach(w => w.close());
        activeWriters.clear();
      });

      pythonProcess.on('error', (err: Error) => {
        console.error('Failed to start process:', err);
        runningProcess = null;
        activeWriters.forEach(w => w.close());
        activeWriters.clear();
      });
    }

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Script execution error:', error);
    runningProcess = null;
    writer.close();
    activeWriters.delete(writer);
    return NextResponse.json(
      { error: 'Failed to execute script' },
      { status: 500 }
    );
  }
} 