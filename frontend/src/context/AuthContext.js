"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem("authToken"))

  // Set up axios interceptor for authentication
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common["Authorization"]
    }
  }, [token])

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("authToken")

      if (storedToken) {
        try {
          axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`
          const response = await axios.get("/api/profile")

          if (response.data.success) {
            setUser(response.data.user)
            setToken(storedToken)
          } else {
            // Token is invalid, remove it
            localStorage.removeItem("authToken")
            delete axios.defaults.headers.common["Authorization"]
            setToken(null)
          }
        } catch (error) {
          console.error("Auth check failed:", error)
          // Token is invalid, remove it
          localStorage.removeItem("authToken")
          delete axios.defaults.headers.common["Authorization"]
          setToken(null)
        }
      }

      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (userId, password) => {
    try {
      const response = await axios.post("/api/login", {
        userId,
        password,
      })

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data

        // Store token and user data
        localStorage.setItem("authToken", newToken)
        setToken(newToken)
        setUser(userData)

        // Set axios default header
        axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`

        return { success: true }
      }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Login failed. Please try again.",
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await axios.post("/api/register", userData)

      if (response.data.success) {
        return { success: true }
      }
    } catch (error) {
      console.error("Registration error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed. Please try again.",
      }
    }
  }

  const logout = async () => {
    try {
      // Call logout endpoint if user is authenticated
      if (token) {
        await axios.post("/api/logout")
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Clear local storage and state regardless of API call result
      localStorage.removeItem("authToken")
      setToken(null)
      setUser(null)
      delete axios.defaults.headers.common["Authorization"]
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put("/api/profile", profileData)

      if (response.data.success) {
        setUser(response.data.user)
        return { success: true }
      }
    } catch (error) {
      console.error("Profile update error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Profile update failed.",
      }
    }
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user && !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
