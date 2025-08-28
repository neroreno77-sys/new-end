"use client"
import { Download, Eye, File } from "lucide-react"
import type { FileAttachment } from "../types"

interface FileViewerProps {
  files: FileAttachment[]
  canDownload?: boolean
  title?: string
}

export function FileViewer({ files, canDownload = true, title = "File Terlampir" }: FileViewerProps) {
  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(
        `/api/download?url=${encodeURIComponent(fileUrl)}&fileName=${encodeURIComponent(fileName)}`,
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

  const handleView = (fileUrl: string) => {
    window.open(fileUrl, "_blank")
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    return <File className="w-5 h-5 text-gray-500" />
  }

  if (!files || files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <File className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>Tidak ada file terlampir</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <div className="space-y-2">
        {files.map((file) => (
          <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center space-x-3">
              {getFileIcon(file.fileName)}
              <div>
                <p className="text-sm font-medium text-gray-900">{file.fileName}</p>
                <p className="text-xs text-gray-500">
                  Diupload oleh {file.uploadedBy} pada{" "}
                  {new Date(file.uploadedAt).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {canDownload && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleView(file.fileUrl)}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                  title="Lihat file"
                >
                  <Eye className="w-4 h-4" />
                  <span>Lihat</span>
                </button>
                <button
                  onClick={() => handleDownload(file.fileUrl, file.fileName)}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                  title="Unduh file"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
