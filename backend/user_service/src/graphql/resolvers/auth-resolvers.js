// Import the JWT utils
const { generateToken } = require('../../utils/jwt-utils');

// ... existing code ...

// Update your login resolver to use the JWT utility
const login = async (_, { username, password }) => {
  try {
    // Validate user credentials (your existing code)
    // ...
    
    // Once user is validated, generate token with our utility
    const token = generateToken({ 
      id: user.id, 
      username: user.username,
      role: user.role 
    });
    
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        // other user properties
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Authentication failed: ' + error.message);
  }
};

// ... existing code ...
