'use client';

import { Button, message } from 'antd';
import { useState } from 'react';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');

  const handleRunScript = async () => {
    try {
      setLoading(true);
      setOutput('');
      
      const response = await fetch('/api/run-script', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('스크립트 실행 실패');
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const data = text.replace('data: ', '');
        setOutput(prev => prev + data);
      }

      message.success('스크립트가 성공적으로 실행되었습니다');
      
    } catch (error) {
      console.error('스크립트 실행 중 오류:', error);
      message.error('스크립트 실행 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">관리자 페이지</h1>
        <Button 
          type="primary"
          loading={loading}
          onClick={handleRunScript}
          className="mb-4"
        >
          {loading ? '실행 중...' : 'Python 스크립트 실행'}
        </Button>
        <div className="bg-white p-4 rounded-lg shadow">
          <pre 
            className="whitespace-pre-wrap h-[400px] overflow-y-auto text-sm px-1"
            style={{ lineHeight: '1.5' }}
            ref={(el) => {
              if (el) {
                el.scrollTop = el.scrollHeight;
              }
            }}
          >
            {output}
          </pre>
        </div>
      </div>
    </div>
  );
}

