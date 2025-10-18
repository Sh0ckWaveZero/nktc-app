'use client';

import Link from 'next/link';

export default function NotFound() {
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
            404
          </h1>
          <h2
            style={{
              marginBottom: '20px',
              fontSize: '1.5rem',
              color: '#555',
              margin: '0 0 20px 0',
            }}
          >
            ไม่พบหน้าที่ต้องการ ⚠️
          </h2>
          <p style={{ color: '#777', margin: 0 }}>ขออภัย เราไม่พบหน้าที่คุณกำลังมองหา</p>
        </div>
        <Link
          href='/home'
          style={{
            display: 'inline-block',
            padding: '12px 44px',
            backgroundColor: '#1976d2',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          กลับสู่หน้าหลัก
        </Link>
      </div>
    </div>
  );
}
