'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AncienneMessagesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/messages');
  }, []);

  return null;
}
