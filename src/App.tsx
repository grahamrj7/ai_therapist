import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { LandingPage } from "./app/LandingPage"
import { ChatApp } from "./app/ChatApp"
import "@/styles/globals.css"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<ChatApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
