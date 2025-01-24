"use client";

import React, { useState, useEffect } from 'react';
import Chatbot from "@/app/components/Chat_gpt/chat";

interface RiverTemp {
  TEMP: number;
  LAST_UPDATE: string;
  PH: number;
}

interface HangangData {
  선유: RiverTemp;
  안양천: RiverTemp;
  중랑천: RiverTemp;
  탄천: RiverTemp;
}

const quotes = [
  { text: "행복은 습관이다. 그것을 몸에 지니라.", author: "허버드" },
  { text: "낭비한 시간에 대한 후회는 더 큰 시간 낭비이다.", author: "메이슨 쿨리" },
  { text: "인생은 자전거를 타는 것과 같다. 균형을 잡으려면 움직여야 한다.", author: "알버트 아인슈타인" },
  { text: "당신이 할 수 있다고 믿든, 할 수 없다고 믿든, 믿는 대로 될 것이다.", author: "헨리 포드" },
  { text: "나는 내가 더 노력할수록 운이 더 좋아진다는 걸 발견했다.", author: "토마스 제퍼슨" },
  { text: "성공한 사람이 되려고 노력하기보다 가치있는 사람이 되려고 노력하라.", author: "알버트 아인슈타인" },
  { text: "남의 불행이 자신의 행복이 되지 않게 하라.", author: "헤르만 헤세" },
  { text: "모든 성취의 시작점은 갈망이다.", author: "나폴레온 힐" }
];

const HangangTemperature = () => {
  const [data, setData] = useState<HangangData | null>(null);
  const [quote, setQuote] = useState(quotes[0]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch('https://api.hangang.life/');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      if (!result.DATAs?.DATA?.HANGANG) {
        throw new Error('Invalid data structure');
      }
      setData(result.DATAs.DATA.HANGANG);
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData(null);
      setError('데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3600000);
    return () => clearInterval(interval);
  }, []);

  const locations = [
    { key: '선유' as keyof HangangData, name: '선유' },
    { key: '안양천' as keyof HangangData, name: '안양천' },
    { key: '중랑천' as keyof HangangData, name: '중랑천' },
    { key: '탄천' as keyof HangangData, name: '탄천' }
  ];

  if (error) {
    return (
      <div className="min-h-screen w-full bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen w-full bg-slate-900 text-white flex items-center justify-center">
        <div className="text-2xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/hangang1.jpg')] bg-cover bg-center opacity-50" />
      
      <div className="relative z-10 h-screen flex flex-col items-center justify-center">
        <div className="w-full max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-12">지금의 한강은?</h1>
          <div className="grid grid-cols-4 gap-8 mb-16">
            {locations.map(location => (
              <div key={location.key} className="text-center">
                <h2 className="text-3xl font-bold mb-4">{location.name}</h2>
                <p className="text-5xl font-bold tracking-tight mb-2">
                  {data[location.key].TEMP}°C
                </p>
                <p className="text-sm text-gray-300">
                  {new Date(data[location.key].LAST_UPDATE).getHours()}시 기준
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 bg-black/30 p-8 rounded-lg backdrop-blur-sm">
            <p className="text-2xl mb-3 font-medium">{quote.text}</p>
            <p className="text-lg text-gray-300">- {quote.author}</p>
          </div>
            <Chatbot />
        </div>
      </div>
    </div>
  );
};

export default HangangTemperature;