const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testUpload() {
    try {
        // Create a test file
        const testFile = path.join(__dirname, 'test-file.txt');
        fs.writeFileSync(testFile, 'This is a test file for upload testing');

        // Create form data
        const formData = new FormData();
        formData.append('file', fs.createReadStream(testFile));

        // Make upload request
        const response = await fetch('http://localhost:8080/api/temp-files/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        console.log('Upload response:', JSON.stringify(result, null, 2));

        // Clean up test file
        fs.unlinkSync(testFile);

    } catch (error) {
        console.error('Error:', error);
    }
}

testUpload();
