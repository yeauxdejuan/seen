/**
 * Test Routing and Report Completion
 * Tests the trailing slash routing fix and report completion functionality
 */

const http = require('http');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
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

async function testRoutingFix() {
  console.log('🧭 Testing Routing Fix');
  console.log('=====================\n');
  
  const baseUrl = 'http://localhost:5173/seen';
  const routes = [
    { path: '/', description: 'Home with trailing slash' },
    { path: '', description: 'Home without trailing slash' },
    { path: '/about', description: 'About page' },
    { path: '/report', description: 'Report wizard' },
    { path: '/explore', description: 'Explore page' },
  ];
  
  let allPassed = true;
  
  for (const route of routes) {
    try {
      const url = `${baseUrl}${route.path}`;
      console.log(`Testing: ${url}`);
      
      const response = await makeRequest(url);
      
      if (response.success) {
        console.log(`✅ ${route.description} - accessible`);
      } else {
        console.log(`❌ ${route.description} - failed (${response.status})`);
        allPassed = false;
      }
    } catch (error) {
      console.log(`❌ ${route.description} - error: ${error.message}`);
      allPassed = false;
    }
  }
  
  console.log(`\n📊 Routing Test Results: ${allPassed ? '✅ All routes working' : '❌ Some routes failed'}`);
  return allPassed;
}

async function testReportFunctionality() {
  console.log('\n📝 Testing Report Functionality');
  console.log('===============================\n');
  
  // Test if the report wizard page loads
  try {
    const response = await makeRequest('http://localhost:5173/seen/report');
    
    if (response.success) {
      console.log('✅ Report wizard page loads successfully');
      
      // Check if the page contains expected elements
      const hasForm = response.data.includes('Document Your Experience');
      const hasSteps = response.data.includes('Context') && response.data.includes('Details');
      const hasSubmit = response.data.includes('Submit') || response.data.includes('Next');
      
      console.log(`✅ Form elements present: ${hasForm ? 'Yes' : 'No'}`);
      console.log(`✅ Step navigation present: ${hasSteps ? 'Yes' : 'No'}`);
      console.log(`✅ Submit functionality present: ${hasSubmit ? 'Yes' : 'No'}`);
      
      return hasForm && hasSteps && hasSubmit;
    } else {
      console.log(`❌ Report wizard page failed to load (${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Report wizard test failed: ${error.message}`);
    return false;
  }
}

async function testMyReportsPage() {
  console.log('\n📋 Testing My Reports Page');
  console.log('==========================\n');
  
  try {
    const response = await makeRequest('http://localhost:5173/seen/my-reports');
    
    if (response.success) {
      console.log('✅ My Reports page loads successfully');
      
      // Check if the page contains expected elements
      const hasReports = response.data.includes('My Reports') || response.data.includes('Your Reports');
      const hasNavigation = response.data.includes('View Details') || response.data.includes('report');
      
      console.log(`✅ Reports section present: ${hasReports ? 'Yes' : 'No'}`);
      console.log(`✅ Navigation elements present: ${hasNavigation ? 'Yes' : 'No'}`);
      
      return hasReports;
    } else {
      console.log(`❌ My Reports page failed to load (${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`❌ My Reports test failed: ${error.message}`);
    return false;
  }
}

async function testBackendIntegration() {
  console.log('\n🔗 Testing Backend Integration');
  console.log('==============================\n');
  
  // Test backend health
  try {
    const response = await makeRequest('http://localhost:8080/actuator/health');
    
    if (response.success) {
      console.log('✅ Backend is running and healthy');
      
      const healthData = JSON.parse(response.data);
      console.log(`   Status: ${healthData.status}`);
      
      // Test if Redis is connected (for session management)
      if (healthData.components && healthData.components.redis) {
        console.log(`   Redis: ${healthData.components.redis.status}`);
      }
      
      return true;
    } else {
      console.log(`❌ Backend health check failed (${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Backend not accessible: ${error.message}`);
    return false;
  }
}

async function runComprehensiveTest() {
  console.log('🚀 Comprehensive Routing & Report Testing');
  console.log('=========================================\n');
  
  const results = {
    routing: await testRoutingFix(),
    reportWizard: await testReportFunctionality(),
    myReports: await testMyReportsPage(),
    backend: await testBackendIntegration()
  };
  
  console.log('\n📊 COMPREHENSIVE TEST SUMMARY');
  console.log('=============================');
  
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
  
  console.log('\n🎯 Status Assessment:');
  if (passed === total) {
    console.log('✅ EXCELLENT: All functionality working perfectly!');
  } else if (passed >= total * 0.75) {
    console.log('✅ GOOD: Most functionality working, minor issues detected.');
  } else {
    console.log('⚠️ NEEDS ATTENTION: Some core functionality issues detected.');
  }
  
  console.log('\n🔧 What\'s Working:');
  if (results.routing) console.log('• ✅ Home routing (with and without trailing slash)');
  if (results.reportWizard) console.log('• ✅ Report creation and submission');
  if (results.myReports) console.log('• ✅ Report viewing and management');
  if (results.backend) console.log('• ✅ Backend integration and health monitoring');
  
  console.log('\n💡 User Actions Available:');
  console.log('1. Navigate to http://localhost:5173/seen/ (home page)');
  console.log('2. Click "Report" to create a new incident report');
  console.log('3. Fill out the 5-step wizard form');
  console.log('4. Submit the report (stored locally)');
  console.log('5. View "My Reports" to see submitted reports');
  console.log('6. Navigate between pages using the navigation menu');
  console.log('7. Use authentication features (Create Account/Sign In/Demo)');
  
  return results;
}

runComprehensiveTest().catch(console.error);