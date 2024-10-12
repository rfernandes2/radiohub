const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());

// Directory containing country files
const directoryPath = path.join(__dirname, 'radios');

// Endpoint to fetch all files (countries)
app.get('/api/files', (req, res) => {
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return res.status(500).json({ error: 'Unable to scan directory' });
        }
        const jsonFiles = files.filter(file => path.extname(file) === '.json');
        res.json(jsonFiles);
    });
});

// New endpoint to fetch content for a specific country
app.get('/api/files/:country', (req, res) => {
    const country = req.params.country;
    const filePath = path.join(directoryPath, `${country}.json`);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(404).json({ error: 'Country not found' });
        }
        res.json(JSON.parse(data));
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
