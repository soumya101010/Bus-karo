// src/App.js
import React from 'react';
import MapView from './components/MapView'; // Make sure this path is correct
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  return (
    <div>
      {/* Main Website Heading */}
      <h1 className="site-heading">City Transport Tracker</h1>

      {/* Map View - USING MapView.js */}
      <MapView />

      {/* Admin Dashboard */}
      <AdminDashboard />
    </div>
  );
}

export default App;