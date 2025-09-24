// frontend/src/socket.js
import { io } from "socket.io-client"

// Connect to backend on port 3001
const SOCKET_URL = "http://localhost:3001"

// Create socket connection with configuration
const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
})

// Debug logging for connection events
socket.on("connect", () => {
  console.log("✅ Connected to server:", socket.id)
})

socket.on("disconnect", () => {
  console.log("❌ Disconnected from server")
})

socket.on("connect_error", (error) => {
  console.error("Connection error:", error)
})

// Export socket as default export
export default socket
