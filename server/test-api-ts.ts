/**
 * TypeScript API Testing Script
 * Tests all endpoints systematically
 * Run with: npx tsx test-api-ts.ts
 */

import { successResponse } from './lib/utils/api-response';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

interface TestResult {
  name: string;
  passed: boolean;
  statusCode?: number;
  expectedStatus?: number;
  error?: string;
  response?: any;
}

const results: TestResult[] = [];
let accessToken = '';
let refreshToken = '';
let userId = '';
let projectId = '';
let categoryId = '';
let countryId = '';

// Helper function to make requests
async function testEndpoint(
  method: string,
  endpoint: string,
  data?: any,
  auth?: string,
  expectedStatus: number = 200,
  description?: string
): Promise<TestResult> {
  const url = `${BASE_URL}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth && { Authorization: `Bearer ${auth}` }),
    },
    ...(data && { body: JSON.stringify(data) }),
  };

  try {
    const response = await fetch(url, options);
    const body = await response.json().catch(() => ({ message: 'Invalid JSON' }));

    const passed = response.status === expectedStatus;
    const result: TestResult = {
      name: description || `${method} ${endpoint}`,
      passed,
      statusCode: response.status,
      expectedStatus,
      response: body,
    };

    if (!passed) {
      result.error = `Expected ${expectedStatus}, got ${response.status}`;
    }

    return result;
  } catch (error) {
    return {
      name: description || `${method} ${endpoint}`,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Test runner
async function runTests() {
  console.log('🧪 Starting API Tests...\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  // Health Check
  console.log('📊 Health Check');
  const healthResult = await testEndpoint('GET', '/health', undefined, undefined, 200, 'Health check');
  results.push(healthResult);
  console.log(healthResult.passed ? '✅' : '❌', healthResult.name);
  console.log('');

  // Metadata Endpoints
  console.log('📁 Testing Metadata Endpoints');
  
  const categoriesResult = await testEndpoint('GET', '/categories', undefined, undefined, 200, 'Get categories');
  results.push(categoriesResult);
  console.log(categoriesResult.passed ? '✅' : '❌', categoriesResult.name);
  if (categoriesResult.passed && categoriesResult.response?.data?.[0]?.id) {
    categoryId = categoriesResult.response.data[0].id;
  }

  const countriesResult = await testEndpoint('GET', '/countries', undefined, undefined, 200, 'Get countries');
  results.push(countriesResult);
  console.log(countriesResult.passed ? '✅' : '❌', countriesResult.name);
  if (countriesResult.passed && countriesResult.response?.data?.[0]?.id) {
    countryId = countriesResult.response.data[0].id;
  }

  const tagsResult = await testEndpoint('GET', '/tags', undefined, undefined, 200, 'Get tags');
  results.push(tagsResult);
  console.log(tagsResult.passed ? '✅' : '❌', tagsResult.name);
  console.log('');

  // Authentication
  console.log('🔐 Testing Authentication');
  const testEmail = `test${Date.now()}@example.com`;
  const registerData = {
    email: testEmail,
    password: 'Test123!@#',
    name: 'Test User',
  };

  const registerResult = await testEndpoint('POST', '/auth/register', registerData, undefined, 201, 'Register user');
  results.push(registerResult);
  console.log(registerResult.passed ? '✅' : '❌', registerResult.name);
  
  if (registerResult.passed && registerResult.response?.data?.accessToken) {
    accessToken = registerResult.response.data.accessToken;
    refreshToken = registerResult.response.data.refreshToken || '';
    userId = registerResult.response.data.user?.id || '';
    console.log('   Token obtained:', accessToken.substring(0, 20) + '...');
  } else {
    // Try login if register didn't work
    const loginResult = await testEndpoint('POST', '/auth/login', {
      email: testEmail,
      password: 'Test123!@#',
    }, undefined, 200, 'Login');
    
    if (loginResult.passed && loginResult.response?.data?.accessToken) {
      accessToken = loginResult.response.data.accessToken;
      userId = loginResult.response.data.user?.id || '';
      console.log('   Token obtained via login:', accessToken.substring(0, 20) + '...');
    }
  }
  console.log('');

  // User Endpoints (if authenticated)
  if (accessToken) {
    console.log('👤 Testing User Endpoints');
    const meResult = await testEndpoint('GET', '/users/me', undefined, accessToken, 200, 'Get current user');
    results.push(meResult);
    console.log(meResult.passed ? '✅' : '❌', meResult.name);
    if (meResult.passed && meResult.response?.data?.id) {
      userId = meResult.response.data.id;
    }
    console.log('');
  }

  // Project Endpoints
  console.log('🚀 Testing Project Endpoints');
  
  const listProjectsResult = await testEndpoint('GET', '/projects?page=1&limit=10', undefined, undefined, 200, 'List projects');
  results.push(listProjectsResult);
  console.log(listProjectsResult.passed ? '✅' : '❌', listProjectsResult.name);

  if (accessToken && categoryId && countryId) {
    const createProjectData = {
      name: `Test Project ${Date.now()}`,
      description: 'Test project description',
      countryId,
      categoryId,
    };

    const createResult = await testEndpoint('POST', '/projects', createProjectData, accessToken, 201, 'Create project');
    results.push(createResult);
    console.log(createResult.passed ? '✅' : '❌', createResult.name);
    
    if (createResult.passed && createResult.response?.data?.id) {
      projectId = createResult.response.data.id;
      
      const getProjectResult = await testEndpoint('GET', `/projects/${projectId}`, undefined, undefined, 200, 'Get project by ID');
      results.push(getProjectResult);
      console.log(getProjectResult.passed ? '✅' : '❌', getProjectResult.name);
    }
  }
  console.log('');

  // Search
  console.log('🔍 Testing Search');
  const searchResult = await testEndpoint('GET', '/search?q=bitcoin', undefined, undefined, 200, 'Search projects');
  results.push(searchResult);
  console.log(searchResult.passed ? '✅' : '❌', searchResult.name);
  console.log('');

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log('═══════════════════════════════════════');
  console.log('📊 Test Summary');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total: ${results.length}`);
  console.log('');

  if (failed > 0) {
    console.log('Failed tests:');
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  ❌ ${r.name}`);
        if (r.error) console.log(`     Error: ${r.error}`);
        if (r.statusCode !== r.expectedStatus) {
          console.log(`     Expected: ${r.expectedStatus}, Got: ${r.statusCode}`);
        }
      });
    console.log('');
  }

  if (failed === 0) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed');
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('Test execution failed:', error);
  process.exit(1);
});

