"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface Profile {
  id: string
  name: string
  email: string
  role: string
  created_at: string
}

export default function UserRoleManager() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const supabase = createBrowserClient(
    "https://tfpleowwysvuaijbxmsl.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmcGxlb3d3eXN2dWFpamJ4bXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMjM1NjAsImV4cCI6MjA3MTc5OTU2MH0._42yCm4fr-1KS2Ud1-bYuYSrrPBEt0Uo4ekomI17dto",
  )

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching profiles:", error)
        return
      }

      setProfiles(data || [])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    setUpdating(userId)
    try {
      const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId)

      if (error) {
        console.error("Error updating role:", error)
        alert("Gagal mengupdate role: " + error.message)
        return
      }

      // Update local state
      setProfiles(profiles.map((profile) => (profile.id === userId ? { ...profile, role: newRole } : profile)))

      alert("Role berhasil diupdate!")
    } catch (error) {
      console.error("Error:", error)
      alert("Terjadi kesalahan saat mengupdate role")
    } finally {
      setUpdating(null)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-red-500"
      case "TU":
        return "bg-blue-500"
      case "Coordinator":
        return "bg-green-500"
      case "Staff":
        return "bg-gray-500"
      default:
        return "bg-gray-400"
    }
  }

  if (loading) {
    return <div className="p-4">Loading users...</div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>User Role Management</CardTitle>
          <p className="text-sm text-gray-600">Kelola role user untuk sistem tracking laporan</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profiles.map((profile) => (
              <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{profile.name}</h3>
                    <Badge className={`${getRoleBadgeColor(profile.role)} text-white`}>{profile.role}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{profile.email}</p>
                  <p className="text-xs text-gray-400">ID: {profile.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={profile.role}
                    onValueChange={(newRole) => updateUserRole(profile.id, newRole)}
                    disabled={updating === profile.id}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="TU">TU</SelectItem>
                      <SelectItem value="Coordinator">Coordinator</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  {updating === profile.id && <div className="text-sm text-blue-600">Updating...</div>}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Role Permissions:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                <strong>Admin:</strong> Full access to all features
              </li>
              <li>
                <strong>TU:</strong> Can create and manage reports
              </li>
              <li>
                <strong>Coordinator:</strong> Can create reports and assign tasks to staff
              </li>
              <li>
                <strong>Staff:</strong> Can work on assigned tasks
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
