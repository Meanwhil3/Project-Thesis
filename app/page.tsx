// app/page.tsx

import { redirect } from 'next/navigation';

export default function RootPage() {
  // สั่งให้ Next.js ทำการ Redirect ไปยัง /login ทันที
  redirect('/login');
}