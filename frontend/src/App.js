import React from 'react';
import MapView from './components/MapView';
import RouteSearch from './components/RouteSearch';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <div>
      <h1>City Transport Tracker</h1>
      <MapView />
      <RouteSearch />
      <AdminDashboard />
    </div>
  );
}

export default App;
