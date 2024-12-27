'use client'

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams(); // searchParams를 가져옵니다.
  const [_id, set_Id] = useState<string | null>(null);

  // URL에서 _id를 가져옵니다.
  useEffect(() => {
    const _id = searchParams.get('_id'); // _id 값을 URL에서 가져옵니다.
    if (_id) {
        set_Id(_id);
    } else {
      router.push('/self-introduction');
    }
  }, [router, searchParams]);

  return (
    <div>
      <h1>FeedBack Page</h1>
      <span>{_id}</span>
    </div>
  );
}