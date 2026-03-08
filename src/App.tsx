import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { LandingPage } from "./app/LandingPage"
import { ChatApp } from "./app/ChatApp"
import { ErrorBoundary } from "./components/ErrorBoundary"
import "@/styles/globals.css"

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<ChatApp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
