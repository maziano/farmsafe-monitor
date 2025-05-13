const fetch = require('node-fetch');

// Check if MyDataHelps server is accessible
async function checkServer() {
  try {
    console.log('Checking server accessibility...');
    
    // Try to access the server
    const response = await fetch('https://app.mydatahelps.org/');
    
    if (response.ok) {
      console.log('Server is accessible! Status:', response.status);
    } else {
      console.log('Server returned non-OK status:', response.status);
    }
  } catch (error) {
    console.error('Error accessing server:', error.message);
  }
}

checkServer();
