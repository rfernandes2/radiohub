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
    
    // Estado para a paginação das rádios
    const [currentRadioPage, setCurrentRadioPage] = useState(1);
    const itemsPerRadioPage = 10;

    // Estado para controle do áudio
    const [audio, setAudio] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentRadioUrl, setCurrentRadioUrl] = useState('');
    const [volume, setVolume] = useState(1); // Volume padrão é 100%

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
    const filteredFilesCount = files.filter(file => file.toLowerCase().startsWith(filter.toLowerCase())).length; // Contar arquivos filtrados
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
                setCurrentRadioPage(1); // Resetar a página das rádios
            })
            .catch((error) => setError(error));
    };

    // Lógica para a paginação das rádios
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

    const playRadio = (url) => {
        // Se já houver um áudio tocando e não for a mesma URL, pause-o
        if (audio && currentRadioUrl !== url) {
            audio.pause();
            setIsPlaying(false);
        }

        // Verifica se a URL do rádio atual é diferente da nova URL
        if (!audio || currentRadioUrl !== url) {
            const newAudio = new Audio(url);
            newAudio.volume = volume; // Definir o volume
            newAudio.play();
            setAudio(newAudio);
            setIsPlaying(true);
            setCurrentRadioUrl(url);

            // Para pausar o áudio quando ele termina
            newAudio.onended = () => {
                setIsPlaying(false);
                setAudio(null); // Resetar o estado do áudio quando terminar
            };
        } else if (audio.paused) {
            // Se o áudio estiver pausado, apenas retome a reprodução
            audio.play();
            setIsPlaying(true);
        }
    };

    const pauseRadio = () => {
        if (audio) {
            audio.pause();
            setIsPlaying(false);
        }
    };

    const stopRadio = () => {
        if (audio) {
            audio.pause();
            audio.currentTime = 0; // Reseta o tempo do áudio para 0
            setIsPlaying(false);
            setAudio(null); // Resetar o estado do áudio
            setCurrentRadioUrl(''); // Limpar a URL da rádio atual
        }
    };

    const handleVolumeChange = (event) => {
        const newVolume = event.target.value;
        setVolume(newVolume);
        if (audio) {
            audio.volume = newVolume; // Ajustar volume do áudio
        }
    };

    return (
        <div>
            <h1>RadioHub</h1>
            {error && <p>Error: {error.message}</p>} {/* Exibir erro se ocorrer */}
            <input 
                type="text" 
                placeholder="Filter by country" 
                className="filter-input" 
                value={filter}
                onChange={(e) => setFilter(e.target.value)} // Atualizar estado do filtro na mudança do input
            />
            <div className="container">
                {currentFiles.map((file, index) => (
                    <div className="cub" key={index} onClick={() => fetchCountryContent(file)}>
                        {file.replace('.json', '').replace(/_/g, ' ')} {/* Formatar nome do arquivo */}
                    </div>
                ))}
            </div>
            <div className="pagination">
                {pageNumbers.map(number => (
                    <button 
                        key={number} 
                        onClick={() => paginate(number)} 
                        className={`pagination-button ${number === currentPage ? 'active' : ''}`} // Adicionando classe para estilo circular
                    >
                        {number}
                    </button>
                ))}
            </div>
            {/* Display selected country content */}
            {selectedCountryContent && (
                <div className="country-content">
                    {/* Controle de volume */}
                    <div className="volume-control">
                        <input 
                            type="range" 
                            id="volume" 
                            min="0" 
                            max="1" 
                            step="0.01" // Passo reduzido para permitir ajuste fino
                            value={volume} 
                            onChange={handleVolumeChange} 
                            style={{ width: '20%' }} // Certifique-se de que a largura é 100%
                        />
                    </div>

                    {/* Navegação para as rádios */}
                    <div className="radio-navigation">
                        <button 
                            className="navigation-button" 
                            onClick={handlePreviousRadioPage} 
                            disabled={currentRadioPage === 1}
                        >
                            {'←'}
                        </button>
                        <div className="radio-container">
                            {currentRadios.map((radio, index) => (
                                <div key={index} className="radio-item">
                                    <img 
                                        src={radio.favicon || defaultImage}
                                        alt={`${radio.name} icon`} 
                                        className="radio-favicon" 
                                    />
                                    <div className="radio-details">
                                        <h3>{radio.name}</h3>
                                        <button 
                                            onClick={() => playRadio(radio.url)} 
                                            className="play-button"
                                        >
                                            <i className={`fas fa-play ${isPlaying && currentRadioUrl === radio.url ? 'hide' : ''}`}></i>
                                            <i className={`fas fa-pause ${isPlaying && currentRadioUrl === radio.url ? '' : 'hide'}`}></i>
                                        </button>
                                        <button 
                                            onClick={stopRadio} 
                                            className="stop-button"
                                        >
                                            <i className="fas fa-stop"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button 
                            className="navigation-button" 
                            onClick={handleNextRadioPage} 
                            disabled={currentRadioPage >= Math.ceil(selectedCountryContent.length / itemsPerRadioPage)}
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
