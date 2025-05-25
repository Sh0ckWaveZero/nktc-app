#!/usr/bin/env node

/**
 * สคริปต์ทดสอบ Security Features ของแอปพลิเคชัน
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';

/**
 * ส่ง HTTP request และรับ response
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ 
        statusCode: res.statusCode, 
        headers: res.headers, 
        data 
      }));
    });
    
    req.on('error', reject);
    req.end();
  });
}

/**
 * ทดสอบ Security Headers
 */
async function testSecurityHeaders() {
  console.log('🔍 ทดสอบ Security Headers...');
  
  try {
    const response = await makeRequest(BASE_URL);
    const headers = response.headers;
    
    const securityHeaders = [
      'x-frame-options',
      'x-content-type-options', 
      'x-xss-protection',
      'referrer-policy',
      'permissions-policy',
      'cross-origin-opener-policy',
      'x-robots-tag'
    ];
    
    console.log('✅ Security Headers ที่พบ:');
    securityHeaders.forEach(header => {
      if (headers[header]) {
        console.log(`   ${header}: ${headers[header]}`);
      } else {
        console.log(`   ❌ ${header}: ไม่พบ`);
      }
    });
    
  } catch (error) {
    console.error('❌ ข้อผิดพลาดในการทดสอบ Security Headers:', error.message);
  }
}

/**
 * ทดสอบ Rate Limiting
 */
async function testRateLimiting() {
  console.log('\n🚦 ทดสอบ Rate Limiting...');
  
  try {
    const requests = [];
    for (let i = 0; i < 5; i++) {
      requests.push(makeRequest(BASE_URL));
    }
    
    const responses = await Promise.all(requests);
    
    console.log('✅ Rate Limiting Results:');
    responses.forEach((res, index) => {
      const remaining = res.headers['x-ratelimit-remaining'];
      const limit = res.headers['x-ratelimit-limit'];
      console.log(`   Request ${index + 1}: Status ${res.statusCode}, Remaining: ${remaining}/${limit}`);
    });
    
  } catch (error) {
    console.error('❌ ข้อผิดพลาดในการทดสอบ Rate Limiting:', error.message);
  }
}

/**
 * ทดสอบ Malicious Request Detection
 */
async function testMaliciousRequestDetection() {
  console.log('\n🛡️ ทดสอบการตรวจจับ Malicious Requests...');
  
  const maliciousRequests = [
    {
      name: 'SQL Injection',
      url: `${BASE_URL}/?id=1' OR '1'='1`,
    },
    {
      name: 'XSS Attack',
      url: `${BASE_URL}/?search=<script>alert('xss')</script>`,
    },
    {
      name: 'Path Traversal',
      url: `${BASE_URL}/../../../etc/passwd`,
    },
    {
      name: 'Command Injection',
      url: `${BASE_URL}/?cmd=ls; cat /etc/passwd`,
    }
  ];
  
  for (const req of maliciousRequests) {
    try {
      console.log(`   ทดสอบ ${req.name}...`);
      const response = await makeRequest(req.url);
      
      if (response.statusCode === 403 || response.statusCode === 400) {
        console.log(`   ✅ ${req.name}: ถูกบล็อค (Status: ${response.statusCode})`);
      } else {
        console.log(`   ⚠️ ${req.name}: ไม่ถูกบล็อค (Status: ${response.statusCode})`);
      }
      
    } catch (error) {
      if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED') {
        console.log(`   ✅ ${req.name}: ถูกบล็อคที่ระดับ connection`);
      } else {
        console.log(`   ❌ ${req.name}: ข้อผิดพลาด - ${error.message}`);
      }
    }
  }
}

/**
 * ทดสอบ CORS Configuration
 */
async function testCorsConfiguration() {
  console.log('\n🌐 ทดสอบ CORS Configuration...');
  
  try {
    const options = {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://malicious-site.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    };
    
    const response = await makeRequest(BASE_URL, options);
    
    console.log('✅ CORS Headers:');
    const corsHeaders = [
      'access-control-allow-origin',
      'access-control-allow-methods',
      'access-control-allow-headers',
      'access-control-allow-credentials'
    ];
    
    corsHeaders.forEach(header => {
      if (response.headers[header]) {
        console.log(`   ${header}: ${response.headers[header]}`);
      }
    });
    
  } catch (error) {
    console.error('❌ ข้อผิดพลาดในการทดสอบ CORS:', error.message);
  }
}

/**
 * รันการทดสอบทั้งหมด
 */
async function runAllTests() {
  console.log('🚀 เริ่มการทดสอบ Security Features...\n');
  
  await testSecurityHeaders();
  await testRateLimiting();
  await testMaliciousRequestDetection();
  await testCorsConfiguration();
  
  console.log('\n✨ การทดสอบเสร็จสิ้น!');
}

// รันการทดสอบ
runAllTests().catch(console.error);
