import React, { useEffect, useState } from 'react';
import './App.css'; // Ensure this import is present

function App() {
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12); // Show 12 countries per page (4 rows with 3 countries each)
    const [filter, setFilter] = useState(''); // Filter state

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

    // Calculate the current countries to display
    const indexOfLastFile = currentPage * itemsPerPage; // Last country index
    const indexOfFirstFile = indexOfLastFile - itemsPerPage; // First country index
    const currentFiles = files
        .filter(file => file.toLowerCase().startsWith(filter.toLowerCase())) // Filter files
        .slice(indexOfFirstFile, indexOfLastFile); // Current countries to display

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Calculate total pages
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(files.length / itemsPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <div>
            <h1>Files List</h1>
            {error && <p>Error: {error.message}</p>} {/* Display error if it occurs */}
            <input 
                type="text" 
                placeholder="Filter by country" 
                className="filter-input" 
                value={filter}
                onChange={(e) => setFilter(e.target.value)} // Update filter state on input change
            />
            <div className="container">
                {currentFiles.map((file, index) => (
                    <div className="cub" key={index}>
                        {file.replace('.json', '').replace(/_/g, ' ')} {/* Format country name */}
                    </div>
                ))}
            </div>
            <div className="pagination">
                {pageNumbers.map(number => (
                    <button key={number} onClick={() => paginate(number)} className={number === currentPage ? 'active' : ''}>
                        {number}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default App;
