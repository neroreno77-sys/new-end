"use client"

import { useState, useEffect } from "react"
import { useApp } from "./context/AppContext"
import { Login } from "./components/Login"
import { Header } from "./components/Header"
import { PublicTracking } from "./components/PublicTracking"
import { AdminDashboard } from "./components/dashboards/AdminDashboard"
import { TUDashboard } from "./components/dashboards/TUDashboard"
import { CoordinatorDashboard } from "./components/dashboards/CoordinatorDashboard"
import { StaffDashboard } from "./components/dashboards/StaffDashboard"
import { Home, Users, FileText, Clipboard, CheckSquare } from "lucide-react"

function App() {
  const { state } = useApp()
  const [showPublicTracking, setShowPublicTracking] = useState(false)

  useEffect(() => {
    const handleShowPublicTracking = () => {
      setShowPublicTracking(true)
    }

    window.addEventListener("showPublicTracking", handleShowPublicTracking)
    return () => {
      window.removeEventListener("showPublicTracking", handleShowPublicTracking)
    }
  }, [])

  if (!state.currentUser && !showPublicTracking) {
    return <Login />
  }

  if (showPublicTracking) {
    return (
      <div>
        <div className="fixed top-6 left-6 z-50">
          <button
            onClick={() => setShowPublicTracking(false)}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-lg font-medium"
          >
            <Home className="w-5 h-5" />
            Kembali ke Login
          </button>
        </div>
        <PublicTracking />
      </div>
    )
  }

  const getDashboardComponent = () => {
    switch (state.currentUser?.role) {
      case "Admin":
        return <AdminDashboard />
      case "TU":
        return <TUDashboard />
      case "Koordinator":
        return <CoordinatorDashboard />
      case "Staff":
        return <StaffDashboard />
      default:
        return <div>Role tidak dikenal</div>
    }
  }

  const getDashboardIcon = () => {
    switch (state.currentUser?.role) {
      case "Admin":
        return Users
      case "TU":
        return FileText
      case "Koordinator":
        return Clipboard
      case "Staff":
        return CheckSquare
      default:
        return Home
    }
  }

  const Icon = getDashboardIcon()

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-pink-50">
      <Header
        userName={state.currentUser?.name || "User"}
        userRole={state.currentUser?.role || "Role"}
        userTitle={state.currentUser?.role || "Title"}
      />
      <main className="max-w-7xl mx-auto py-4 px-4 sm:py-8 sm:px-6 lg:px-8">{getDashboardComponent()}</main>
    </div>
  )
}

export default App
