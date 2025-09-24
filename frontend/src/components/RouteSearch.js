// frontend/src/components/RouteSearch.js
import React, { useState } from 'react';

const RouteSearch = () => {
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [routes, setRoutes] = useState([]);

    const handleSearch = (e) => {
        e.preventDefault();
        setRoutes([{ source, destination, eta: '12 mins' }]);
    };

    return (
        <div>
            <form onSubmit={handleSearch}>
                <input value={source} onChange={e => setSource(e.target.value)} placeholder="Source" required />
                <input value={destination} onChange={e => setDestination(e.target.value)} placeholder="Destination" required />
                <button type="submit">Search</button>
            </form>
            {routes.map((r, i) => (
                <div key={i}>
                    <p>Route from {r.source} to {r.destination}</p>
                    <p>ETA: {r.eta}</p>
                </div>
            ))}
        </div>
    );
};

export default RouteSearch;
