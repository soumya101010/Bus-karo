import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import DashboardHeader from "./components/DashboardHeader"
import LandingPage from "./pages/LandingPage"
import AdminDashboard from "./components/AdminDashboard"
import MapView from "./components/MapView"
import RegisterPage from "./pages/RegisterPage"
import LoginPage from "./pages/LoginPage"
import "./App.css"

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardWrapper />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

function DashboardWrapper() {
  return (
    <div>
      <DashboardHeader />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1rem" }}>
        <h1 className="site-heading">City Transport Tracker</h1>

        <MapView />
        <AdminDashboard />
      </div>
    </div>
  )
}

export default App
