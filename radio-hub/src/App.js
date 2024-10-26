import React, { useEffect, useState } from 'react';
import './App.css';
import defaultImage from './default-image-url.png';

function App() {
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [filter, setFilter] = useState('');
    const [selectedCountryContent, setSelectedCountryContent] = useState(null);
    
    // State for radio pagination
    const [currentRadioPage, setCurrentRadioPage] = useState(1);
    const itemsPerRadioPage = 10;

    // State for audio control
    const [audio, setAudio] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentRadioUrl, setCurrentRadioUrl] = useState('');
    const [volume, setVolume] = useState(1); // Volume default is 100%
    const [volumePercentage, setVolumePercentage] = useState(100); // Initial volume percentage
    const [radioFilter, setRadioFilter] = useState(''); // State for radio filtering

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

    // Cleanup audio on unmount or when it changes
    useEffect(() => {
        return () => {
            if (audio) {
                audio.pause();
                setAudio(null); // Reset audio state when the component unmounts
            }
        };
    }, [audio]);

    const indexOfLastFile = currentPage * itemsPerPage;
    const indexOfFirstFile = indexOfLastFile - itemsPerPage;
    const currentFiles = files
        .filter(file => file.toLowerCase().startsWith(filter.toLowerCase()))
        .slice(indexOfFirstFile, indexOfLastFile);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const pageNumbers = [];
    const filteredFilesCount = files.filter(file => file.toLowerCase().startsWith(filter.toLowerCase())).length;
    for (let i = 1; i <= Math.ceil(filteredFilesCount / itemsPerPage); i++) {
        pageNumbers.push(i);
    }

    const fetchCountryContent = (country) => {
        fetch(`http://localhost:5000/api/files/${country.replace('.json', '')}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                setSelectedCountryContent(data);
                setCurrentRadioPage(1); // Reset radio page
            })
            .catch((error) => setError(error));
    };

    // Logic for radio pagination
    const indexOfLastRadio = currentRadioPage * itemsPerRadioPage;
    const indexOfFirstRadio = indexOfLastRadio - itemsPerRadioPage;
    const currentRadios = selectedCountryContent ? selectedCountryContent.slice(indexOfFirstRadio, indexOfLastRadio) : [];

    const handlePreviousRadioPage = () => {
        if (currentRadioPage > 1) {
            setCurrentRadioPage(currentRadioPage - 1);
        }
    };

    const handleNextRadioPage = () => {
        if (currentRadioPage < Math.ceil(selectedCountryContent.length / itemsPerRadioPage)) {
            setCurrentRadioPage(currentRadioPage + 1);
        }
    };

    const playRadio = async (url) => {
        if (currentRadioUrl === url) {
            if (isPlaying) {
                pauseRadio(); // Pause if it's currently playing
            } else {
                audio.play(); // Resume playing
                setIsPlaying(true);
            }
            return; // Exit to avoid further processing
        }

        if (audio) {
            audio.pause(); // Pause the current audio
            setIsPlaying(false);
        }

        const newAudio = new Audio(url);
        newAudio.volume = volume; // Set the volume
        try {
            await newAudio.play(); // Use await to handle play request
            setAudio(newAudio);
            setIsPlaying(true);
            setCurrentRadioUrl(url); // Set the current radio URL for highlighting

            newAudio.onended = () => {
                setIsPlaying(false);
                setAudio(null); // Reset audio state when it finishes
                setCurrentRadioUrl(''); // Clear current radio URL when playback ends
            };
        } catch (error) {
            console.error("Error playing audio:", error);
        }
    };

    const pauseRadio = () => {
        if (audio) {
            audio.pause(); // Pause the audio
            setIsPlaying(false); // Update state to reflect that audio is not playing
        }
    };

    const stopRadio = () => {
        if (audio) {
            audio.pause(); // Pause the audio
            audio.currentTime = 0; // Reset audio time to 0
            setIsPlaying(false);
            setAudio(null); // Reset audio state
            setCurrentRadioUrl(''); // Clear current radio URL
        }
    };

    const handleVolumeChange = (event) => {
        const newVolume = event.target.value;
        setVolume(newVolume);
        setVolumePercentage(Math.round(newVolume * 100)); // Update volume percentage
        if (audio) {
            audio.volume = newVolume; // Adjust audio volume
        }
    };

    // Apply radio filter
    const filteredRadios = selectedCountryContent
        ? selectedCountryContent.filter(radio => radio.name.toLowerCase().includes(radioFilter.toLowerCase()))
        : [];

    return (
        <div>
            <h1>RadioHub</h1>
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
                    <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`pagination-button ${number === currentPage ? 'active' : ''}`}
                    >
                        {number}
                    </button>
                ))}
            </div>

            {selectedCountryContent && (
                <div className="country-content">
                    <div className="volume-control">
                        <input
                            type="range"
                            id="volume"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            style={{ width: '20%' }}
                        />
                        <span>{volumePercentage}%</span>
                        <button 
                            onClick={stopRadio} 
                            className="stop-button" 
                            style={{ marginLeft: '10px' }}
                        >
                            Stop
                        </button>
                    </div>

                    {/* New Radio Filter */}
                    <input
                        type="text"
                        placeholder="Search for a radio"
                        className="radio-filter-input"
                        value={radioFilter}
                        onChange={(e) => setRadioFilter(e.target.value)}
                    />

                    <div className="radio-navigation">
                        <button
                            className="navigation-button"
                            onClick={handlePreviousRadioPage}
                            disabled={currentRadioPage === 1}
                            aria-label="Previous page"
                        >
                            {'←'}
                        </button>
                        <div className="radio-container">
                            {filteredRadios.length === 0 ? (
                                <p>No radios found.</p>
                            ) : (
                                filteredRadios.slice(indexOfFirstRadio, indexOfLastRadio).map((radio, index) => (
                                    <div
                                        key={index}
                                        className={`radio-item ${currentRadioUrl === radio.url ? 'playing' : ''}`}
                                        onClick={() => playRadio(radio.url)}
                                    >
                                        <img
                                            src={radio.favicon || defaultImage}
                                            alt={`${radio.name} icon`}
                                            className="radio-favicon"
                                        />
                                        <div className="radio-details">
                                            <h3>{radio.name}</h3>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <button
                            className="navigation-button"
                            onClick={handleNextRadioPage}
                            disabled={currentRadioPage >= Math.ceil(filteredRadios.length / itemsPerRadioPage)}
                            aria-label="Next page"
                        >
                            {'→'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
