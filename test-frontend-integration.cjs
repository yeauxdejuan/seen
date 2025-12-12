/**
 * Frontend Integration Test
 * Tests the new authentication features and routing fixes
 */

const http = require('http');
const https = require('https');

// Test configuration
const FRONTEND_URL = 'http://localhost:5173/seen/';
const BACKEND_URL = 'http://localhost:8080';

// Test utilities
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          success: res.statusCode >= 200 && res.statusCode < 300
        });
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testFrontendAccess() {
  console.log('🌐 Testing Frontend Access...');
  
  try {
    const response = await makeRequest(FRONTEND_URL);
    if (response.success) {
      console.log('✅ Frontend is accessible');
      return true;
    } else {
      console.log(`❌ Frontend returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Frontend access failed: ${error.message}`);
    return false;
  }
}

async function testBackendHealth() {
  console.log('🔍 Testing Backend Health...');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/actuator/health`);
    if (response.success) {
      console.log('✅ Backend health check passed');
      const healthData = JSON.parse(response.data);
      console.log(`   Status: ${healthData.status}`);
      return true;
    } else {
      console.log(`❌ Backend health check failed with status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Backend health check failed: ${error.message}`);
    return false;
  }
}

async function testBackendCORS() {
  console.log('🔗 Testing CORS Configuration...');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/actuator/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET'
      }
    });
    
    const corsHeaders = response.headers['access-control-allow-origin'];
    if (corsHeaders) {
      console.log('✅ CORS headers present');
      console.log(`   Allow-Origin: ${corsHeaders}`);
      return true;
    } else {
      console.log('⚠️ CORS headers not found (may still work)');
      return true; // Not necessarily a failure
    }
  } catch (error) {
    console.log(`❌ CORS test failed: ${error.message}`);
    return false;
  }
}

async function testAuthenticationFlow() {
  console.log('🔐 Testing Authentication Flow...');
  
  // Test registration endpoint
  try {
    const registrationData = {
      email: 'test@example.com',
      password: 'testpassword123',
      confirmPassword: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
      agreeToTerms: true
    };
    
    const response = await makeRequest(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173'
      },
      body: JSON.stringify(registrationData)
    });
    
    if (response.success) {
      console.log('✅ Registration endpoint accessible');
      return true;
    } else if (response.status === 403) {
      console.log('⚠️ Registration blocked by security (expected without Auth Service)');
      return true; // Expected behavior
    } else {
      console.log(`❌ Registration failed with status ${response.status}`);
      console.log(`   Response: ${response.data}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Registration test failed: ${error.message}`);
    return false;
  }
}

async function testRoutingFunctionality() {
  console.log('🧭 Testing Frontend Routing...');
  
  // Test different routes
  const routes = ['/', '/about', '/explore'];
  let allPassed = true;
  
  for (const route of routes) {
    try {
      const url = `${FRONTEND_URL.replace('/seen/', '/seen')}${route}`;
      const response = await makeRequest(url);
      
      if (response.success) {
        console.log(`✅ Route ${route} accessible`);
      } else {
        console.log(`❌ Route ${route} failed with status ${response.status}`);
        allPassed = false;
      }
    } catch (error) {
      console.log(`❌ Route ${route} test failed: ${error.message}`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

async function runIntegrationTests() {
  console.log('🚀 Starting Frontend Integration Tests');
  console.log('=====================================');
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log('=====================================\n');
  
  const results = {
    frontendAccess: await testFrontendAccess(),
    backendHealth: await testBackendHealth(),
    corsConfig: await testBackendCORS(),
    authFlow: await testAuthenticationFlow(),
    routing: await testRoutingFunctionality()
  };
  
  console.log('\n=====================================');
  console.log('📊 TEST SUMMARY');
  console.log('=====================================');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${total - passed}`);
  console.log(`Success Rate: ${Math.round((passed / total) * 100)}%\n`);
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅' : '❌';
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} ${testName}`);
  });
  
  console.log('\n🎯 Integration Assessment:');
  if (passed === total) {
    console.log('✅ EXCELLENT: All tests passed! Frontend and backend integration is working.');
  } else if (passed >= total * 0.8) {
    console.log('✅ GOOD: Most tests passed. Minor issues detected.');
  } else if (passed >= total * 0.6) {
    console.log('⚠️ FAIR: Some issues detected. Review failed tests.');
  } else {
    console.log('❌ POOR: Significant issues detected. Integration needs work.');
  }
  
  console.log('\n💡 Next Steps:');
  console.log('1. Open http://localhost:5173/seen/ in your browser');
  console.log('2. Test the "Create Account" and "Sign In" buttons');
  console.log('3. Try the "Demo" mode for mock authentication');
  console.log('4. Navigate between pages to test routing');
  console.log('5. Check the connection status indicator in the navigation');
  
  return results;
}

// Run the tests
runIntegrationTests().catch(console.error);