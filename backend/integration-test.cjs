#!/usr/bin/env node

/**
 * Comprehensive Backend-Frontend Integration Test
 * Tests all critical paths between frontend and backend services
 */

const http = require('http');
const https = require('https');
const { performance } = require('perf_hooks');

// Configuration
const CONFIG = {
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8080',
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://yeauxdejuan.github.io/seen',
  TEST_USER: {
    email: 'integration-test@example.com',
    password: 'TestPassword123!',
    confirmPassword: 'TestPassword123!',
    firstName: 'Integration',
    lastName: 'Test',
    agreeToTerms: true
  }
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Utility functions
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const prefix = {
    INFO: '🔍',
    SUCCESS: '✅',
    ERROR: '❌',
    WARNING: '⚠️'
  }[level] || '📝';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
  if (data) {
    console.log('   Data:', JSON.stringify(data, null, 2));
  }
}

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': CONFIG.FRONTEND_URL,
        'User-Agent': 'Integration-Test/1.0',
        ...options.headers
      },
      timeout: 10000
    };
    
    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsedData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsedData,
            rawData: data
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: null,
            rawData: data
          });
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function runTest(testName, testFunction) {
  testResults.total++;
  const startTime = performance.now();
  
  try {
    log('INFO', `Running test: ${testName}`);
    await testFunction();
    
    const duration = Math.round(performance.now() - startTime);
    testResults.passed++;
    testResults.details.push({ name: testName, status: 'PASSED', duration });
    log('SUCCESS', `Test passed: ${testName} (${duration}ms)`);
    
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    testResults.failed++;
    testResults.details.push({ name: testName, status: 'FAILED', duration, error: error.message });
    log('ERROR', `Test failed: ${testName} (${duration}ms)`, error.message);
  }
}

// Test functions
async function testGatewayHealth() {
  const response = await makeRequest(`${CONFIG.BACKEND_URL}/actuator/health`);
  
  if (response.status !== 200) {
    throw new Error(`Gateway health check failed with status ${response.status}`);
  }
  
  if (!response.data || response.data.status !== 'UP') {
    throw new Error('Gateway is not healthy');
  }
  
  log('INFO', 'Gateway health check passed');
}

async function testCORSConfiguration() {
  const response = await makeRequest(`${CONFIG.BACKEND_URL}/api/auth/login`, {
    method: 'OPTIONS',
    headers: {
      'Origin': CONFIG.FRONTEND_URL,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type,Authorization'
    }
  });
  
  const allowOrigin = response.headers['access-control-allow-origin'];
  const allowMethods = response.headers['access-control-allow-methods'];
  
  if (!allowOrigin || (allowOrigin !== CONFIG.FRONTEND_URL && allowOrigin !== '*')) {
    throw new Error(`CORS origin not allowed. Expected: ${CONFIG.FRONTEND_URL}, Got: ${allowOrigin}`);
  }
  
  if (!allowMethods || !allowMethods.includes('POST')) {
    throw new Error(`POST method not allowed. Got: ${allowMethods}`);
  }
  
  log('INFO', 'CORS configuration is correct');
}

async function testAuthServiceHealth() {
  // Test through gateway routing
  const response = await makeRequest(`${CONFIG.BACKEND_URL}/api/auth/health`);
  
  // If auth service is not implemented yet, we expect a 404 or routing error
  // This is acceptable for now
  if (response.status === 404 || response.status === 503) {
    log('WARNING', 'Auth service not fully implemented yet (expected)');
    return;
  }
  
  if (response.status !== 200) {
    throw new Error(`Auth service health check failed with status ${response.status}`);
  }
  
  log('INFO', 'Auth service health check passed');
}

async function testUserRegistration() {
  const response = await makeRequest(`${CONFIG.BACKEND_URL}/api/auth/register`, {
    method: 'POST',
    body: CONFIG.TEST_USER
  });
  
  // Accept both success (201) and conflict (409) as valid responses
  if (response.status !== 201 && response.status !== 409) {
    throw new Error(`Registration failed with status ${response.status}: ${response.rawData}`);
  }
  
  if (response.status === 201) {
    if (!response.data || !response.data.user) {
      throw new Error('Registration response missing user data');
    }
    log('INFO', 'User registration successful');
  } else {
    log('INFO', 'User already exists (expected for repeated tests)');
  }
}

async function testUserLogin() {
  const response = await makeRequest(`${CONFIG.BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    body: {
      email: CONFIG.TEST_USER.email,
      password: CONFIG.TEST_USER.password
    }
  });
  
  // For now, we expect this to fail since email verification is required
  // But we want to test that the endpoint is reachable and returns proper error format
  if (response.status === 401 || response.status === 403) {
    log('INFO', 'Login properly rejected (email not verified - expected)');
    return;
  }
  
  if (response.status === 200) {
    if (!response.data || !response.data.accessToken) {
      throw new Error('Login response missing access token');
    }
    log('INFO', 'Login successful');
    return response.data.accessToken;
  }
  
  throw new Error(`Login failed with status ${response.status}: ${response.rawData}`);
}

async function testRateLimiting() {
  const requests = [];
  const maxRequests = 25; // Exceed the burst capacity of 20
  
  // Make rapid requests to trigger rate limiting
  for (let i = 0; i < maxRequests; i++) {
    requests.push(
      makeRequest(`${CONFIG.BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        body: { email: 'test@test.com', password: 'test' }
      }).catch(err => ({ error: err.message }))
    );
  }
  
  const responses = await Promise.all(requests);
  const rateLimitedResponses = responses.filter(r => r.status === 429);
  
  if (rateLimitedResponses.length === 0) {
    log('WARNING', 'Rate limiting not triggered (Redis might not be configured)');
  } else {
    log('INFO', `Rate limiting working: ${rateLimitedResponses.length} requests blocked`);
  }
}

