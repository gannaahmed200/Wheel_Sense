import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import CustomCursor from './components/CustomCursor'
import PageLoader from './components/PageLoader'
import PageTransition from './components/PageTransition'
import Home from './pages/Home'
import Configure from './pages/Configure'
import Dashboard from './pages/Dashboard'
import History from './pages/History'

const base = import.meta.env.BASE_URL.replace(/\/$/, '')

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <>
      <PageTransition />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/configure" element={<Configure />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </AnimatePresence>
    </>
  )
}

export default function App() {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(t)
  }, [])

  return (
    <BrowserRouter basename={base}>
      <CustomCursor />
      {loading ? <PageLoader /> : (
        <>
          <Navbar />
          <AnimatedRoutes />
        </>
      )}
    </BrowserRouter>
  )
}
