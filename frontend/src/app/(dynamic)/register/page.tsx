'use client';

// ** Component Import
import RegisterPage from '@/views/pages/auth/RegisterPage';
import BlankLayout from '@/@core/layouts/BlankLayout';

export default function Register() {
  return (
    <BlankLayout>
      <RegisterPage />
    </BlankLayout>
  );
}
