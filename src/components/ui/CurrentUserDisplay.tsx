"use client"

import { useContext } from "react"
import { AppContext } from "@/src/context/AppContext"
import { Card, CardContent } from "@/components/ui/card"
import { User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CurrentUserDisplay() {
  const { currentUser, logout } = useContext(AppContext)

  if (!currentUser) return null

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardContent className="p-4">
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
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
