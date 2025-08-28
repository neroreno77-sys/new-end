import { useApp } from "../../context/AppContext"

export function AuthStatus() {
  const { state } = useApp()

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg z-50">
      <h3 className="font-semibold text-sm mb-2">Status Autentikasi:</h3>
      {state.isAuthenticated ? (
        <div className="text-green-600">
          <p className="text-sm">✅ Sudah Login</p>
          <p className="text-xs">User: {state.currentUser?.name}</p>
          <p className="text-xs">Role: {state.currentUser?.role}</p>
        </div>
      ) : (
        <div className="text-red-600">
          <p className="text-sm">❌ Belum Login</p>
          <p className="text-xs">Silakan login terlebih dahulu</p>
        </div>
      )}
    </div>
  )
}
