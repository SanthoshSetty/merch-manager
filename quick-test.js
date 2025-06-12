const axios = require('axios');

async function quickTest() {
  try {
    console.log('Testing field update...');
    
    const response = await axios.patch('http://localhost:3001/api/products/test-product-005/fields', {
      updates: { title: 'Quick Test Title' },
      updateMask: 'attributes.title'
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    });
    
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

quickTest();
