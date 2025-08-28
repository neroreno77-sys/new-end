"use client"

import { StrictMode } from "react"
import App from "../src/App"
import { AppProvider } from "../src/context/AppContext"

export default function Page() {
  return (
    <StrictMode>
      <AppProvider>
        <App />
      </AppProvider>
    </StrictMode>
  )
}
