const axios = require('axios');
const jwt = require('jsonwebtoken');

// This would typically come from environment variables
const MDH_CONFIG = {
  projectID: 'A4117C8D',
  keyId: '1b9f2285-e32b-f011-ad1f-0e0e6a19462f',
  // In production, this should be an environment variable
  // For development, directly use the key from the config file
  // In production, use: privateKey: process.env.MDH_PRIVATE_KEY,
  privateKey: `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAwktz/zrB7m9ewjQfqnzQxt8s5OLG3XSP1Wb0cl667HS38XNz
QgbkRJyhvyuTVmFfLBlEeMf3nRnrECFB9pAOUZ+QlK/x2XvLKEOPG21aQ0ZeP9V4
XNLCKfIGZW5FsLv2xHrAZXy69+mUuEUAl5dqzCMTcXmK3ahbS1zFQb8BSUX0XE7d
GJpSkgzG0LgJdMDVkfM8jXj5mYQKC5RAksdXdavzpHIOPDl3IZ1JaxfmWlYhDLkO
0DtLQFWgPsvr9IsnMJVaQvHBPzFBJp9txGycuFsClXJtQTIZLVHXnPYkUHOHfUOA
tYV4uxDTMWCt0tkFDDTQ1UNpnNIhw9HLRMpSKwIDAQABAoIBAQC/QXtK/c0Akvl0
gP4b5w5pv5s3FQBnC1QEQQm5r6GgGJqUfnkTxSDEYeGY1cV8X2FDXvMIj0S7XGc+
NxNRD9BVBZWqBOu/Y0NVCUPfSARU7cHUk8vl+Q76hDQVv4EYwDpvTtGmcnPWvLgZ
6H0tEBVXzA2eEFBh2FJXyYXyyeIiVTpPQeJcPe2IZ4Jn/jxAHtcX7i+BtH1jEj6L
sb0J4HRfLonY+mj4OjVqcpHRWQEWm+Ua+3nSJVHfMJt84wnw4CJEWtqLPsGw/J7d
slx3rlnLiErm6yXKa0pN6NXfCOgf7b50rZw0YgZ+mIQY+7OQcjhEOh5TLqKXY6wO
5l5NN+ohAoGBAODUq+BpGNu/nDmUHAZ0kQQaA708YS2OBGUhjVWlXDxWcK4/uDHb
FgTy3QGzd7rIjpKpMtDzK4yMk1UzbZvp9cJlvTHnLHo5k6JLDFaEwk0zwTgrEt9w
FHYJCMq6G9vkrMJjsA/hbTCmSTbpAMBX/4GfSrGd5cYTLK0eALy7tDcnAoGBANyt
GXO7u44Z5Mvx/JFQwTKl+6e/kBVXs2SGpgxQG9FPaVl0GFUvW3yYV4CqvjX5P+/M
Dv/HVVGJA8ekwxqjcixvZxIgOtRs/IYqQXOoFE3J3K/VYb2L2zXZ5jfbQT21dPLF
s3JYK8o+RggyUkH+LPQQEpBpluFD7fA9k4uqAbwVAoGATALpcdBWfXj9qZj1fjVW
dw0XlN5vPXJd2yswHI8+cdVcj8OJr19oPHZ0a5TLwGCi03SUE5nYxAXDDLUNkq65
wqvtHnJEIGYASVjwac9mNvDRAvtA2ZO+uZUMCSvPXUKJNs++3VhtUcGV47qGQnLR
vdC8WqmFUjBnEkzQEJASSQUCgYA3QjKF37XQRcxMqADfU5UOjy1HJdhu32l6lnO4
8jUKlznxBRFjHHpIh0WNRH7GnHKcKOYZ0zNBK2tPSbnr/mJwlwFgDQkRNGtHrP25
r1KkVZl5v9bx1/VK4VQJjPnO+zcpMlzeDI0Uu/gZf2IOcvwqF5AJLOZ5lnbLFIhG
dpKKtQKBgHsEe10pFNw76SmN1CgITbg8bEBBtztlhx8+QxgQ6LQMjpcAYQvrM1xd
d1kCO4AAjGz3SRn94LLQdjZ6F8U10VmvYCLQbQxASlB+Wrl2m0iPRt85IGIz8KkE
QZNHlcBYXX+IJ+QDfV1ZcpSAOROB76W0xg0N/fAq/kDf9Z6xBKlM
-----END RSA PRIVATE KEY-----`,
  apiBaseUrl: 'https://api.mydatahelps.org/v1'
};

// Helper to generate JWT for service authentication
function generateServiceAccountJWT() {
  // Create JWT payload
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: MDH_CONFIG.keyId,
    aud: MDH_CONFIG.apiBaseUrl,
    iat: now,
    exp: now + 300 // Token valid for 5 minutes
  };
  
  // Sign the JWT
  const privateKey = MDH_CONFIG.privateKey.replace(/\\n/g, '\n');
  const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
  
  return token;
}

// Helper to create or get a participant
async function getOrCreateParticipant(userIdentifier) {
  try {
    const jwt = generateServiceAccountJWT();
    
    // First try to get the participant by identifier
    try {
      const response = await axios.get(
        `${MDH_CONFIG.apiBaseUrl}/projects/${MDH_CONFIG.projectID}/participants?identifier=${encodeURIComponent(userIdentifier)}`,
        {
          headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && response.data.length > 0) {
        return response.data[0].id; // Return existing participant ID
      }
    } catch (error) {
      console.log('Participant not found, creating new one');
    }
    
    // If not found, create a new participant
    const createResponse = await axios.post(
      `${MDH_CONFIG.apiBaseUrl}/projects/${MDH_CONFIG.projectID}/participants`,
      {
        identifier: userIdentifier,
        demographics: {
          firstName: 'Health',
          lastName: 'Monitor User'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return createResponse.data.id;
  } catch (error) {
    console.error('Error in getOrCreateParticipant:', error);
    throw new Error('Failed to create or retrieve participant');
  }
}

// Helper to generate participant access token
async function generateParticipantToken(participantId) {
  try {
    const jwt = generateServiceAccountJWT();
    
    const response = await axios.post(
      `${MDH_CONFIG.apiBaseUrl}/projects/${MDH_CONFIG.projectID}/participants/${participantId}/accesstoken`,
      {
        scopes: [
          'Demographics.Read', 
          'Demographics.Write',
          'ExternalAccounts.Connect',
          'Resources.Read'
        ],
        expiresIn: 86400 // Token valid for 24 hours
      },
      {
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.accessToken;
  } catch (error) {
    console.error('Error generating participant token:', error);
    throw new Error('Failed to generate participant access token');
  }
}

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }
  
  try {
    const body = JSON.parse(event.body);
    
    // Validate request has necessary user identifier
    // In a real app, this would be an authenticated user ID
    if (!body.userIdentifier) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing userIdentifier' })
      };
    }
    
    // Get or create the MyDataHelps participant
    const participantId = await getOrCreateParticipant(body.userIdentifier);
    
    // Generate a participant access token
    const accessToken = await generateParticipantToken(participantId);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        participantId,
        accessToken
      })
    };
  } catch (error) {
    console.error('Error in function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error', message: error.message })
    };
  }
};
