#!/usr/bin/env node
/**
 * Comprehensive test script for the deployed Merch Manager backend
 * Tests all AI-powered features and Gemini API integration
 */

const axios = require('axios');

const BACKEND_URL = 'https://merch-manager-backend-361151780407.us-central1.run.app';

class MerchManagerTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  log(emoji, message) {
    console.log(`${emoji} ${message}`);
  }

  async test(name, testFn) {
    try {
      console.log(`\n🧪 Testing: ${name}`);
      const result = await testFn();
      if (result.success) {
        this.log('✅', `PASSED: ${name}`);
        this.results.passed++;
      } else {
        this.log('❌', `FAILED: ${name} - ${result.error}`);
        this.results.failed++;
      }
      this.results.tests.push({ name, ...result });
    } catch (error) {
      this.log('❌', `FAILED: ${name} - ${error.message}`);
      this.results.failed++;
      this.results.tests.push({ name, success: false, error: error.message });
    }
  }

  async testBackendHealth() {
    const response = await axios.get(`${BACKEND_URL}/health`);
    return {
      success: response.status === 200 && response.data.status === 'healthy',
      data: response.data
    };
  }

  async testRootEndpoint() {
    const response = await axios.get(`${BACKEND_URL}/`);
    const hasAIEndpoints = response.data.endpoints.some(ep => ep.includes('ai-content'));
    return {
      success: response.status === 200 && hasAIEndpoints,
      data: response.data,
      aiEndpointsFound: hasAIEndpoints
    };
  }

  async testAIContentAPI() {
    const response = await axios.get(`${BACKEND_URL}/api/ai-content/`);
    return {
      success: response.status === 200 && response.data.success === true,
      data: response.data
    };
  }

  async testAIHealthCheck() {
    const response = await axios.get(`${BACKEND_URL}/api/ai-content/health`);
    return {
      success: response.status === 200 && response.data.ai_enabled === true,
      data: response.data,
      aiEnabled: response.data.ai_enabled
    };
  }

  async testComprehensiveProductAnalysis() {
    const testData = {
      productName: "Premium Wireless Earbuds",
      brand: "TechSound",
      country: "US"
    };

    const response = await axios.post(`${BACKEND_URL}/api/ai-content/analyze-product`, testData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 45000 // 45 second timeout for AI processing
    });

    const hasRequiredFields = response.data.success && 
                            response.data.data &&
                            response.data.data.title &&
                            response.data.data.description &&
                            response.data.data.brand;

    return {
      success: response.status === 200 && hasRequiredFields,
      data: response.data,
      hasTitle: !!response.data.data?.title,
      hasDescription: !!response.data.data?.description,
      hasSources: !!response.data.grounded_sources?.length
    };
  }

  async testFieldSpecificGeneration() {
    const testData = {
      productName: "Gaming Mechanical Keyboard",
      brand: "GameTech",
      fieldName: "title",
      fieldInstructions: "Create an SEO-optimized product title under 100 characters",
      country: "US"
    };

    const response = await axios.post(`${BACKEND_URL}/api/ai-content/generate-field`, testData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000 // 30 second timeout
    });

    const hasValidResponse = response.data.success && 
                           response.data.content && 
                           response.data.content.length > 0 &&
                           response.data.content.length <= 100;

    return {
      success: response.status === 200 && hasValidResponse,
      data: response.data,
      contentLength: response.data.content?.length || 0,
      hasSources: !!response.data.grounded_sources?.length
    };
  }

  async testErrorHandling() {
    try {
      // Test with missing required parameters
      await axios.post(`${BACKEND_URL}/api/ai-content/analyze-product`, {
        productName: "Test Product"
        // Missing brand
      });
      return { success: false, error: "Should have failed with missing parameters" };
    } catch (error) {
      // Should return 400 error for missing parameters
      return {
        success: error.response?.status === 400,
        statusCode: error.response?.status,
        errorMessage: error.response?.data?.error
      };
    }
  }

  async runAllTests() {
    console.log('🚀 Starting comprehensive Merch Manager backend tests...\n');
    console.log(`🎯 Target URL: ${BACKEND_URL}\n`);

    await this.test('Backend Health Check', () => this.testBackendHealth());
    await this.test('Root Endpoint Documentation', () => this.testRootEndpoint());
    await this.test('AI Content API Discovery', () => this.testAIContentAPI());
    await this.test('AI Health and Configuration', () => this.testAIHealthCheck());
    await this.test('Comprehensive Product Analysis', () => this.testComprehensiveProductAnalysis());
    await this.test('Field-Specific Content Generation', () => this.testFieldSpecificGeneration());
    await this.test('Error Handling', () => this.testErrorHandling());

    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📋 Total: ${this.results.passed + this.results.failed}`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.tests
        .filter(test => !test.success)
        .forEach(test => console.log(`  - ${test.name}: ${test.error}`));
    }

    const successRate = (this.results.passed / (this.results.passed + this.results.failed)) * 100;
    console.log(`\n🎯 Success Rate: ${successRate.toFixed(1)}%`);
    
    if (successRate >= 85) {
      console.log('🎉 EXCELLENT! AI integration is working properly!');
    } else if (successRate >= 70) {
      console.log('⚠️  GOOD, but some issues need attention');
    } else {
      console.log('🚨 POOR, significant issues detected');
    }
    
    console.log('='.repeat(60));
  }
}

// Run the tests
const tester = new MerchManagerTester();
tester.runAllTests().catch(error => {
  console.error('💥 Test suite failed:', error.message);
  process.exit(1);
});
