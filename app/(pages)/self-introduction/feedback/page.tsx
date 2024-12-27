// app/self-introduction/feedback/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FeedbackPage() {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const _id = urlParams.get('_id');

    if (_id) {
      setId(_id); // _id 값 설정
    } else {
      router.push('/self-introduction'); // _id 없으면 리다이렉트
    }
  }, [router]);

  if (id === null) {
    return null; // 로딩 중에는 아무것도 렌더링하지 않음
  }

  return (
    <div>
      <h1>FeedBack Page</h1>
      <span>{id}</span>
    </div>
  );
}
