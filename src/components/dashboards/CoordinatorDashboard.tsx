"use client"

import { useState, useEffect } from "react"
import { useApp } from "../../context/AppContext"
import {
  Filter,
  UserPlus,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  MapPin,
  Calendar,
  Eye,
  LogOut,
} from "lucide-react"
import { SERVICES } from "../../types"
import { ReportDetailsModal } from "../modals/ReportDetailsModal"
import { AddStaffModal } from "../modals/AddStaffModal"
import { RevisionModal } from "../modals/RevisionModal"

export function CoordinatorDashboard() {
  const { state, dispatch } = useApp()
  const [activeTab, setActiveTab] = useState("daftar-laporan")
  const [serviceFilter, setServiceFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedReport, setSelectedReport] = useState(null)
  const [addStaffReport, setAddStaffReport] = useState(null)
  const [revisionReport, setRevisionReport] = useState(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatDateTime = (date) => {
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

    const dayName = days[date.getDay()]
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    const time = date.toLocaleTimeString("id-ID", { hour12: false })

    return {
      time,
      date: `${dayName}, ${day} ${month} ${year}`,
    }
  }

  const [trackingQuery, setTrackingQuery] = useState("")
  const [trackingResult, setTrackingResult] = useState(null)
  const [isTracking, setIsTracking] = useState(false)

  const assignedReports = state.reports.filter(
    (report) =>
      report.assignedCoordinators?.includes(state.currentUser?.name) ||
      report.currentHolder === state.currentUser?.name,
  )

  const filteredReports = assignedReports.filter((report) => {
    const matchesService = !serviceFilter || report.layanan === serviceFilter
    const matchesStatus = !statusFilter || report.status === statusFilter
    const matchesSearch =
      !searchQuery ||
      report.hal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.noSurat?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesService && matchesStatus && matchesSearch
  })

  const stats = {
    total: assignedReports.length,
    pending: assignedReports.filter((r) => r.status === "in-progress" || r.status === "Dalam Proses").length,
    completed: assignedReports.filter((r) => r.status === "completed" || r.status === "Selesai").length,
    revision: assignedReports.filter((r) => r.status === "revision-required" || r.status === "Revisi").length,
    assigned: assignedReports.filter((r) => r.assignments && r.assignments.length > 0).length,
  }

  const resetFilters = () => {
    setServiceFilter("")
    setStatusFilter("")
    setSearchQuery("")
  }

  const trackLetter = async (query) => {
    if (!query.trim()) return

    setIsTracking(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const foundReport = state.reports.find(
      (report) =>
        report.noSurat?.toLowerCase().includes(query.toLowerCase()) ||
        report.hal?.toLowerCase().includes(query.toLowerCase()) ||
        report.id?.toString().includes(query),
    )

    if (foundReport) {
      const timeline = generateTrackingTimeline(foundReport)

      setTrackingResult({
        found: true,
        letterNumber: foundReport.noSurat,
        subject: foundReport.hal,
        service: foundReport.layanan,
        status: foundReport.status,
        progress: foundReport.progress || 0,
        currentLocation: getCurrentLocation(foundReport),
        estimatedCompletion: getEstimatedCompletion(foundReport),
        timeline: timeline,
        lastUpdate: new Date().toLocaleString("id-ID"),
      })
    } else {
      setTrackingResult({
        found: false,
        message: "Surat tidak ditemukan. Pastikan nomor surat atau perihal yang Anda masukkan benar.",
      })
    }

    setIsTracking(false)
  }

  const generateTrackingTimeline = (report) => {
    const timeline = [
      {
        step: "Surat Diterima",
        status: "completed",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID"),
        location: "Tata Usaha",
        description: "Surat masuk dan didaftarkan dalam sistem",
      },
      {
        step: "Verifikasi Dokumen",
        status: report.progress >= 25 ? "completed" : "in-progress",
        date: report.progress >= 25 ? new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID") : null,
        location: "Koordinator",
        description: "Pemeriksaan kelengkapan dan validitas dokumen",
      },
      {
        step: "Penugasan Staff",
        status: report.progress >= 50 ? "completed" : report.progress >= 25 ? "in-progress" : "pending",
        date: report.progress >= 50 ? new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID") : null,
        location: "Staff Pelaksana",
        description: "Surat ditugaskan kepada staff untuk diproses",
      },
      {
        step: "Proses Pelayanan",
        status: report.progress >= 75 ? "completed" : report.progress >= 50 ? "in-progress" : "pending",
        date: report.progress >= 75 ? new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID") : null,
        location: "Unit Pelayanan",
        description: "Pelaksanaan layanan sesuai jenis permohonan",
      },
      {
        step: "Selesai",
        status: report.progress >= 100 ? "completed" : "pending",
        date: report.progress >= 100 ? new Date().toLocaleDateString("id-ID") : null,
        location: "Selesai",
        description: "Surat telah selesai diproses dan siap diambil",
      },
    ]

    return timeline
  }

  const getCurrentLocation = (report) => {
    if (report.progress >= 100) return "Selesai - Siap Diambil"
    if (report.progress >= 75) return "Unit Pelayanan"
    if (report.progress >= 50) return "Staff Pelaksana"
    if (report.progress >= 25) return "Koordinator"
    return "Tata Usaha"
  }

  const getEstimatedCompletion = (report) => {
    if (report.progress >= 100) return "Sudah Selesai"

    const daysRemaining = Math.ceil((100 - report.progress) / 20)
    const completionDate = new Date()
    completionDate.setDate(completionDate.getDate() + daysRemaining)

    return completionDate.toLocaleDateString("id-ID")
  }

  const getTimelineStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "in-progress":
        return "bg-blue-500"
      default:
        return "bg-gray-300"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
      case "Selesai":
        return "bg-green-100 text-green-800"
      case "in-progress":
      case "Dalam Proses":
        return "bg-yellow-100 text-yellow-800"
      case "revision-required":
      case "Revisi":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Selesai"
      case "in-progress":
        return "Dalam Proses"
      case "revision-required":
        return "Revisi"
      case "draft":
        return "Draft"
      case "forwarded-to-tu":
        return "Diteruskan ke TU"
      default:
        return status
    }
  }

  const handleViewReport = (report) => {
    setSelectedReport(report)
  }

  const handleAddStaff = (report) => {
    setAddStaffReport(report)
  }

  const handleSendRevision = (report) => {
    setRevisionReport(report)
  }

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" })
  }

  const { time, date } = formatDateTime(currentTime)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Tracking Letters</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <Clock className="w-4 h-4" />
              <span>{time}</span>
              <span>{date}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{state.currentUser?.name || "User"}</div>
                <div className="text-xs text-blue-600">Sesi Diperpanjang</div>
              </div>
              <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-medium">
                {state.currentUser?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Koordinator</h2>
          <p className="text-gray-600">Verifikasi dokumen dan tugaskan laporan kepada staf</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Laporan</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dalam Proses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Selesai</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Perlu Revisi</p>
                <p className="text-2xl font-bold text-gray-900">{stats.revision}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ditugaskan</p>
                <p className="text-2xl font-bold text-gray-900">{stats.assigned}</p>
              </div>
              <UserPlus className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("daftar-laporan")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "daftar-laporan"
                    ? "text-blue-600 border-blue-600 bg-blue-50"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Daftar Laporan
              </button>
              <button
                onClick={() => setActiveTab("lacak-surat")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "lacak-surat"
                    ? "text-blue-600 border-blue-600 bg-blue-50"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Lacak Surat
              </button>
            </div>
          </div>

          {activeTab === "daftar-laporan" && (
            <>
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Cari berdasarkan judul atau nomor surat..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <select
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Semua Layanan</option>
                    {SERVICES.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Semua Status</option>
                    <option value="in-progress">Dalam Proses</option>
                    <option value="completed">Selesai</option>
                    <option value="revision-required">Perlu Revisi</option>
                  </select>

                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Filter className="w-4 h-4" />
                    Reset Filter
                  </button>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daftar Laporan ({filteredReports.length})</h3>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">JUDUL LAPORAN</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">LAYANAN</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">DIAJUKAN OLEH</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">TANGGAL</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">STATUS</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">AKSI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReports.map((report) => (
                        <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{report.hal}</p>
                              <p className="text-sm text-gray-500">{report.noSurat}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900 max-w-xs">
                            <div className="truncate">{report.layanan}</div>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900">TU Staff</td>
                          <td className="py-4 px-4 text-sm text-gray-900">{new Date().toLocaleDateString("id-ID")}</td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(report.status)}`}
                            >
                              {getStatusText(report.status)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewReport(report)}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Lihat Detail"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleAddStaff(report)}
                                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Tambah Staff"
                              >
                                <UserPlus className="w-4 h-4" />
                              </button>
                              {report.assignments && report.assignments.length > 0 && (
                                <button
                                  onClick={() => handleSendRevision(report)}
                                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Kirim Revisi"
                                >
                                  <AlertTriangle className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredReports.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-500">
                            Tidak ada laporan yang sesuai dengan filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === "lacak-surat" && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Lacak Surat</h3>

              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Masukkan nomor surat, ID laporan, atau perihal..."
                        value={trackingQuery}
                        onChange={(e) => setTrackingQuery(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && trackLetter(trackingQuery)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <button
                      onClick={() => trackLetter(trackingQuery)}
                      disabled={isTracking || !trackingQuery.trim()}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      {isTracking ? "Mencari..." : "Lacak"}
                    </button>
                  </div>
                </div>

                {trackingResult && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    {trackingResult.found ? (
                      <div>
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Informasi Surat</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Nomor Surat</p>
                              <p className="font-medium text-gray-900">{trackingResult.letterNumber}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Status</p>
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(trackingResult.status)}`}
                              >
                                {getStatusText(trackingResult.status)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Perihal</p>
                              <p className="font-medium text-gray-900">{trackingResult.subject}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Layanan</p>
                              <p className="font-medium text-gray-900">{trackingResult.service}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Lokasi Saat Ini</p>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-blue-500" />
                                <p className="font-medium text-gray-900">{trackingResult.currentLocation}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Estimasi Selesai</p>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-green-500" />
                                <p className="font-medium text-gray-900">{trackingResult.estimatedCompletion}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mb-6">
                          <h5 className="text-md font-semibold text-gray-900 mb-4">Progress Surat</h5>
                          <div className="flex items-center gap-4 mb-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-3">
                              <div
                                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${trackingResult.progress}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900">{trackingResult.progress}%</span>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-md font-semibold text-gray-900 mb-4">Timeline Perjalanan Surat</h5>
                          <div className="space-y-4">
                            {trackingResult.timeline.map((item, index) => (
                              <div key={index} className="flex items-start gap-4">
                                <div className="flex flex-col items-center">
                                  <div className={`w-4 h-4 rounded-full ${getTimelineStatusColor(item.status)}`} />
                                  {index < trackingResult.timeline.length - 1 && (
                                    <div className="w-0.5 h-8 bg-gray-200 mt-2" />
                                  )}
                                </div>
                                <div className="flex-1 pb-4">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h6 className="font-medium text-gray-900">{item.step}</h6>
                                    {item.status === "completed" && <CheckCircle className="w-4 h-4 text-green-500" />}
                                    {item.status === "in-progress" && <Clock className="w-4 h-4 text-blue-500" />}
                                  </div>
                                  <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    {item.date && (
                                      <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>{item.date}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      <span>{item.location}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <p className="text-xs text-gray-500">Terakhir diperbarui: {trackingResult.lastUpdate}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">{trackingResult.message}</p>
                      </div>
                    )}
                  </div>
                )}

                {!trackingResult && (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Lacak Perjalanan Surat Anda</h4>
                    <p className="text-gray-600 mb-6">
                      Masukkan nomor surat, ID laporan, atau perihal untuk melacak status dan lokasi surat Anda
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                      <h5 className="font-medium text-blue-900 mb-2">Tips Pencarian:</h5>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Gunakan nomor surat lengkap</li>
                        <li>• Masukkan kata kunci dari perihal</li>
                        <li>• Gunakan ID laporan jika tersedia</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showProfileMenu && <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />}

      {selectedReport && <ReportDetailsModal report={selectedReport} onClose={() => setSelectedReport(null)} />}
      {addStaffReport && <AddStaffModal report={addStaffReport} onClose={() => setAddStaffReport(null)} />}
      {revisionReport && <RevisionModal report={revisionReport} onClose={() => setRevisionReport(null)} />}
    </div>
  )
}
