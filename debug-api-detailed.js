#!/usr/bin/env node

/**
 * Detailed diagnostic for Google Merchant API 400 error
 */

const axios = require('axios');

async function diagnoseGoogleAPI() {
  console.log('🔍 Google Merchant API Detailed Diagnosis\n');
  
  try {
    // Test the authentication first
    console.log('1. Testing authentication...');
    const { MerchantAuth } = require('./src/auth/MerchantAuth');
    const auth = new MerchantAuth();
    
    const token = await auth.getAccessToken();
    console.log('✅ Authentication successful');
    console.log('   Token length:', token.length);
    console.log('   Token starts with:', token.substring(0, 20) + '...');
    
    // Test direct Google API call
    console.log('\n2. Testing direct Google Merchant API call...');
    const merchantId = process.env.MERCHANT_ID || '5591219286';
    const apiUrl = `https://merchantapi.googleapis.com/products/v1beta/accounts/${merchantId}/products`;
    
    console.log('   API URL:', apiUrl);
    console.log('   Merchant ID:', merchantId);
    
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: {
          pageSize: 1
        },
        timeout: 15000
      });
      
      console.log('✅ Direct API call successful!');
      console.log('   Status:', response.status);
      console.log('   Response keys:', Object.keys(response.data));
      
    } catch (apiError) {
      console.log('❌ Direct API call failed');
      console.log('   Status:', apiError.response?.status);
      console.log('   Status Text:', apiError.response?.statusText);
      
      if (apiError.response?.data) {
        console.log('   Error details:', JSON.stringify(apiError.response.data, null, 2));
        
        // Analyze the specific error
        const errorData = apiError.response.data;
        if (errorData.error) {
          console.log('\n🔍 Error Analysis:');
          console.log('   Error message:', errorData.error.message);
          console.log('   Error code:', errorData.error.code);
          console.log('   Error status:', errorData.error.status);
          
          if (errorData.error.details) {
            console.log('   Error details:', JSON.stringify(errorData.error.details, null, 2));
          }
        }
      }
    }
    
    // Test merchant account access
    console.log('\n3. Testing merchant account access...');
    const accountUrl = `https://merchantapi.googleapis.com/accounts/v1beta/accounts/${merchantId}`;
    
    try {
      const accountResponse = await axios.get(accountUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Merchant account access successful!');
      console.log('   Account name:', accountResponse.data.name);
      console.log('   Account display name:', accountResponse.data.displayName);
      
    } catch (accountError) {
      console.log('❌ Merchant account access failed');
      console.log('   Status:', accountError.response?.status);
      console.log('   Error:', JSON.stringify(accountError.response?.data, null, 2));
      
      if (accountError.response?.status === 403) {
        console.log('\n🚨 DIAGNOSIS: No access to merchant account');
        console.log('   This means the service account doesn\'t have permission to access merchant account:', merchantId);
        console.log('   Solution: Add the service account to your Google Merchant Center account with admin permissions');
      }
    }
    
    // Test with a different merchant ID if needed
    console.log('\n4. Testing with different approaches...');
    
    // Try listing accounts first
    try {
      const listAccountsUrl = 'https://merchantapi.googleapis.com/accounts/v1beta/accounts';
      const listResponse = await axios.get(listAccountsUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Can list accounts!');
      if (listResponse.data.accounts) {
        console.log('   Available accounts:', listResponse.data.accounts.length);
        listResponse.data.accounts.forEach((account, index) => {
          console.log(`   Account ${index + 1}:`, account.name, '-', account.displayName);
        });
      }
      
    } catch (listError) {
      console.log('❌ Cannot list accounts');
      console.log('   Status:', listError.response?.status);
      console.log('   Error:', JSON.stringify(listError.response?.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
  }
}

diagnoseGoogleAPI();
