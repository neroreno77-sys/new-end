"use client"

import type React from "react"
import { useState } from "react"
import { useApp } from "../context/AppContext"
import { Shield, FileText, Eye, EyeOff, BarChart3, Workflow } from "lucide-react"

export function Login() {
  const [credentials, setCredentials] = useState({ id: "", password: "" })
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const { state, dispatch } = useApp()

  const handlePublicTracking = () => {
    window.dispatchEvent(new CustomEvent("showPublicTracking", { detail: true }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const user = state.users.find((u) => u.id === credentials.id && u.password === credentials.password)

    if (user) {
      dispatch({ type: "LOGIN", payload: user })
    } else {
      setError("ID atau password salah")
    }
  }

  const getCurrentTime = () => {
    const now = new Date()
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ]

    const dayName = days[now.getDay()]
    const date = now.getDate()
    const month = months[now.getMonth()]
    const year = now.getFullYear()
    const time = now.toLocaleTimeString("id-ID", { hour12: false })

    return `${dayName}, ${date} ${month} ${year}, ${time}`
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16">
        <div className="max-w-lg">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">Tracking Letters</h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">Kementerian Lingkungan Hidup (SDM)</p>

          <div className="mb-8 p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Waktu Server:</p>
            <p className="text-lg font-semibold text-gray-900">{getCurrentTime()}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <Shield className="w-4 h-4 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Multi-Role</h3>
              </div>
              <p className="text-sm text-gray-600">Admin, Koordinator, TU, dan Staff</p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Real-time</h3>
              </div>
              <p className="text-sm text-gray-600">Tracking progress secara langsung</p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">28 Layanan</h3>
              </div>
              <p className="text-sm text-gray-600">Berbagai jenis layanan kepegawaian</p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <Workflow className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Terintegrasi</h3>
              </div>
              <p className="text-sm text-gray-600">Workflow yang seamless</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md bg-white shadow-xl flex flex-col justify-center px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Masuk ke Sistem</h2>
          <p className="text-gray-600">Masukkan kredensial Anda untuk mengakses sistem</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div>
            <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="id"
              value={credentials.id}
              onChange={(e) => setCredentials({ ...credentials, id: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder:text-gray-500"
              placeholder="Masukkan username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder:text-gray-500 pr-12"
                placeholder="Masukkan password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
              Ingat saya (7 hari)
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-4 rounded-lg transition-colors font-medium"
          >
            Masuk
          </button>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handlePublicTracking}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Pelacakan Surat
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">Lacak status surat tanpa perlu login</p>
          </div>
        </form>
      </div>
    </div>
  )
}
