"use client"

import { useState } from "react"
import { useApp } from "../../context/AppContext"
import { X, AlertTriangle } from "lucide-react"

interface RevisionModalProps {
  report: any
  onClose: () => void
}

export function RevisionModal({ report, onClose }: RevisionModalProps) {
  const { dispatch } = useApp()
  const [selectedStaff, setSelectedStaff] = useState("")
  const [revisionNotes, setRevisionNotes] = useState("")

  const handleSubmitRevision = () => {
    if (!selectedStaff || !revisionNotes.trim()) {
      alert("Pilih staff dan berikan catatan revisi!")
      return
    }

    const updatedAssignments = report.assignments.map((assignment: any) => {
      if (assignment.staffName === selectedStaff) {
        return {
          ...assignment,
          status: "revision-required",
          needsRevision: true,
          revisionNotes: revisionNotes.trim(),
          progress: 0,
          completedTasks: [],
        }
      }
      return assignment
    })

    const updatedReport = {
      ...report,
      assignments: updatedAssignments,
      status: "revision-required",
    }

    dispatch({ type: "UPDATE_REPORT", payload: updatedReport })
    onClose()
    alert(`Revisi berhasil dikirim ke ${selectedStaff}!`)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">Kirim Revisi</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Staff untuk Revisi:</label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">-- Pilih Staff --</option>
              {report.assignments?.map((assignment: any) => (
                <option key={assignment.staffName} value={assignment.staffName}>
                  {assignment.staffName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Revisi:</label>
            <textarea
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="Berikan catatan revisi yang jelas untuk staff..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmitRevision}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Kirim Revisi
          </button>
        </div>
      </div>
    </div>
  )
}
