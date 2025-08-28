"use client"

import { useState, useEffect } from "react"
import { useApp } from "../../context/AppContext"
import { Plus, Edit, Trash2, Users, FileText, Clock, LogOut } from "lucide-react"
import { UserForm } from "../forms/UserForm"
import { createClient } from "../../../lib/supabase/client"

export function AdminDashboard() {
  const { state, dispatch } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [loading, setLoading] = useState(false)
  const [supabaseUsers, setSupabaseUsers] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date())

  const supabase = createClient()

  useEffect(() => {
    loadUsersFromDatabase()
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

  const loadUsersFromDatabase = async () => {
    try {
      setLoading(true)

      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading users:", error)
        return
      }

      const mappedProfiles =
        profiles?.map((profile) => ({
          ...profile,
          id: profile.user_id || profile.id,
          supabase_id: profile.id,
        })) || []

      setSupabaseUsers(mappedProfiles)
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = () => {
    setEditingUser(null)
    setShowForm(true)
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setShowForm(true)
  }

  const handleDeleteUser = async (userId) => {
    if (confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
      try {
        setLoading(true)

        const userToDelete = allUsers.find((u) => u.supabase_id === userId || u.id === userId)

        if (!userToDelete) {
          alert("Pengguna tidak ditemukan")
          return
        }

        if (userToDelete.supabase_id) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userToDelete.supabase_id)
            .single()

          if (profileError) {
            console.error("Error finding user profile:", profileError)
            alert("Gagal menemukan data pengguna: " + profileError.message)
            return
          }

          console.log("[v0] Attempting to delete user from auth with ID:", profile.id)

          const { error: profileDeleteError } = await supabase
            .from("profiles")
            .delete()
            .eq("id", userToDelete.supabase_id)

          if (profileDeleteError) {
            console.error("Error deleting user profile:", profileDeleteError)
            alert("Gagal menghapus profil pengguna: " + profileDeleteError.message)
            return
          }

          try {
            const { error: authError } = await supabase.auth.admin.deleteUser(profile.id)

            if (authError) {
              console.error("Error deleting user from auth:", authError)
              console.log("[v0] Auth deletion failed, but profile was deleted successfully")
              alert(
                "Pengguna dihapus dari database, tetapi mungkin masih ada di sistem autentikasi. Silakan hapus manual dari Supabase dashboard jika diperlukan.",
              )
            } else {
              console.log("[v0] User successfully deleted from both profile and auth")
              alert("Pengguna berhasil dihapus dari sistem dan autentikasi")
            }
          } catch (authDeleteError) {
            console.error("Auth deletion error:", authDeleteError)
            alert(
              "Pengguna dihapus dari database, tetapi gagal dihapus dari sistem autentikasi. Silakan hapus manual dari Supabase dashboard.",
            )
          }

          dispatch({ type: "DELETE_USER", payload: userToDelete.id })
          await loadUsersFromDatabase()
        } else {
          dispatch({ type: "DELETE_USER", payload: userToDelete.id })
          alert("Pengguna berhasil dihapus dari sistem")
        }
      } catch (error) {
        console.error("Error deleting user:", error)
        alert("Gagal menghapus pengguna")
      } finally {
        setLoading(false)
      }
    }
  }

  const handleFormSubmit = async (userData) => {
    try {
      setLoading(true)

      if (editingUser) {
        if (editingUser.supabase_id) {
          const { error } = await supabase
            .from("profiles")
            .update({
              name: userData.name,
              role: userData.role,
              updated_at: new Date().toISOString(),
            })
            .eq("id", editingUser.supabase_id)

          if (error) {
            console.error("Error updating user:", error)
            alert("Gagal mengupdate pengguna: " + error.message)
            return
          }

          if (userData.password && userData.password.trim() !== "") {
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", editingUser.supabase_id)
              .single()

            if (profileError) {
              console.error("Error getting user profile for password update:", profileError)
              alert("Gagal mendapatkan data pengguna untuk update password: " + profileError.message)
              return
            }

            const { error: passwordError } = await supabase.auth.admin.updateUserById(profile.id, {
              password: userData.password,
            })

            if (passwordError) {
              console.error("Error updating password:", passwordError)
              alert("Gagal mengupdate password: " + passwordError.message)
              return
            }
          }

          await loadUsersFromDatabase()
          alert("Pengguna berhasil diupdate" + (userData.password ? " (termasuk password)" : ""))
        } else {
          dispatch({ type: "UPDATE_USER", payload: { ...userData, id: editingUser.id } })
          alert("Pengguna berhasil diupdate")
        }
      } else {
        const originalUserId = userData.id

        const { data: existingProfile, error: checkError } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("user_id", originalUserId)
          .single()

        if (checkError && checkError.code !== "PGRST116") {
          console.error("Error checking existing user:", checkError)
          alert("Gagal memeriksa pengguna yang sudah ada: " + checkError.message)
          return
        }

        if (existingProfile) {
          alert(`ID Pengguna "${originalUserId}" sudah digunakan. Silakan gunakan ID yang berbeda.`)
          return
        }

        const sanitizedId = userData.id
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .substring(0, 50)

        const email = `${sanitizedId}@sitrack.gov.id`

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email,
          password: userData.password,
          options: {
            data: {
              name: userData.name,
              role: userData.role,
            },
          },
        })

        if (authError) {
          console.error("Error creating user:", authError)
          if (authError.message.includes("already registered")) {
            alert(
              `Email ${email} sudah terdaftar. ID Pengguna "${originalUserId}" mungkin sudah digunakan. Silakan gunakan ID yang berbeda.`,
            )
          } else {
            alert("Gagal membuat pengguna: " + authError.message)
          }
          return
        }

        if (authData.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ user_id: originalUserId })
            .eq("id", authData.user.id)

          if (profileError) {
            console.error("Error updating profile with user_id:", profileError)
            await supabase.auth.admin.deleteUser(authData.user.id)
            alert("Gagal menyimpan data profil pengguna. Silakan coba lagi.")
            return
          }
        }

        dispatch({ type: "ADD_USER", payload: { ...userData, id: originalUserId } })
        alert("Pengguna berhasil ditambahkan")
      }

      await loadUsersFromDatabase()
      setShowForm(false)
      setEditingUser(null)
    } catch (error) {
      console.error("Error saving user:", error)
      alert("Gagal menyimpan pengguna")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" })
  }

  const allUsers = [...state.users, ...supabaseUsers.filter((su) => !state.users.find((u) => u.id === su.id))]

  const stats = {
    totalUsers: allUsers.length,
    adminUsers: allUsers.filter((u) => u.role === "Admin").length,
    tuUsers: allUsers.filter((u) => u.role === "TU").length,
    coordinatorUsers: allUsers.filter((u) => u.role === "Koordinator").length,
    staffUsers: allUsers.filter((u) => u.role === "Staff").length,
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
        <div className="grid grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <Users className="w-6 h-6 text-gray-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Admin</p>
                <p className="text-3xl font-bold text-red-600">{stats.adminUsers}</p>
              </div>
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Koordinator</p>
                <p className="text-3xl font-bold text-blue-600">{stats.coordinatorUsers}</p>
              </div>
              <div className="w-6 h-6">
                <svg viewBox="0 0 24 24" className="w-full h-full text-blue-500">
                  <path fill="currentColor" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Tata Usaha</p>
                <p className="text-3xl font-bold text-green-600">{stats.tuUsers}</p>
              </div>
              <FileText className="w-6 h-6 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Staff</p>
                <p className="text-3xl font-bold text-gray-900">{stats.staffUsers}</p>
              </div>
              <Users className="w-6 h-6 text-gray-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Manajemen User</h3>
              <button
                onClick={handleAddUser}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Tambah User
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Username</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Nama</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Role</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Dibuat</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Login Terakhir</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-600 text-sm">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((user) => (
                  <tr key={user.supabase_id || user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{user.id}</td>
                    <td className="py-4 px-6 text-sm text-gray-900">{user.name}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 inline-flex text-xs font-medium rounded-full ${
                          user.role === "Admin"
                            ? "bg-red-100 text-red-800"
                            : user.role === "TU"
                              ? "bg-gray-100 text-gray-800"
                              : user.role === "Koordinator"
                                ? "bg-gray-900 text-white"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role === "Admin" ? "Administrator" : user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString("id-ID") : "01/01/2024"}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          disabled={loading}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Edit Pengguna"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.supabase_id || user.id)}
                          disabled={loading}
                          className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {allUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      Belum ada pengguna yang terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )}

      {showForm && (
        <UserForm
          user={editingUser}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false)
            setEditingUser(null)
          }}
          loading={loading}
        />
      )}
    </div>
  )
}
