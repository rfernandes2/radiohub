const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Use CORS middleware to allow cross-origin requests
app.use(cors());

// Endpoint to get files from a specific folder
app.get('/api/files', (req, res) => {
    const directoryPath = path.join(__dirname, 'radios');

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to scan directory: ' + err });
        }
        res.json(files); // Respond with the list of files
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
