import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);
    const [filter, setFilter] = useState('');
    const [selectedCountryContent, setSelectedCountryContent] = useState(null); // State for selected country content

    useEffect(() => {
        fetch('http://localhost:5000/api/files')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => setFiles(data))
            .catch((error) => setError(error));
    }, []);

    const indexOfLastFile = currentPage * itemsPerPage;
    const indexOfFirstFile = indexOfLastFile - itemsPerPage;
    const currentFiles = files
        .filter(file => file.toLowerCase().startsWith(filter.toLowerCase()))
        .slice(indexOfFirstFile, indexOfLastFile);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(files.length / itemsPerPage); i++) {
        pageNumbers.push(i);
    }

    // Function to fetch content for the selected country
    const fetchCountryContent = (country) => {
        fetch(`http://localhost:5000/api/files/${country.replace('.json', '')}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => setSelectedCountryContent(data))
            .catch((error) => setError(error));
    };

    return (
        <div>
            <h1>Files List</h1>
            {error && <p>Error: {error.message}</p>}
            <input
                type="text"
                placeholder="Filter by country"
                className="filter-input"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
            />
            <div className="container">
                {currentFiles.map((file, index) => (
                    <div className="cub" key={index} onClick={() => fetchCountryContent(file)}>
                        {file.replace('.json', '').replace(/_/g, ' ')}
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
            {/* Display selected country content */}
            {selectedCountryContent && (
                <div className="country-content">
                    <h2>Content for {selectedCountryContent.name}</h2>
                    <pre>{JSON.stringify(selectedCountryContent, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export default App;
