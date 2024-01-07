const core = require('@actions/core');
const fs = require('fs');
const https = require('https');
const archiver = require('archiver');
const github = require('@actions/github');

try {
    const token = core.getInput('token');
    const serverName = core.getInput('server-name');
    const directory = core.getInput('directory');
    var serverUri = core.getInput('server-uri');
    if(!serverUri.endsWith("/")) serverUri += "/";
    serverUri += "api/updateserver?server=" + serverName + "&token=" + token;

    const file = `tmp.zip`
    // Create a writable stream to the zip file
    const output = fs.createWriteStream(file);

    // Create an archiver object
    const archive = archiver('zip', {
    zlib: { level: 9 } // Set compression level (optional)
    });

    // Pipe the archive data to the output file
    archive.pipe(output);

    // Add all files from the source directory to the archive
    archive.directory(directory, false);

    // Finalize the archive (write the zip file)
    archive.finalize();

    output.on('end', () => {
        console.log('Zip file created successfully. Posting update to server...')
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
    });

    

} catch (error) {
    core.setFailed(error.message);
}