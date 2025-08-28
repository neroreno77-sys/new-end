"use client"

import { Bell, FileText } from "lucide-react"
import { useState } from "react"
import { useApp } from "../context/AppContext"

interface HeaderProps {
  userRole: string
  userName: string
  userTitle: string
}

export function Header({ userRole, userName, userTitle }: HeaderProps) {
  const [showLogoutMenu, setShowLogoutMenu] = useState(false)
  const { dispatch } = useApp()

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" })
    setShowLogoutMenu(false)
  }

  const safeUserName = userName || "User"
  const safeUserRole = userRole || "Role"
  const displayTitle = safeUserRole

  const userInitials =
    safeUserName
      .split(" ")
      .map((n) => n[0] || "")
      .join("")
      .toUpperCase() || "U"

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="bg-blue-500 p-2 rounded-lg">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-gray-900">SITRACK</h1>
            <p className="text-sm text-gray-600">Sistem Tracking Surat</p>
          </div>
          <div className="sm:hidden">
            <h1 className="text-lg font-bold text-gray-900">SITRACK</h1>
          </div>
        </div>

        <div className="hidden sm:flex items-center">
          <div className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium">{safeUserRole}</div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <Bell className="hidden sm:block w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-800" />

          <div className="flex items-center space-x-2">
            <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium">
              {userInitials}
            </div>
            <div className="cursor-pointer relative" onClick={() => setShowLogoutMenu(!showLogoutMenu)}>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 truncate max-w-24 sm:max-w-none">{safeUserName}</p>
                <p className="text-xs text-gray-600 hidden sm:block">{displayTitle}</p>
              </div>

              {showLogoutMenu && (
                <div className="absolute right-0 top-full mt-2 w-40 sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showLogoutMenu && <div className="fixed inset-0 z-40" onClick={() => setShowLogoutMenu(false)} />}
    </header>
  )
}
