"use client"

import { useState } from "react"
import { useApp } from "../context/AppContext"
import { Search, Clock, CheckCircle, AlertCircle, FileText, User, Calendar } from "lucide-react"

export function PublicTracking() {
  const [noSurat, setNoSurat] = useState("")
  const [searchResult, setSearchResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { state } = useApp()

  const handleSearch = async () => {
    if (!noSurat.trim()) {
      alert("Mohon masukkan nomor surat")
      return
    }

    setIsLoading(true)

    // Simulate API call delay for better UX
    setTimeout(() => {
      // Enhanced search algorithm - case insensitive and partial matching
      const normalizedSearch = noSurat.trim().toLowerCase()
      const report = state.reports.find(
        (r) => r.noSurat.toLowerCase().includes(normalizedSearch) || r.noSurat.toLowerCase() === normalizedSearch,
      )

      setSearchResult(report || false)
      setIsLoading(false)
    }, 800)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "in-progress":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "pending":
        return <AlertCircle className="w-5 h-5 text-orange-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const calculateProgress = (workflow) => {
    if (!workflow || workflow.length === 0) return 0
    const completedSteps = workflow.filter((step) => step.status === "completed").length
    return Math.round((completedSteps / workflow.length) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-background/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-border/20">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Search className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Lacak Status Surat Publik</h1>
            <p className="text-muted-foreground">Masukkan nomor surat untuk melacak status dan progres penanganan</p>
          </div>

          <div className="flex gap-4 mb-8">
            <div className="flex-1 relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={noSurat}
                onChange={(e) => setNoSurat(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Masukkan Nomor Surat (contoh: 001/SDM/2025)"
                className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200 text-foreground placeholder:text-muted-foreground"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-6 py-3 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground rounded-lg transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
            >
              <Search className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "Mencari..." : "Lacak Surat"}
            </button>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Sedang mencari surat...</p>
            </div>
          )}

          {/* Not found state */}
          {searchResult === false && !isLoading && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Surat Tidak Ditemukan</h3>
              <p className="text-muted-foreground mb-4">Nomor surat yang Anda masukkan tidak ditemukan dalam sistem.</p>
              <div className="bg-muted/30 p-4 rounded-lg border border-border/20 text-sm text-muted-foreground">
                <p className="font-medium mb-2">Tips pencarian:</p>
                <ul className="text-left space-y-1">
                  <li>• Pastikan nomor surat ditulis dengan benar</li>
                  <li>• Coba gunakan format lengkap (contoh: 001/SDM/2025)</li>
                  <li>• Periksa kembali nomor surat pada dokumen asli</li>
                </ul>
              </div>
            </div>
          )}

          {searchResult && !isLoading && (
            <div className="space-y-6">
              {/* Progress indicator */}
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-primary">Progress Penanganan</h3>
                  <span className="text-sm font-medium text-primary">{calculateProgress(searchResult.workflow)}%</span>
                </div>
                <div className="w-full bg-primary/10 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${calculateProgress(searchResult.workflow)}%` }}
                  ></div>
                </div>
              </div>

              {/* Letter information */}
              <div className="bg-card/50 p-6 rounded-lg border border-border/20">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Informasi Surat
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">No. Surat:</span>
                    <span className="text-muted-foreground">{searchResult.noSurat}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">Hal:</span>
                    <span className="text-muted-foreground">{searchResult.hal}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">Status:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        searchResult.status === "Selesai"
                          ? "bg-green-100 text-green-800"
                          : searchResult.status === "Dalam Proses"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {searchResult.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">Layanan:</span>
                    <span className="text-muted-foreground">{searchResult.layanan}</span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-card/50 p-6 rounded-lg border border-border/20">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Timeline Proses
                </h3>
                <div className="space-y-4">
                  {searchResult.workflow.map((step, index) => (
                    <div key={step.id} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        {getStatusIcon(step.status)}
                        {index < searchResult.workflow.length - 1 && <div className="w-px h-8 bg-border mt-2" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-foreground">{step.action}</h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              step.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : step.status === "in-progress"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {step.status === "completed"
                              ? "Selesai"
                              : step.status === "in-progress"
                                ? "Sedang Diproses"
                                : "Menunggu"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {step.user}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(step.timestamp).toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
