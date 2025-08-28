"use client"

import { useState } from "react"
import { X, Upload, File, Trash2, User, LogOut } from "lucide-react"
import { SERVICES } from "../../types"
import type { FileAttachment } from "../../types"
import { useApp } from "../../context/AppContext"

export function ReportForm({ report, onSubmit, onCancel }) {
  const { state } = useApp()
  const currentUser = state.currentUser

  const logout = () => {
    // Simple logout - clear localStorage and reload
    localStorage.removeItem("sitrack_app_state")
    window.location.reload()
  }

  const [formData, setFormData] = useState({
    layanan: report?.layanan || "",
    noAgenda: report?.noAgenda || "",
    kelompokAsalSurat: report?.kelompokAsalSurat || "",
    agendaSestama: report?.agendaSestama || "",
    noSurat: report?.noSurat || "",
    hal: report?.hal || "",
    dari: report?.dari || "",
    tanggalAgenda: report?.tanggalAgenda || "",
    tanggalSurat: report?.tanggalSurat || "",
    sifat: report?.sifat || [],
    derajat: report?.derajat || [],
    status: report?.status || "Dalam Proses",
  })

  const [attachments, setAttachments] = useState<FileAttachment[]>(report?.originalFiles || [])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (
      !currentUser ||
      (currentUser.role !== "TU" && currentUser.role !== "Admin" && currentUser.role !== "Coordinator")
    ) {
      alert("Hanya TU, Admin, dan Coordinator yang dapat membuat laporan baru")
      return
    }

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          originalFiles: attachments,
          currentUser: currentUser,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save report")
      }

      const result = await response.json()

      alert(`Laporan berhasil disimpan!\nNomor Tracking: ${result.report.trackingNumber}`)

      onSubmit({
        ...formData,
        originalFiles: attachments,
        id: result.report.id,
        trackingNumber: result.report.trackingNumber,
      })
    } catch (error) {
      console.error("Error saving report:", error)
      alert(`Gagal menyimpan laporan: ${error.message}`)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleCheckboxChange = (e, field) => {
    const { value, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [field]: checked ? [...prev[field], value] : prev[field].filter((item) => item !== value),
    }))
  }

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return

    setUploading(true)
    const reportId = report?.id || `temp-${Date.now()}`

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileId = `${file.name}-${Date.now()}`

      try {
        setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }))

        const formData = new FormData()
        formData.append("file", file)
        formData.append("reportId", reportId)
        formData.append("uploadedBy", currentUser?.name || "Unknown User")

        const response = await fetch("/api/upload", {
          method: "POST",
          credentials: "include",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Upload failed")
        }

        const fileAttachment: FileAttachment = await response.json()
        setAttachments((prev) => [...prev, fileAttachment])
        setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }))
      } catch (error) {
        console.error("Error uploading file:", error)
        alert(`Gagal mengupload file ${file.name}`)
      }
    }

    setUploading(false)
    setUploadProgress({})
  }

  const handleRemoveFile = (fileId: string) => {
    setAttachments((prev) => prev.filter((file) => file.id !== fileId))
  }

  const handleDownloadFile = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(
        `/api/download?url=${encodeURIComponent(fileUrl)}&fileName=${encodeURIComponent(fileName)}`,
        {
          credentials: "include",
        },
      )

      if (!response.ok) {
        throw new Error("Download failed")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading file:", error)
      alert("Gagal mengunduh file")
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{report ? "Edit Laporan" : "Buat Laporan Baru"}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {currentUser && (
          <div className="mx-6 mt-4 p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">
                    Sedang login sebagai: <span className="font-bold">{currentUser.name}</span>
                  </p>
                  <p className="text-sm text-blue-700">
                    Role: <span className="font-semibold">{currentUser.role}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-2 px-3 py-1 text-sm border border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="layanan" className="block text-sm font-medium text-gray-700 mb-2">
                Layanan
              </label>
              <select
                id="layanan"
                name="layanan"
                value={formData.layanan}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Pilih Layanan</option>
                {SERVICES.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="noAgenda" className="block text-sm font-medium text-gray-700 mb-2">
                No. Agenda
              </label>
              <input
                type="text"
                id="noAgenda"
                name="noAgenda"
                value={formData.noAgenda}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="kelompokAsalSurat" className="block text-sm font-medium text-gray-700 mb-2">
                Kelompok Asal Surat
              </label>
              <input
                type="text"
                id="kelompokAsalSurat"
                name="kelompokAsalSurat"
                value={formData.kelompokAsalSurat}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="agendaSestama" className="block text-sm font-medium text-gray-700 mb-2">
                Agenda Sestama
              </label>
              <input
                type="text"
                id="agendaSestama"
                name="agendaSestama"
                value={formData.agendaSestama}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="noSurat" className="block text-sm font-medium text-gray-700 mb-2">
                No. Surat
              </label>
              <input
                type="text"
                id="noSurat"
                name="noSurat"
                value={formData.noSurat}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="hal" className="block text-sm font-medium text-gray-700 mb-2">
                Hal
              </label>
              <input
                type="text"
                id="hal"
                name="hal"
                value={formData.hal}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="dari" className="block text-sm font-medium text-gray-700 mb-2">
                Dari
              </label>
              <input
                type="text"
                id="dari"
                name="dari"
                value={formData.dari}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="tanggalAgenda" className="block text-sm font-medium text-gray-700 mb-2">
                Tgl. Agenda
              </label>
              <input
                type="date"
                id="tanggalAgenda"
                name="tanggalAgenda"
                value={formData.tanggalAgenda}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="tanggalSurat" className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Surat
              </label>
              <input
                type="date"
                id="tanggalSurat"
                name="tanggalSurat"
                value={formData.tanggalSurat}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sifat</label>
              <div className="space-y-2">
                {["Biasa", "Penting", "Rahasia"].map((sifat) => (
                  <label key={sifat} className="flex items-center">
                    <input
                      type="checkbox"
                      value={sifat}
                      checked={formData.sifat.includes(sifat)}
                      onChange={(e) => handleCheckboxChange(e, "sifat")}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{sifat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Derajat</label>
              <div className="space-y-2">
                {["Biasa", "Segera", "Kilat"].map((derajat) => (
                  <label key={derajat} className="flex items-center">
                    <input
                      type="checkbox"
                      value={derajat}
                      checked={formData.derajat.includes(derajat)}
                      onChange={(e) => handleCheckboxChange(e, "derajat")}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{derajat}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Unggah Berkas</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Klik untuk upload</span> atau drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF, DOCX, JPG, PNG (MAX. 10MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept=".pdf,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  disabled={uploading}
                />
              </label>
            </div>

            {attachments.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">File Terlampir:</h4>
                <div className="space-y-2">
                  {attachments.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <File className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.fileName}</p>
                          <p className="text-xs text-gray-500">
                            Diupload oleh {file.uploadedBy} pada {new Date(file.uploadedAt).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(file.fileUrl, file.fileName)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Unduh
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(file.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploading && (
              <div className="mt-4">
                <div className="text-sm text-gray-600">Mengupload file...</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: "50%" }}></div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Mengupload..." : report ? "Update" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