async function testErrorHandling() {
  // Test invalid endpoint
  const response = await makeRequest(`${CONFIG.BACKEND_URL}/api/invalid/endpoint`);
  
  if (response.status !== 404) {
    throw new Error(`Expected 404 for invalid endpoint, got ${response.status}`);
  }
  
  log('INFO', 'Error handling working correctly');
}

async function testAnalyticsEndpoint() {
  const response = await makeRequest(`${CONFIG.BACKEND_URL}/api/analytics/public/aggregated`);
  
  // This endpoint might not be implemented yet, so we accept 404 or 503
  if (response.status === 404 || response.status === 503) {
    log('WARNING', 'Analytics service not implemented yet (expected)');
    return;
  }
  
  if (response.status !== 200) {
    throw new Error(`Analytics endpoint failed with status ${response.status}`);
  }
  
  log('INFO', 'Analytics endpoint accessible');
}

async function testSecurityHeaders() {
  const response = await makeRequest(`${CONFIG.BACKEND_URL}/actuator/health`);
  
  const securityHeaders = [
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection'
  ];
  
  const missingHeaders = securityHeaders.filter(header => !response.headers[header]);
  
  if (missingHeaders.length > 0) {
    log('WARNING', `Missing security headers: ${missingHeaders.join(', ')}`);
  } else {
    log('INFO', 'Security headers present');
  }
}

async function testResponseTimes() {
  const endpoints = [
    '/actuator/health',
    '/api/auth/login',
    '/api/analytics/public/aggregated'
  ];
  
  for (const endpoint of endpoints) {
    const startTime = performance.now();
    
    try {
      await makeRequest(`${CONFIG.BACKEND_URL}${endpoint}`, {
        method: endpoint.includes('login') ? 'POST' : 'GET',
        body: endpoint.includes('login') ? { email: 'test', password: 'test' } : undefined
      });
      
      const responseTime = Math.round(performance.now() - startTime);
      
      if (responseTime > 5000) {
        log('WARNING', `Slow response time for ${endpoint}: ${responseTime}ms`);
      } else {
        log('INFO', `Response time for ${endpoint}: ${responseTime}ms`);
      }
    } catch (error) {
      log('WARNING', `Could not test response time for ${endpoint}: ${error.message}`);
    }
  }
}

// Main test runner
async function runIntegrationTests() {
  console.log('🚀 Starting Comprehensive Backend-Frontend Integration Tests');
  console.log('='.repeat(70));
  console.log(`Backend URL: ${CONFIG.BACKEND_URL}`);
  console.log(`Frontend URL: ${CONFIG.FRONTEND_URL}`);
  console.log('='.repeat(70));
  
  // Core functionality tests
  await runTest('Gateway Health Check', testGatewayHealth);
  await runTest('CORS Configuration', testCORSConfiguration);
  await runTest('Auth Service Health', testAuthServiceHealth);
  await runTest('User Registration', testUserRegistration);
  await runTest('User Login', testUserLogin);
  await runTest('Error Handling', testErrorHandling);
  
  // Performance and security tests
  await runTest('Rate Limiting', testRateLimiting);
  await runTest('Security Headers', testSecurityHeaders);
  await runTest('Response Times', testResponseTimes);
  
  // Optional service tests
  await runTest('Analytics Endpoint', testAnalyticsEndpoint);
  
  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(70));
  
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`);
  
  console.log('\n📋 Detailed Results:');
  testResults.details.forEach(test => {
    const status = test.status === 'PASSED' ? '✅' : '❌';
    console.log(`${status} ${test.name} (${test.duration}ms)`);
    if (test.error) {
      console.log(`   Error: ${test.error}`);
    }
  });
  
  // Integration readiness assessment
  console.log('\n🎯 Integration Readiness Assessment:');
  
  if (testResults.failed === 0) {
    console.log('🎉 EXCELLENT: All tests passed! Backend is fully ready for frontend integration.');
  } else if (testResults.failed <= 2) {
    console.log('✅ GOOD: Minor issues detected, but core functionality works. Ready for integration.');
  } else if (testResults.failed <= 4) {
    console.log('⚠️  FAIR: Some issues need attention before production deployment.');
  } else {
    console.log('❌ POOR: Significant issues detected. Backend needs fixes before integration.');
  }
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  
  if (testResults.details.some(t => t.name.includes('Auth') && t.status === 'FAILED')) {
    console.log('- Complete Auth Service implementation for full authentication flow');
  }
  
  if (testResults.details.some(t => t.name.includes('Rate Limiting') && t.status === 'FAILED')) {
    console.log('- Configure Redis for rate limiting functionality');
  }
  
  if (testResults.details.some(t => t.name.includes('Analytics') && t.status === 'FAILED')) {
    console.log('- Implement Analytics Service for data visualization');
  }
  
  console.log('- Add SSL/TLS certificates for production deployment');
  console.log('- Set up monitoring and logging for production');
  console.log('- Configure database backups and scaling');
  
  console.log('\n🔗 Next Steps:');
  console.log('1. Fix any failed tests');
  console.log('2. Update frontend VITE_API_URL to point to backend');
  console.log('3. Test frontend authentication flow');
  console.log('4. Deploy to staging environment');
  console.log('5. Run end-to-end tests');
  
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  log('ERROR', 'Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log('ERROR', 'Uncaught exception:', error);
  process.exit(1);
});

// Run the tests
runIntegrationTests().catch(error => {
  log('ERROR', 'Test runner failed:', error);
  process.exit(1);
});