"use client"

import { useState } from "react"
import { useApp } from "../../context/AppContext"
import { X, Users } from "lucide-react"
import { STAFF_MEMBERS, TODO_ITEMS } from "../../types"

export function AddStaffModal({ report, onClose }) {
  const { dispatch } = useApp()
  const [selectedStaff, setSelectedStaff] = useState([])
  const [selectedTodos, setSelectedTodos] = useState([])
  const [notes, setNotes] = useState("")

  const alreadyAssignedStaff = report.assignments ? report.assignments.map((a) => a.staffName) : []

  const handleStaffChange = (staff, checked) => {
    if (checked) {
      setSelectedStaff([...selectedStaff, staff])
    } else {
      setSelectedStaff(selectedStaff.filter((s) => s !== staff))
    }
  }

  const handleTodoChange = (todo, checked) => {
    if (checked) {
      setSelectedTodos([...selectedTodos, todo])
    } else {
      setSelectedTodos(selectedTodos.filter((t) => t !== todo))
    }
  }

  const handleAddStaff = () => {
    if (selectedStaff.length === 0 || selectedTodos.length === 0) {
      alert("Pilih staff dan minimal satu tugas")
      return
    }

    const newAssignments = selectedStaff.map((staff) => ({
      id: `assignment_${Date.now()}_${staff}`,
      staffName: staff,
      todoList: selectedTodos,
      completedTasks: [],
      progress: 0,
      status: "in-progress",
      notes,
      assignedAt: new Date().toISOString(),
    }))

    const updatedAssignments = [...(report.assignments || []), ...newAssignments]

    const totalProgress = updatedAssignments.reduce((sum, assignment) => sum + assignment.progress, 0)
    const averageProgress = updatedAssignments.length > 0 ? Math.round(totalProgress / updatedAssignments.length) : 0

    const updatedReport = {
      ...report,
      assignments: updatedAssignments,
      assignedStaff: [...(report.assignedStaff || []), ...selectedStaff],
      progress: averageProgress,
      workflow: [
        ...report.workflow,
        {
          id: `w${Date.now()}`,
          action: `Staff tambahan ditugaskan: ${selectedStaff.join(", ")}`,
          user: report.currentHolder || "",
          timestamp: new Date().toISOString(),
          status: "completed",
        },
      ],
    }

    dispatch({ type: "UPDATE_REPORT", payload: updatedReport })
    onClose()
    alert(`Staff ${selectedStaff.join(", ")} berhasil ditambahkan ke tugas!`)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Penugasan Tugas
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column - Staff Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pilih Staff:</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {STAFF_MEMBERS.map((staff) => {
                  const isAlreadyAssigned = alreadyAssignedStaff.includes(staff)
                  return (
                    <label
                      key={staff}
                      className={`flex items-center ${isAlreadyAssigned ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <input
                        type="checkbox"
                        checked={isAlreadyAssigned || selectedStaff.includes(staff)}
                        onChange={(e) => !isAlreadyAssigned && handleStaffChange(staff, e.target.checked)}
                        disabled={isAlreadyAssigned}
                        className={`rounded border-gray-300 text-red-600 focus:ring-red-500 ${
                          isAlreadyAssigned ? "bg-red-100 border-red-300" : ""
                        }`}
                      />
                      <span
                        className={`ml-3 text-sm ${isAlreadyAssigned ? "text-gray-400 line-through" : "text-gray-700"}`}
                      >
                        {staff}
                        {isAlreadyAssigned && <span className="ml-2 text-xs text-red-500">(Sudah ditugaskan)</span>}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Right Column - Todo List */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Daftar To-Do:</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {TODO_ITEMS.map((todo) => (
                  <label key={todo} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTodos.includes(todo)}
                      onChange={(e) => handleTodoChange(todo, e.target.checked)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">{todo}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mt-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Catatan:
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              placeholder="Tambahkan catatan untuk staff..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6">
            <button
              onClick={handleAddStaff}
              disabled={selectedStaff.length === 0 || selectedTodos.length === 0}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Tugaskan
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
