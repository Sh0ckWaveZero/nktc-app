'use client';

import { redirect } from 'next/navigation';

export default function HomePage() {
  // For now, redirect to login since we need to check auth on client side
  // In a real app, you'd check auth server-side here
  redirect('/login');
}
