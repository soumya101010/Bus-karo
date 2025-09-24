"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  Bus,
  MapPin,
  Clock,
  AlertTriangle,
  Building2,
  Moon,
  Sun,
  BarChart3,
  Users,
  Smartphone,
  Timer,
  TrendingUp,
  Zap,
  Shield,
  Globe,
  Star
} from "lucide-react"
import "../styles/LandingPage.css"

const LandingPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const particlesRef = useRef(null)
  const heroRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    document.documentElement.classList.add("dark")
    
    // Create enhanced particles
    if (particlesRef.current) {
      for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div')
        particle.classList.add('particle')
        
        const size = Math.random() * 6 + 2
        const posX = Math.random() * 100
        const delay = Math.random() * 20
        const duration = Math.random() * 15 + 20
        
        particle.style.width = `${size}px`
        particle.style.height = `${size}px`
        particle.style.left = `${posX}%`
        particle.style.animationDelay = `${delay}s`
        particle.style.animationDuration = `${duration}s`
        
        particlesRef.current.appendChild(particle)
      }
    }
    
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
  }

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" })
  }

  const features = [
    {
      icon: <MapPin size={28} />,
      title: "Live Tracking",
      description: "Real-time bus position, speed, and ETA displayed on an interactive map with precision accuracy.",
    },
    {
      icon: <Clock size={28} />,
      title: "Smart Timetable",
      description: "View daily and weekly schedules with delays and disruptions highlighted in real-time.",
    },
    {
      icon: <AlertTriangle size={28} className="text-orange-400" />,
      title: "Emergency Alerts",
      description: "Instant notifications for breakdowns, route changes, or emergency situations.",
    },
    {
      icon: <Building2 size={28} />,
      title: "Multi-City Support",
      description: "Seamlessly switch between different cities and routes with comprehensive coverage.",
    },
    {
      icon: <Zap size={28} />,
      title: "AI-Powered Insights",
      description: "Machine learning algorithms predict delays and optimize journey planning.",
    },
    {
      icon: <BarChart3 size={28} />,
      title: "Advanced Analytics",
      description: "Comprehensive dashboards with performance metrics and predictive analytics.",
    },
  ]

  const benefits = [
    {
      icon: <Timer size={28} />,
      title: "Save Travel Time",
      description: "Get accurate ETAs and plan your journey with confidence. Reduce waiting time by up to 40%.",
    },
    {
      icon: <TrendingUp size={28} />,
      title: "Improve City Transport",
      description: "Help operators optimize routes and schedules with data-driven insights for better efficiency.",
    },
    {
      icon: <Users size={28} />,
      title: "Enhanced Experience",
      description: "Enjoy stress-free commuting with personalized journey planning and real-time updates.",
    },
    {
      icon: <Shield size={28} />,
      title: "Reliable & Secure",
      description: "Enterprise-grade security with 99.9% uptime ensuring your data is always protected.",
    },
  ]

  const stats = [
    { number: "10M+", label: "Active Users", icon: <Users size={24} /> },
    { number: "500+", label: "Cities Covered", icon: <Globe size={24} /> },
    { number: "99.9%", label: "Uptime", icon: <Shield size={24} /> },
    { number: "4.8★", label: "User Rating", icon: <Star size={24} /> },
  ]

  return (
    <div className={`landing-page ${isDarkMode ? "dark" : ""}`}>
      {/* Enhanced Particle Animation */}
      <div className="particles" ref={particlesRef}></div>
      
      {/* Navigation */}
      <nav className="nav-bar">
        <div className="nav-container">
          <motion.div 
            className="nav-logo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="logo-icon">
              <Bus size={32} />
            </div>
            <span className="logo-text">Bus-Karo</span>
          </motion.div>
          <div className="nav-links">
            <button onClick={() => scrollToSection("home")}>Home</button>
            <button onClick={() => scrollToSection("features")}>Features</button>
            <button onClick={() => scrollToSection("analytics")}>Analytics</button>
            <button onClick={() => scrollToSection("about")}>About</button>
            <motion.button 
              onClick={toggleTheme} 
              className="theme-toggle"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
            </motion.button>
            <motion.button 
              className="track-bus-btn" 
              onClick={() => (window.location.href = "/dashboard")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Track a Bus
            </motion.button>
            <motion.button 
              className="get-started-btn" 
              onClick={() => (window.location.href = "/register")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <section id="home" className="hero-section" ref={heroRef}>
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="hero-text"
          >
            <h1 className="hero-headline">
              Smarter Bus Tracking.
              <br />
              <span className="gradient-text">Smoother Journeys.</span>
            </h1>
            <p className="hero-subtext">
              Revolutionary real-time bus monitoring system powered by AI and advanced analytics. 
              Transform your daily commute with predictive insights and seamless journey planning.
            </p>
            
            {/* Stats Section */}
            <motion.div 
              className="hero-stats"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="stat-item"
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            <div className="hero-buttons">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="cta-primary"
                onClick={() => (window.location.href = "/dashboard")}
              >
                <Zap size={20} />
                Track a Bus Now →
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="cta-secondary"
                onClick={() => scrollToSection("demo")}
              >
                ▶ Request Demo
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mission-content"
          >
            <h2>Revolutionizing Public Transport</h2>
            <p>
              Bus-Karo's mission is to eliminate transit uncertainty through cutting-edge technology. 
              We combine real-time tracking, AI-powered predictions, and comprehensive analytics to create 
              the world's most intelligent transportation ecosystem.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <h2>Powerful Features for Smart Transit</h2>
            <p>Everything you need to track, analyze, and optimize your bus journey experience with precision.</p>
          </motion.div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                viewport={{ once: true }}
                className="feature-card"
                onClick={feature.action}
                style={{ cursor: feature.action ? "pointer" : "default" }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <h2>Why Choose Bus-Karo?</h2>
            <p>Transform your daily commute and contribute to building smarter, more efficient cities.</p>
          </motion.div>
          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                viewport={{ once: true }}
                className="benefit-card"
              >
                <div className="benefit-icon">{benefit.icon}</div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Demo Section */}
      <section id="analytics" className="demo-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <h2>See Bus-Karo in Action</h2>
            <p>Experience the power of real-time tracking and comprehensive analytics in motion.</p>
          </motion.div>
          <div className="demo-content">
            <motion.div 
              className="demo-left"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="live-tracking-card">
                <h3>Live Tracking Dashboard</h3>
                <div className="tracking-map">
                  <div className="map-bg"></div>
                  <div className="bus-dot active"></div>
                  <div className="bus-dot secondary"></div>
                  <div className="route-line"></div>
                  <div className="map-markers">
                    <div className="marker marker-1"></div>
                    <div className="marker marker-2"></div>
                  </div>
                </div>
                <p>Real-time bus positions with predictive ETA</p>
              </div>
            </motion.div>
            <motion.div 
              className="demo-right"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="analytics-card">
                <h3>Performance Analytics</h3>
                <div className="analytics-item">
                  <span>Average Speed</span>
                  <div className="progress-bar">
                    <div className="progress animated" style={{ width: "78%" }}></div>
                  </div>
                  <span className="value">47 km/h</span>
                </div>
                <div className="analytics-item">
                  <span>On-time Performance</span>
                  <div className="progress-bar">
                    <div className="progress animated" style={{ width: "91%" }}></div>
                  </div>
                  <span className="value">91%</span>
                </div>
                <div className="analytics-item">
                  <span>Passenger Load</span>
                  <div className="progress-bar orange">
                    <div className="progress animated" style={{ width: "68%" }}></div>
                  </div>
                  <span className="value">68%</span>
                </div>
                <div className="analytics-item">
                  <span>User Satisfaction</span>
                  <div className="progress-bar green">
                    <div className="progress animated" style={{ width: "94%" }}></div>
                  </div>
                  <span className="value">4.8★</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Final CTA Section */}
      <section className="final-cta-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="cta-content"
          >
            <h2>Ready to Transform Your Commute?</h2>
            <p>
              Join millions of commuters and hundreds of transport operators who trust Bus-Karo 
              for reliable, intelligent, and efficient public transportation solutions.
            </p>
            <div className="cta-buttons">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="cta-primary"
                onClick={() => (window.location.href = "/register")}
              >
                <Smartphone size={20} />
                Try Bus-Karo Today →
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="cta-secondary"
                onClick={() => (window.location.href = "/register")}
              >
                Get Started Free
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="logo-icon">
                  <Bus size={28} />
                </div>
                <span className="logo-text">Bus-Karo</span>
              </div>
              <p>
                Next-generation smart bus tracking and simulation system for better public transport. 
                Real-time tracking, predictive analytics, and enhanced commuter experience powered by AI.
              </p>
            </div>
            <div className="footer-links">
              <div className="link-group">
                <h4>Quick Links</h4>
                <a href="/">Home</a>
                <a href="#features">Features</a>
                <a href="#analytics">Analytics</a>
                <a href="/contact">Contact</a>
              </div>
              <div className="link-group">
                <h4>Support</h4>
                <a href="/help">Help Center</a>
                <a href="/docs">Documentation</a>
                <a href="/privacy">Privacy Policy</a>
                <a href="/terms">Terms of Service</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 Bus-Karo. All rights reserved. Built with ❤️ for smarter cities and better commutes.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage