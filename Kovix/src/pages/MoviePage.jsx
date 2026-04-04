import { useState } from 'react';
import { useParams } from 'react-router-dom';
import CharactersList from '../components/CharactersList';   

const MoviePage = () => {
    const { movieId } = useParams(); 
    
    const [refreshKey, setRefreshKey] = useState(0);

    const handleImportSuccess = () => {
        setRefreshKey(prevKey => prevKey + 1); 
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>Керування фільмом / аніме (ID: {movieId})</h1>

            <hr style={{ margin: '30px 0' }} />

            <div>
                <CharactersList 
                    movieId={movieId} 
                    key={refreshKey} 
                />
            </div>
        </div>
    );
};

export default MoviePage;