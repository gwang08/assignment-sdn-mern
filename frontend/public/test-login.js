/**
 * Simple test to verify backend API connection
 */

// Test the login endpoint directly
async function testLoginAPI() {
  try {
    console.log('🧪 Testing login API...');
    
    const response = await fetch('http://localhost:5000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin'
      })
    });

    const data = await response.json();
    console.log('✅ API Response:', data);
    
    if (response.ok && data.success) {
      console.log('🎉 Login API is working correctly!');
      console.log('👤 User:', data.data.user);
      console.log('🔑 Token received:', !!data.data.token);
    } else {
      console.log('❌ Login failed:', data.message);
    }
  } catch (error) {
    console.error('❌ API Test failed:', error);
  }
}

// Test when page loads
window.addEventListener('DOMContentLoaded', () => {
  console.log('🔧 Login API Test Tool');
  console.log('📝 Run testLoginAPI() in console to test the API');
  
  // Auto-test after 2 seconds
  setTimeout(testLoginAPI, 2000);
});

// Make function available globally
window.testLoginAPI = testLoginAPI;
