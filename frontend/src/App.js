// src/App.js
import React from 'react';
import MapView from './components/MapView';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  return (
    <div>
      {/* Main Website Heading */}
      <h1 className="site-heading">City Transport Tracker</h1>

      {/* Map View */}
      <MapView />

      {/* Admin Dashboard (already includes chart) */}
      <AdminDashboard />
    </div>
  );
}

export default App;
