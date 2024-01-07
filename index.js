const core = require('@actions/core');
const fs = require('fs');
const https = require('https');
const github = require('@actions/github');

try {
  const token = core.getInput('token');
  const file = core.getInput('file');
  var serverUri = core.getInput('server-uri');
  if(!serverUri.endsWith("/")) serverUri += "/";
  const fileData = fs.readFileSync(file);
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream', // Set the content type to raw binary data
    },
  };

  const req = https.request(url, options, (res) => {
    let responseData = '';
  
    // A chunk of data has been received.
    res.on('data', (chunk) => {
      responseData += chunk;
    });
  
    // The whole response has been received.
    res.on('end', () => {
      console.log(responseData);
    });
  });
  
  // Handle errors
  req.on('error', (error) => {
    console.error(error);
    core.setFailed(error);
  });
  
  // Write the raw binary data to the request body
  req.write(fileData);
  
  // End the request
  req.end();

} catch (error) {
  core.setFailed(error.message);
}