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
    var output = fs.createWriteStream(file);
    var archive = archiver('zip');

    output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');

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
                console.log('Update posted successfully')
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

    archive.on('error', function(err){
        throw err;
    });

    archive.pipe(output);

    // append files from a sub-directory, putting its contents at the root of archive
    archive.directory(directory, false);

    archive.finalize();

} catch (error) {
    core.setFailed(error.message);
}