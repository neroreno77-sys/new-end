"use client"

import { useState, useEffect } from "react"
import { useApp } from "../../context/AppContext"
import { CheckSquare, Clock, Send, AlertTriangle, Download, CheckCircle, XCircle, LogOut } from "lucide-react"
import { FileViewer } from "../FileViewer"

export function StaffDashboard() {
  const { state, dispatch } = useApp()
  const [selectedTask, setSelectedTask] = useState(null)
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

  const getCurrentUserAssignment = (report) => {
    return report.assignments?.find((assignment) => assignment.staffName === state.currentUser?.name)
  }

  const hasRevisionRequest = (report) => {
    const userAssignment = getCurrentUserAssignment(report)
    return userAssignment?.status === "revision-requested"
  }

  const assignedReports = state.reports.filter((report) =>
    report.assignments?.some((assignment) => assignment.staffName === state.currentUser?.name),
  )

  const stats = {
    total: assignedReports.length,
    inProgress: assignedReports.filter((r) => {
      const userAssignment = getCurrentUserAssignment(r)
      return userAssignment && userAssignment.status === "in-progress"
    }).length,
    completed: assignedReports.filter((r) => {
      const userAssignment = getCurrentUserAssignment(r)
      return userAssignment && userAssignment.status === "completed"
    }).length,
    revision: assignedReports.filter((r) => hasRevisionRequest(r)).length,
  }

  const handleViewTask = (report) => {
    setSelectedTask(report)
  }

  const handleToggleTask = (taskIndex) => {
    if (!selectedTask) return

    const currentUserAssignment = selectedTask.assignments?.find(
      (assignment) => assignment.staffName === state.currentUser?.name,
    )

    if (!currentUserAssignment) return

    const task = currentUserAssignment.todoList[taskIndex]

    const updatedAssignments = selectedTask.assignments.map((assignment) => {
      if (assignment.staffName === state.currentUser?.name) {
        let updatedCompletedTasks
        if (assignment.completedTasks.includes(task)) {
          updatedCompletedTasks = assignment.completedTasks.filter((t) => t !== task)
        } else {
          updatedCompletedTasks = [...assignment.completedTasks, task]
        }

        const progress = Math.round((updatedCompletedTasks.length / assignment.todoList.length) * 100)

        return {
          ...assignment,
          completedTasks: updatedCompletedTasks,
          progress,
          status: progress === 100 ? "completed" : "in-progress",
          revisionNotes: assignment.status === "revision-requested" ? assignment.revisionNotes : undefined,
        }
      }
      return assignment
    })

    const totalProgress = updatedAssignments.reduce((sum, assignment) => sum + assignment.progress, 0)
    const overallProgress = Math.round(totalProgress / updatedAssignments.length)

    const updatedReport = {
      ...selectedTask,
      assignments: updatedAssignments,
      progress: overallProgress,
    }

    dispatch({ type: "UPDATE_REPORT", payload: updatedReport })
    setSelectedTask(updatedReport)
  }

  const handleSubmitWork = () => {
    if (!selectedTask) return

    const updatedWorkflow = [
      ...selectedTask.workflow,
      {
        id: `w${Date.now()}`,
        action: `Diselesaikan oleh ${state.currentUser?.name}`,
        user: state.currentUser?.name || "",
        timestamp: new Date().toISOString(),
        status: "completed",
      },
      {
        id: `w${Date.now() + 1}`,
        action: "Dalam Evaluasi Koordinator",
        user: selectedTask.currentHolder || "",
        timestamp: new Date().toISOString(),
        status: "in-progress",
      },
    ]

    const updatedReport = {
      ...selectedTask,
      workflow: updatedWorkflow,
    }

    dispatch({ type: "UPDATE_REPORT", payload: updatedReport })
    setSelectedTask(null)
    alert("Pekerjaan berhasil dikirim ke koordinator!")
  }

  const getTaskProgress = (report) => {
    const userAssignment = report.assignments?.find((assignment) => assignment.staffName === state.currentUser?.name)
    return userAssignment?.progress || 0
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Staff</h2>
          <p className="text-gray-600">Selesaikan tugas yang diberikan koordinator</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tugas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <CheckSquare className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dalam Proses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Tugas Saya ({assignedReports.length})</h3>
            </div>

            <div className="divide-y divide-gray-100">
              {assignedReports.map((report) => (
                <div key={report.id} className="p-6 hover:bg-gray-50">
                  {hasRevisionRequest(report) && (
                    <div className="mb-3 flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">Perlu Revisi</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{report.noSurat}</h4>
                    <span className="text-sm text-gray-500">{getTaskProgress(report)}% Selesai</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{report.hal}</p>

                  {report.attachments && report.attachments.length > 0 && (
                    <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs font-medium text-gray-700 mb-1">File Lampiran:</p>
                      <div className="flex flex-wrap gap-2">
                        {report.attachments.map((file, index) => (
                          <a
                            key={index}
                            href={`/api/download?url=${encodeURIComponent(file.url)}&filename=${encodeURIComponent(file.name)}`}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs bg-white px-2 py-1 rounded border"
                            title={`Download ${file.name}`}
                          >
                            <Download className="w-3 h-3" />
                            <span className="truncate max-w-24">{file.name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            hasRevisionRequest(report) ? "bg-red-500" : "bg-blue-600"
                          }`}
                          style={{ width: `${getTaskProgress(report)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{getTaskProgress(report)}%</span>
                    </div>
                    <button
                      onClick={() => handleViewTask(report)}
                      className={`flex items-center gap-2 px-3 py-1 text-sm rounded-lg transition-colors ${
                        hasRevisionRequest(report)
                          ? "text-red-600 hover:text-red-900 hover:bg-red-50"
                          : "text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      {hasRevisionRequest(report) ? "Revisi" : "Kerjakan"}
                    </button>
                  </div>
                </div>
              ))}
              {assignedReports.length === 0 && (
                <div className="p-6 text-center text-gray-500">Tidak ada tugas yang ditugaskan kepada Anda.</div>
              )}
            </div>
          </div>

          {selectedTask && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Detail Tugas</h2>
                <p className="text-sm text-gray-600">
                  {selectedTask.noSurat} - {selectedTask.hal}
                </p>
              </div>

              <div className="p-6">
                {selectedTask.originalFiles && selectedTask.originalFiles.length > 0 && (
                  <div className="mb-6">
                    <FileViewer files={selectedTask.originalFiles} title="Dokumen Asli dari TU" canDownload={true} />
                  </div>
                )}

                {getCurrentUserAssignment(selectedTask)?.status === "revision-requested" && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <h4 className="font-medium text-red-800">Permintaan Revisi dari Koordinator</h4>
                    </div>
                    <p className="text-red-700 text-sm mb-2">{getCurrentUserAssignment(selectedTask)?.revisionNotes}</p>
                    <p className="text-red-600 text-xs font-medium">
                      Silakan perbaiki tugas sesuai catatan di atas dan kerjakan ulang.
                    </p>
                    {getCurrentUserAssignment(selectedTask)?.revisionRequestedAt && (
                      <p className="text-red-500 text-xs mt-1">
                        Diminta pada:{" "}
                        {new Date(getCurrentUserAssignment(selectedTask).revisionRequestedAt).toLocaleString("id-ID")}
                      </p>
                    )}
                  </div>
                )}

                {getCurrentUserAssignment(selectedTask)?.needsRevision && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <h4 className="font-medium text-red-800">Perlu Revisi</h4>
                    </div>
                    <p className="text-red-700 text-sm">{getCurrentUserAssignment(selectedTask)?.revisionNotes}</p>
                    <p className="text-red-600 text-xs mt-2 font-medium">
                      Silakan perbaiki tugas sesuai catatan di atas dan kerjakan ulang.
                    </p>
                  </div>
                )}

                {getCurrentUserAssignment(selectedTask)?.revisionNotes &&
                  !getCurrentUserAssignment(selectedTask)?.needsRevision && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2">Catatan Revisi:</h4>
                      <p className="text-red-700 text-sm">{getCurrentUserAssignment(selectedTask)?.revisionNotes}</p>
                    </div>
                  )}

                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Daftar Tugas:</h4>
                  <div className="space-y-2">
                    {getCurrentUserAssignment(selectedTask)?.todoList.map((task, index) => {
                      const isCompleted = getCurrentUserAssignment(selectedTask)?.completedTasks.includes(task)
                      return (
                        <label key={index} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={() => handleToggleTask(index)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className={`${isCompleted ? "line-through text-gray-500" : "text-gray-900"}`}>
                            {task}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {getCurrentUserAssignment(selectedTask)?.notes && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Catatan Koordinator:</h4>
                    <p className="text-gray-700 text-sm">{getCurrentUserAssignment(selectedTask)?.notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          getCurrentUserAssignment(selectedTask)?.status === "revision-requested"
                            ? "bg-red-500"
                            : "bg-blue-600"
                        }`}
                        style={{ width: `${getTaskProgress(selectedTask)}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{getTaskProgress(selectedTask)}%</span>
                  </div>

                  {getTaskProgress(selectedTask) === 100 && (
                    <button
                      onClick={handleSubmitWork}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Kirim ke Koordinator
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {showProfileMenu && <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />}
    </div>
  )
}
