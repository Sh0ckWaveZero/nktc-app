'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App Error:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px',
      }}
    >
      <div
        style={{
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            marginBottom: '64px',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          <h1
            style={{
              marginBottom: '20px',
              fontSize: '8rem',
              fontWeight: 'bold',
              color: '#333',
              margin: '0 0 20px 0',
            }}
          >
            500
          </h1>
          <h2
            style={{
              marginBottom: '20px',
              fontSize: '1.5rem',
              color: '#555',
              margin: '0 0 20px 0',
            }}
          >
            เกิดข้อผิดพลาด! 🤯
          </h2>
          <p style={{ color: '#777', margin: '0 0 20px 0' }}>
            ขออภัย เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง
          </p>
        </div>
        <button
          onClick={reset}
          style={{
            display: 'inline-block',
            padding: '12px 44px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>
    </div>
  );
}
