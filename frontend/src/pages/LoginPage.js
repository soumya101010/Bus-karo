"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Bus, Eye, EyeOff, LogIn, ArrowRight } from "lucide-react"
import "../styles/AuthPages.css"

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()
  const particlesRef = useRef(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/dashboard"
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
      window.history.replaceState({}, document.title)
    }
  }, [location])

  useEffect(() => {
    // Create floating particles
    if (particlesRef.current) {
      for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div')
        particle.classList.add('particle')
        
        const size = Math.random() * 4 + 2
        const posX = Math.random() * 100
        const delay = Math.random() * 20
        const duration = Math.random() * 10 + 15
        
        particle.style.width = `${size}px`
        particle.style.height = `${size}px`
        particle.style.left = `${posX}%`
        particle.style.animationDelay = `${delay}s`
        particle.style.animationDuration = `${duration}s`
        
        particlesRef.current.appendChild(particle)
      }
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.userId.trim()) {
      newErrors.userId = "User ID is required"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setSuccessMessage("")

    const result = await login(formData.userId, formData.password)

    if (result.success) {
      const from = location.state?.from?.pathname || "/dashboard"
      navigate(from, { replace: true })
    } else {
      setErrors({
        submit: result.message,
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="bg-gradient"></div>
        <div className="bg-grid"></div>
      </div>

      {/* Floating Particles */}
      <div className="particles" ref={particlesRef}></div>

      {/* Navigation */}
      <nav className="auth-nav">
        <div className="nav-container">
          <motion.div 
            className="nav-logo" 
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="logo-icon">
              <Bus size={28} />
            </div>
            <span className="logo-text">Bus-Karo</span>
          </motion.div>
          <div className="nav-links">
            <motion.button 
              onClick={() => navigate("/register")} 
              className="nav-link"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign Up
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="auth-container">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="auth-card"
        >
          <div className="auth-header">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h1>Welcome Back</h1>
              <p>Sign in to your Bus-Karo account and continue your smart commuting journey</p>
            </motion.div>
          </div>

          {successMessage && (
            <motion.div 
              className="success-message"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {successMessage}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <motion.div 
              className="form-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <label htmlFor="userId">User ID</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  className={errors.userId ? "error" : ""}
                  placeholder="Enter your user ID"
                />
              </div>
              {errors.userId && (
                <motion.span 
                  className="error-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {errors.userId}
                </motion.span>
              )}
            </motion.div>

            <motion.div 
              className="form-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "error" : ""}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <motion.span 
                  className="error-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {errors.password}
                </motion.span>
              )}
            </motion.div>

            {errors.submit && (
              <motion.div 
                className="error-message submit-error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {errors.submit}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="auth-button primary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <LogIn size={20} />
                  Sign In
                  <ArrowRight size={20} />
                </>
              )}
            </motion.button>
          </form>

          <motion.div 
            className="auth-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <p>
              Don't have an account?{" "}
              <button onClick={() => navigate("/register")} className="link-button">
                Create one here
              </button>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default LoginPage