"use client"

import { useState } from "react"
import { Send, ArrowRight, CheckCircle, RotateCcw } from "lucide-react"

interface WorkflowActionsProps {
  report: any
  userRole: string
  onWorkflowAction: (reportId: string, transitionType: string, notes?: string) => void
}

export function WorkflowActions({ report, userRole, onWorkflowAction }: WorkflowActionsProps) {
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [selectedAction, setSelectedAction] = useState("")
  const [notes, setNotes] = useState("")

  const getAvailableActions = () => {
    const actions = []

    // TU actions
    if (userRole === "TU" && (report.status === "draft" || report.status === "completed")) {
      actions.push({
        type: "send_to_coordinator",
        label: "Teruskan ke Koordinator",
        icon: Send,
        color: "bg-blue-600 hover:bg-blue-700",
        description: "Kirim laporan ke koordinator untuk review",
      })
    }

    // Coordinator actions
    if (userRole === "Koordinator") {
      if (report.status === "pending_coordinator_review") {
        actions.push({
          type: "assign_to_staff",
          label: "Tugaskan ke Staff",
          icon: ArrowRight,
          color: "bg-green-600 hover:bg-green-700",
          description: "Tugaskan laporan ke staff untuk dikerjakan",
        })
      }

      if (report.status === "pending_coordinator_review") {
        actions.push({
          type: "complete_to_tu",
          label: "Selesaikan ke TU",
          icon: CheckCircle,
          color: "bg-purple-600 hover:bg-purple-700",
          description: "Tandai selesai dan kembalikan ke TU",
        })

        actions.push({
          type: "request_revision",
          label: "Minta Revisi",
          icon: RotateCcw,
          color: "bg-orange-600 hover:bg-orange-700",
          description: "Kirim kembali ke staff untuk revisi",
        })
      }
    }

    // Staff actions
    if (userRole === "Staff" && (report.status === "in_progress" || report.status === "revision_required")) {
      actions.push({
        type: "return_to_coordinator",
        label: "Kirim ke Koordinator",
        icon: ArrowRight,
        color: "bg-indigo-600 hover:bg-indigo-700",
        description: "Kirim hasil kerja ke koordinator",
      })
    }

    return actions
  }

  const handleActionClick = (actionType: string) => {
    setSelectedAction(actionType)
    setNotes("")
    setShowNotesModal(true)
  }

  const handleSubmitAction = () => {
    onWorkflowAction(report.id, selectedAction, notes)
    setShowNotesModal(false)
    setSelectedAction("")
    setNotes("")
  }

  const availableActions = getAvailableActions()

  if (availableActions.length === 0) {
    return null
  }

  const selectedActionData = availableActions.find((a) => a.type === selectedAction)

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {availableActions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.type}
              onClick={() => handleActionClick(action.type)}
              className={`flex items-center gap-2 px-3 py-2 text-white rounded-lg transition-colors text-sm ${action.color}`}
              title={action.description}
            >
              <Icon className="w-4 h-4" />
              {action.label}
            </button>
          )
        })}
      </div>

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{selectedActionData?.label}</h3>
            <p className="text-sm text-gray-600 mb-4">{selectedActionData?.description}</p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Catatan (Opsional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tambahkan catatan untuk tindakan ini..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowNotesModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitAction}
                className={`px-4 py-2 text-white rounded-lg ${selectedActionData?.color}`}
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
