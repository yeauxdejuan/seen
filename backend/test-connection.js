#!/usr/bin/env node

/**
 * Backend Connection Test Script
 * Tests the connection between frontend and backend services
 */

const http = require('http');
const https = require('https');

const BACKEND_BASE_URL = process.env.BACKEND_URL || 'http://localhost:8080';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://yeauxdejuan.github.io/seen';

// Test endpoints
const endpoints = [
  { path: '/actuator/health', method: 'GET', description: 'Gateway Health Check' },
  { path: '/api/auth/health', method: 'GET', description: 'Auth Service Health' },
  { path: '/api/reports/health', method: 'GET', description: 'Report Service Health' },
  { path: '/api/analytics/health', method: 'GET', description: 'Analytics Service Health' }
];

// CORS test data
const corsTestData = {
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  headers: ['Content-Type', 'Authorization', 'X-Requested-With']
};

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': corsTestData.origin,
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testEndpoint(endpoint) {
  const url = `${BACKEND_BASE_URL}${endpoint.path}`;
  
  try {
    console.log(`\n🔍 Testing: ${endpoint.description}`);
    console.log(`   URL: ${url}`);
    
    const response = await makeRequest(url, { method: endpoint.method });
    
    console.log(`   ✅ Status: ${response.status}`);
    
    // Check CORS headers
    const corsHeaders = {
      'access-control-allow-origin': response.headers['access-control-allow-origin'],
      'access-control-allow-methods': response.headers['access-control-allow-methods'],
      'access-control-allow-headers': response.headers['access-control-allow-headers']
    };
    
    if (corsHeaders['access-control-allow-origin']) {
      console.log(`   ✅ CORS Origin: ${corsHeaders['access-control-allow-origin']}`);
    } else {
      console.log(`   ⚠️  CORS Origin: Not set`);
    }
    
    return { success: true, status: response.status, endpoint };
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message, endpoint };
  }
}

async function testCORS() {
  console.log(`\n🌐 Testing CORS Configuration`);
  console.log(`   Frontend Origin: ${corsTestData.origin}`);
  
  try {
    const response = await makeRequest(`${BACKEND_BASE_URL}/actuator/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': corsTestData.origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });
    
    console.log(`   ✅ OPTIONS Status: ${response.status}`);
    
    const allowOrigin = response.headers['access-control-allow-origin'];
    const allowMethods = response.headers['access-control-allow-methods'];
    const allowHeaders = response.headers['access-control-allow-headers'];
    
    if (allowOrigin === corsTestData.origin || allowOrigin === '*') {
      console.log(`   ✅ CORS Origin allowed: ${allowOrigin}`);
    } else {
      console.log(`   ❌ CORS Origin not allowed. Expected: ${corsTestData.origin}, Got: ${allowOrigin}`);
    }
    
    if (allowMethods && allowMethods.includes('POST')) {
      console.log(`   ✅ POST method allowed`);
    } else {
      console.log(`   ❌ POST method not allowed. Got: ${allowMethods}`);
    }
    
    return true;
  } catch (error) {
    console.log(`   ❌ CORS Test Failed: ${error.message}`);
    return false;
  }
}

async function testAuthFlow() {
  console.log(`\n🔐 Testing Authentication Flow`);
  
  const testUser = {
    email: 'test@example.com',
    password: 'testpassword123',
    confirmPassword: 'testpassword123',
    firstName: 'Test',
    lastName: 'User',
    agreeToTerms: true
  };
  
  try {
    // Test registration endpoint
    console.log(`   Testing registration...`);
    const registerResponse = await makeRequest(`${BACKEND_BASE_URL}/api/auth/register`, {
      method: 'POST',
      body: testUser
    });
    
    console.log(`   Registration Status: ${registerResponse.status}`);
    
    if (registerResponse.status === 201 || registerResponse.status === 409) {
      console.log(`   ✅ Registration endpoint working`);
    } else {
      console.log(`   ⚠️  Registration returned: ${registerResponse.status}`);
    }
    
    // Test login endpoint
    console.log(`   Testing login...`);
    const loginResponse = await makeRequest(`${BACKEND_BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: {
        email: testUser.email,
        password: testUser.password
      }
    });
    
    console.log(`   Login Status: ${loginResponse.status}`);
    
    return true;
  } catch (error) {
    console.log(`   ❌ Auth Flow Test Failed: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Backend Connection Tests');
  console.log(`📍 Backend URL: ${BACKEND_BASE_URL}`);
  console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
  
  const results = [];
  
  // Test individual endpoints
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
  }
  
  // Test CORS
  await testCORS();
  
  // Test Auth Flow
  await testAuthFlow();
  
  // Summary
  console.log(`\n📊 Test Summary`);
  console.log(`================`);
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);
  
  if (successful === total) {
    console.log(`\n🎉 All tests passed! Backend is ready for frontend connection.`);
  } else {
    console.log(`\n⚠️  Some tests failed. Check the backend services.`);
  }
  
  // Frontend integration notes
  console.log(`\n📝 Frontend Integration Notes:`);
  console.log(`- Update VITE_API_URL to: ${BACKEND_BASE_URL}`);
  console.log(`- Ensure CORS origin includes: ${FRONTEND_URL}`);
  console.log(`- JWT tokens will be returned in login response`);
  console.log(`- Use Authorization: Bearer <token> for authenticated requests`);
}

// Run the tests
runTests().catch(console.error);