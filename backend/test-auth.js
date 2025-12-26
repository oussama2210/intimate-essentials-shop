const { generateToken, verifyToken } = require('./dist/utils/jwt');

// Test JWT functionality
const testAdmin = {
  id: 'test-admin-id',
  username: 'testadmin',
  email: 'test@example.com',
  role: 'ADMIN'
};

try {
  console.log('🔐 Testing JWT token generation and verification...');
  
  // Generate token
  const token = generateToken(testAdmin);
  console.log('✅ Token generated successfully');
  console.log('Token length:', token.length);
  
  // Verify token
  const decoded = verifyToken(token);
  console.log('✅ Token verified successfully');
  console.log('Decoded payload:', decoded);
  
  console.log('🎉 Authentication utilities are working correctly!');
} catch (error) {
  console.error('❌ Authentication test failed:', error.message);
}