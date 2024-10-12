import React, { useEffect, useState } from 'react';

function App() {
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://localhost:5000/api/files') // Fetch from the Express server
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => setFiles(data)) // Set the fetched files to state
            .catch((error) => setError(error)); // Handle errors
    }, []);

    return (
        <div>
            <h1>Files List</h1>
            {error && <p>Error: {error.message}</p>} {/* Display error if it occurs */}
            <ul>
                {files.map((file, index) => (
                    <li key={index}>{file}</li> // List each file
                ))}
            </ul>
        </div>
    );
}

export default App;
