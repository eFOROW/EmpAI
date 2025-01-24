'use client';

import React, { useState } from 'react';
import { MessagesSquare, Send } from 'lucide-react';
import Image from 'next/image';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <>
      {isOpen ? (
        <div className="fixed bottom-8 right-8 w-96 z-50">
          <div className="bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <MessagesSquare className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">채팅 상담</h3>
              </div>
              <button onClick={toggleChat} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="h-96 overflow-y-auto p-4 space-y-4">
              <div className="flex justify-start">
                <div className="flex gap-2 items-start">
                  <Image 
                    src="/chill.jpg" 
                    alt="챗봇 프로필" 
                    width={36} 
                    height={36} 
                    className="rounded-full bg-orange-500" 
                  />
                  
                  <div className="bg-gray-100 rounded-lg p-3 text-gray-800">
                    고민있으면 chill하게 털어봐<br />
                    
                  </div>
                </div>
              </div>
            
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 text-gray-800">
                    답변 작성 중...
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="border-t p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-500 text-gray-900"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <>
        <div className="fixed bottom-[135px] right-[45px] z-50 bg-white p-3 rounded-[20px] shadow-md before:content-[''] before:absolute before:bottom-[-8px] before:right-5 before:w-4 before:h-4 before:bg-white before:rotate-45 before:-z-10 text-gray-900">
            <p className="text-sm font-semibold">힘들어?</p>
          </div>
          <button onClick={toggleChat} className="fixed bottom-8 right-8 z-50">
            <Image 
              src="/chill.jpg" 
              alt="챗봇 열기" 
              width={80} 
              height={80} 
              className="rounded-full bg-orange-500" 
            />
          </button>
        </>
      )}
    </>
  );
};

export default Chatbot;