import { api } from '../services/api';

/**
 * Comprehensive API integration test suite
 */
export const testApiIntegration = async () => {
  const results = { passed: 0, failed: 0, tests: [] };

  const test = async (name, testFn) => {
    try {
      console.log(`🧪 Testing: ${name}`);
      await testFn();
      results.passed++;
      results.tests.push({ name, status: 'PASS' });
      console.log(`✅ ${name} - PASSED`);
    } catch (error) {
      results.failed++;
      results.tests.push({ name, status: 'FAIL', error: error.message });
      console.log(`❌ ${name} - FAILED:`, error.message);
    }
  };

  console.log('🚀 Starting API Integration Tests...\n');

  await test('Categories - Get All', async () => {
    const categories = await api.categories.getAll();
    if (!Array.isArray(categories)) throw new Error('Categories should return an array');
  });

  await test('Products - Get All', async () => {
    const products = await api.products.getAll();
    if (!Array.isArray(products)) throw new Error('Products should return an array');
  });

  await test('Auth - Get Session', async () => {
    const session = await api.auth.getSession();
    if (typeof session.authenticated !== 'boolean') {
      throw new Error('Session should have authenticated boolean');
    }
  });

  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

  return results;
};

export const quickHealthCheck = async () => {
  console.log('🏥 Quick Health Check...');
  
  const checks = [
    { name: 'Categories API', test: () => api.categories.getAll() },
    { name: 'Products API', test: () => api.products.getAll() },
    { name: 'Auth Session', test: () => api.auth.getSession() }
  ];

  for (const check of checks) {
    try {
      await check.test();
      console.log(`✅ ${check.name}: Healthy`);
    } catch (error) {
      console.log(`❌ ${check.name}: ${error.message}`);
    }
  }
};