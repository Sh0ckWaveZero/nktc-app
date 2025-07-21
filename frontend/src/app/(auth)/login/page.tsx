'use client';

// ** Component Import
import LoginPage from '@/views/pages/auth/LoginPage';
import BlankLayout from '@/@core/layouts/BlankLayout';

export default function Login() {
  return (
    <BlankLayout>
      <LoginPage />
    </BlankLayout>
  );
}
