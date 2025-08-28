"use client"

import { useState, useEffect } from "react"
import { useApp } from "../../context/AppContext"
import { SERVICES } from "../../types"
import {
  FileText,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Clock,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  Send,
  Package,
  LogOut,
} from "lucide-react"
import { ReportForm } from "../forms/ReportForm"
import { ForwardForm } from "../forms/ForwardForm"

export function TUDashboard() {
  const { state, dispatch } = useApp()
  const [showReportForm, setShowReportForm] = useState(false)
  const [showForwardForm, setShowForwardForm] = useState(false)
  const [editingReport, setEditingReport] = useState(null)
  const [forwardingReport, setForwardingReport] = useState(null)
  const [activeTab, setActiveTab] = useState("daftar")
  const [searchQuery, setSearchQuery] = useState("")
  const [serviceFilter, setServiceFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [openActionMenu, setOpenActionMenu] = useState(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  const [trackingQuery, setTrackingQuery] = useState("")
  const [trackingResult, setTrackingResult] = useState(null)
  const [isTracking, setIsTracking] = useState(false)

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

  const userReports = state.reports.filter((report) => report.createdBy === state.currentUser?.id)

  const filteredReports = userReports.filter((report) => {
    const matchesService = !serviceFilter || report.layanan === serviceFilter
    const matchesStatus = !statusFilter || report.status === statusFilter
    const matchesSearch =
      !searchQuery ||
      report.hal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.noSurat?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesService && matchesStatus && matchesSearch
  })

  const stats = {
    totalLaporan: userReports.length,
    menungguVerifikasi: userReports.filter((r) => r.status === "Menunggu Verifikasi").length,
    dalamProses: userReports.filter((r) => r.status === "Dalam Proses").length,
    selesai: userReports.filter((r) => r.status === "Selesai").length,
    dikembalikan: userReports.filter((r) => r.status === "Dikembalikan").length,
  }

  const handleLetterTracking = async () => {
    if (!trackingQuery.trim()) return

    setIsTracking(true)
    setTrackingResult(null)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const foundReport = state.reports.find(
      (report) =>
        report.noSurat?.toLowerCase().includes(trackingQuery.toLowerCase()) ||
        report.id?.toLowerCase().includes(trackingQuery.toLowerCase()) ||
        report.hal?.toLowerCase().includes(trackingQuery.toLowerCase()),
    )

    if (foundReport) {
      const trackingInfo = {
        found: true,
        letterNumber: foundReport.noSurat || foundReport.id,
        subject: foundReport.hal,
        status: foundReport.status,
        progress: foundReport.progress || 0,
        currentLocation: getCurrentLocation(foundReport),
        timeline: generateTimeline(foundReport),
        estimatedCompletion: getEstimatedCompletion(foundReport),
      }
      setTrackingResult(trackingInfo)
    } else {
      const mockTracking = generateMockTracking(trackingQuery)
      setTrackingResult(mockTracking)
    }

    setIsTracking(false)
  }

  const getCurrentLocation = (report) => {
    if (report.status === "Selesai") return "Arsip - Dokumen Selesai"
    if (report.status === "Dalam Proses") return `${report.currentHolder || "Koordinator"} - Sedang Diproses`
    if (report.status === "Menunggu Verifikasi") return "Tata Usaha - Menunggu Verifikasi"
    if (report.status === "Dikembalikan") return "Tata Usaha - Perlu Perbaikan"
    return "Tata Usaha - Baru Diterima"
  }

  const generateTimeline = (report) => {
    const timeline = []
    if (report.workflow) {
      report.workflow.forEach((step, index) => {
        timeline.push({
          step: index + 1,
          action: step.action,
          user: step.user,
          date: new Date(step.timestamp).toLocaleDateString("id-ID"),
          time: new Date(step.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          status: step.status,
        })
      })
    }
    return timeline
  }

  const getEstimatedCompletion = (report) => {
    const progress = report.progress || 0
    if (progress >= 100) return "Selesai"

    const daysRemaining = Math.ceil((100 - progress) / 10) // Estimate 10% progress per day
    const completionDate = new Date()
    completionDate.setDate(completionDate.getDate() + daysRemaining)

    return completionDate.toLocaleDateString("id-ID")
  }

  const generateMockTracking = (query) => {
    return {
      found: true,
      letterNumber: query,
      subject: "Surat Permohonan Layanan Kepegawaian",
      status: "Dalam Proses",
      progress: 65,
      currentLocation: "Koordinator Kepegawaian - Sedang Diproses",
      timeline: [
        {
          step: 1,
          action: "Surat diterima oleh Tata Usaha",
          user: "Admin TU",
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID"),
          time: "09:15",
          status: "completed",
        },
        {
          step: 2,
          action: "Verifikasi dokumen lengkap",
          user: "Petugas Verifikasi",
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID"),
          time: "14:30",
          status: "completed",
        },
        {
          step: 3,
          action: "Diteruskan ke Koordinator",
          user: "Admin TU",
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID"),
          time: "10:45",
          status: "completed",
        },
        {
          step: 4,
          action: "Sedang diproses oleh Koordinator",
          user: "Koordinator Kepegawaian",
          date: new Date().toLocaleDateString("id-ID"),
          time: "08:20",
          status: "in-progress",
        },
      ],
      estimatedCompletion: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("id-ID"),
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Selesai":
        return "bg-green-100 text-green-800"
      case "Dalam Proses":
        return "bg-blue-100 text-blue-800"
      case "Menunggu Verifikasi":
        return "bg-yellow-100 text-yellow-800"
      case "Dikembalikan":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Tinggi":
        return "bg-red-500 text-white"
      case "Sedang":
        return "bg-blue-500 text-white"
      case "Rendah":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getProgressColor = (progress) => {
    if (progress >= 80) return "bg-green-500"
    if (progress >= 50) return "bg-blue-500"
    if (progress >= 20) return "bg-yellow-500"
    return "bg-gray-300"
  }

  const handleAddReport = () => {
    setEditingReport(null)
    setShowReportForm(true)
  }

  const handleEditReport = (report) => {
    setEditingReport(report)
    setShowReportForm(true)
    setOpenActionMenu(null)
  }

  const handleDeleteReport = (reportId) => {
    if (confirm("Apakah Anda yakin ingin menghapus laporan ini?")) {
      dispatch({ type: "DELETE_REPORT", payload: reportId })
    }
    setOpenActionMenu(null)
  }

  const handleForwardReport = (report) => {
    setForwardingReport(report)
    setShowForwardForm(true)
    setOpenActionMenu(null)
  }

  const handleReportSubmit = (reportData) => {
    const newReport = {
      ...reportData,
      id: editingReport?.id || `RPT${Date.now()}`,
      createdBy: state.currentUser?.id || "",
      attachments: reportData.originalFiles || [],
      assignments: editingReport?.assignments || [],
      assignedStaff: editingReport?.assignedStaff || [],
      assignedCoordinators: editingReport?.assignedCoordinators || [],
      currentHolder: editingReport?.currentHolder || "",
      progress: editingReport?.progress || 0,
      priority: reportData.priority || "Sedang", // Added priority field
      workflow: editingReport?.workflow || [
        {
          id: `w${Date.now()}`,
          action: `Dibuat oleh ${state.currentUser?.name}`,
          user: state.currentUser?.name || "",
          timestamp: new Date().toISOString(),
          status: "completed",
        },
      ],
    }

    if (editingReport) {
      dispatch({ type: "UPDATE_REPORT", payload: newReport })
    } else {
      dispatch({ type: "ADD_REPORT", payload: newReport })
    }
    setShowReportForm(false)
    setEditingReport(null)
  }

  const handleForwardSubmit = (forwardData) => {
    const updatedReport = {
      ...forwardingReport,
      assignedCoordinators: forwardData.coordinators,
      currentHolder: forwardData.coordinators[0],
      status: "Dalam Proses",
      workflow: [
        ...forwardingReport.workflow,
        {
          id: `w${Date.now()}`,
          action: "Diteruskan ke Koordinator",
          user: state.currentUser?.name || "",
          timestamp: new Date().toISOString(),
          status: "completed",
        },
        {
          id: `w${Date.now() + 1}`,
          action: "Dalam Verifikasi Dokumen",
          user: forwardData.coordinators[0],
          timestamp: new Date().toISOString(),
          status: "in-progress",
        },
      ],
    }

    dispatch({ type: "UPDATE_REPORT", payload: updatedReport })
    setShowForwardForm(false)
    setForwardingReport(null)
  }

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" })
  }

  const resetFilters = () => {
    setServiceFilter("")
    setStatusFilter("")
    setSearchQuery("")
  }

  const handleWorkflowAction = async (reportId: string, transitionType: string, notes?: string) => {
    try {
      const response = await fetch("/api/workflow/transitions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId,
          transitionType,
          notes,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Update local state or refetch reports
        alert(result.message)
        // You might want to refresh the reports list here
        window.location.reload()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error("Workflow action error:", error)
      alert("Terjadi kesalahan saat memproses workflow")
    }
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

      <div className="p-4 sm:p-6">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Dashboard Tata Usaha</h2>
          <p className="text-sm sm:text-base text-gray-600">Kelola pengajuan dan laporan kepegawaian</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Laporan</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalLaporan}</p>
              </div>
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Menunggu Verifikasi</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.menungguVerifikasi}</p>
              </div>
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Dalam Proses</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.dalamProses}</p>
              </div>
              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Selesai</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.selesai}</p>
              </div>
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Dikembalikan</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.dikembalikan}</p>
              </div>
              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab("daftar")}
                className={`px-4 sm:px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                  activeTab === "daftar"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Daftar Laporan
              </button>
              <button
                onClick={() => setActiveTab("buat")}
                className={`px-4 sm:px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                  activeTab === "buat"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Buat Laporan Baru
              </button>
              <button
                onClick={() => setActiveTab("lacak")}
                className={`px-4 sm:px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                  activeTab === "lacak"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Lacak Surat
              </button>
            </div>
          </div>

          {activeTab === "daftar" && (
            <>
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="relative sm:col-span-2 lg:col-span-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari berdasarkan judul atau nomor surat..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <select
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">Semua Status</option>
                    <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                    <option value="Dalam Proses">Dalam Proses</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Dikembalikan">Dikembalikan</option>
                  </select>
                  <button
                    onClick={resetFilters}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Reset Filter</span>
                    <span className="sm:hidden">Reset</span>
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
                  Daftar Laporan ({filteredReports.length})
                </h3>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            NO SURAT
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Layanan
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                            Diajukan Oleh
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                            Tanggal
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                            Prioritas
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                            Progress
                          </th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredReports.map((report) => (
                          <tr key={report.id} className="hover:bg-gray-50">
                            <td className="px-3 sm:px-6 py-4 text-sm font-medium text-gray-900">
                              <div className="max-w-32 sm:max-w-none truncate">{report.noSurat || report.hal}</div>
                            </td>
                            <td className="px-3 sm:px-6 py-4 text-sm text-gray-900">
                              <div className="max-w-24 sm:max-w-xs truncate">{report.layanan}</div>
                            </td>
                            <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 hidden sm:table-cell">
                              {state.currentUser?.name || "TU"}
                            </td>
                            <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 hidden md:table-cell">
                              {new Date(report.createdAt || Date.now()).toLocaleDateString("id-ID")}
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(report.status)}`}
                              >
                                <span className="hidden sm:inline">{report.status}</span>
                                <span className="sm:hidden">
                                  {report.status === "Menunggu Verifikasi"
                                    ? "Tunggu"
                                    : report.status === "Dalam Proses"
                                      ? "Proses"
                                      : report.status === "Dikembalikan"
                                        ? "Kembali"
                                        : report.status}
                                </span>
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded ${getPriorityColor(report.priority || "Sedang")}`}
                              >
                                {report.priority || "Sedang"}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${getProgressColor(report.progress || 0)}`}
                                    style={{ width: `${report.progress || 0}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-600">{report.progress || 0}%</span>
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2 relative">
                                <div className="relative">
                                  <button
                                    onClick={() => setOpenActionMenu(openActionMenu === report.id ? null : report.id)}
                                    className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                                    title="Menu Lainnya"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                  {openActionMenu === report.id && (
                                    <div className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                                      <div className="py-1">
                                        <button
                                          onClick={() => handleEditReport(report)}
                                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                          <Edit className="w-4 h-4" />
                                          Edit Laporan
                                        </button>
                                        <button
                                          onClick={() => handleDeleteReport(report.id)}
                                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                          Hapus
                                        </button>
                                        <button
                                          onClick={() => handleForwardReport(report)}
                                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                                        >
                                          <Send className="w-4 h-4" />
                                          Teruskan ke Koordinator
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredReports.length === 0 && (
                          <tr>
                            <td colSpan={8} className="px-6 py-8 text-center text-gray-500 text-sm">
                              {userReports.length === 0
                                ? 'Belum ada laporan. Klik tab "Buat Laporan Baru" untuk membuat laporan baru.'
                                : "Tidak ada laporan yang sesuai dengan filter yang dipilih."}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "buat" && (
            <div className="p-4 sm:p-6">
              <button
                onClick={handleAddReport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                Buat Laporan Baru
              </button>
            </div>
          )}

          {activeTab === "lacak" && (
            <div className="p-4 sm:p-6">
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-6 sm:mb-8">
                  <Package className="w-12 h-12 sm:w-16 sm:h-16 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Lacak Surat</h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Masukkan nomor surat atau ID laporan untuk melacak status
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Masukkan nomor surat atau ID laporan..."
                        value={trackingQuery}
                        onChange={(e) => setTrackingQuery(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleLetterTracking()}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                    <button
                      onClick={handleLetterTracking}
                      disabled={isTracking || !trackingQuery.trim()}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <Search className="w-4 h-4" />
                      {isTracking ? "Melacak..." : "Lacak"}
                    </button>
                  </div>
                </div>

                {isTracking && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Sedang melacak surat...</p>
                  </div>
                )}

                {trackingResult && !isTracking && (
                  <div className="bg-white border rounded-lg p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900">Surat Ditemukan</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Nomor Surat</p>
                        <p className="font-medium text-gray-900 text-sm sm:text-base break-all">
                          {trackingResult.letterNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Perihal</p>
                        <p className="font-medium text-gray-900 text-sm sm:text-base">{trackingResult.subject}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Status</p>
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(trackingResult.status)}`}
                        >
                          {trackingResult.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Estimasi Selesai</p>
                        <p className="font-medium text-gray-900 text-sm sm:text-base">
                          {trackingResult.estimatedCompletion}
                        </p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="text-sm text-gray-600 mb-2">Progress</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${getProgressColor(trackingResult.progress)}`}
                            style={{ width: `${trackingResult.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{trackingResult.progress}%</span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="text-sm text-gray-600 mb-4">Lokasi Saat Ini</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{trackingResult.currentLocation}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-4">Riwayat Perjalanan Surat</p>
                      <div className="space-y-4">
                        {trackingResult.timeline.map((item, index) => (
                          <div key={index} className="flex items-start gap-3 sm:gap-4">
                            <div
                              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                item.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : item.status === "in-progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {item.step}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm sm:text-base">{item.action}</p>
                              <p className="text-sm text-gray-600">{item.user}</p>
                              <p className="text-xs text-gray-500">
                                {item.date} • {item.time}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showProfileMenu && <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />}
      {openActionMenu && <div className="fixed inset-0 z-0" onClick={() => setOpenActionMenu(null)} />}

      {showReportForm && (
        <ReportForm
          report={editingReport}
          onSubmit={handleReportSubmit}
          onCancel={() => {
            setShowReportForm(false)
            setEditingReport(null)
          }}
        />
      )}

      {showForwardForm && (
        <ForwardForm
          report={forwardingReport}
          onSubmit={handleForwardSubmit}
          onCancel={() => {
            setShowForwardForm(false)
            setForwardingReport(null)
          }}
        />
      )}
    </div>
  )
}
