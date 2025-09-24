"use client"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { motion } from "framer-motion"

const DashboardHeader = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  return (
    <header
      style={{
        background: "rgba(255, 255, 255, 0.2)", // Glass blur background
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        color: "#2d3748",
        padding: "1.5rem 2rem",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        borderRadius: "16px",
        margin: "0 auto 2rem auto",
        maxWidth: "100%", // stretches full width
        border: "1px solid rgba(255, 255, 255, 0.3)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Logo & Dashboard Name */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "2rem" }}>🚌</span>
          <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: "700" }}>Bus-Karo Dashboard</h1>
        </div>

        {/* User Info & Logout */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: "1rem", fontWeight: "500" }}>
              Welcome, {user?.fullName || user?.userId}
            </p>
            <p style={{ margin: 0, fontSize: "0.875rem", opacity: 0.9 }}>{user?.email}</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "#2d3748",
              padding: "0.5rem 1rem",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: "500",
              transition: "all 0.3s ease",
              backdropFilter: "blur(10px)",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.3)"
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.2)"
            }}
          >
            Logout
          </motion.button>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
