import React from 'react';
import MapView from './components/MapView';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <div>
      <h1>City Transport Tracker</h1>
      <MapView />
      <AdminDashboard />
    </div>
  );
}

export default App;
