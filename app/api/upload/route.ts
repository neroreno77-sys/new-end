import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Upload API called")
    console.log("[v0] BLOB_READ_WRITE_TOKEN available:", !!process.env.BLOB_READ_WRITE_TOKEN)

    const formData = await request.formData()
    const file = formData.get("file") as File
    const reportId = formData.get("reportId") as string
    const uploadedBy = formData.get("uploadedBy") as string

    if (!file) {
      console.log("[v0] No file provided")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!reportId || !uploadedBy) {
      console.log("[v0] Missing reportId or uploadedBy")
      return NextResponse.json({ error: "Report ID and uploader information required" }, { status: 400 })
    }

    console.log("[v0] File details:", { name: file.name, size: file.size, type: file.type })

    // Create a unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const fileName = `${reportId}/${timestamp}-${file.name}`

    console.log("[v0] Attempting to upload to Blob:", fileName)

    let blob
    try {
      // First try with automatic token detection
      blob = await put(fileName, file, {
        access: "public",
      })
    } catch (blobError) {
      console.log("[v0] Blob upload failed with auto token:", blobError)

      // Fallback: try with explicit token if available
      const token =
        process.env.BLOB_READ_WRITE_TOKEN || "vercel_blob_rw_Px7XNMnyd4xVvZHX_OgsYRQtS1TAgii8NH4Gmlg1GNhzjBo"
      console.log("[v0] Trying with explicit token")

      blob = await put(fileName, file, {
        access: "public",
        token: token,
      })
    }

    console.log("[v0] Upload successful:", blob.url)

    // Return file attachment data matching our FileAttachment interface
    const fileAttachment = {
      id: crypto.randomUUID(),
      fileName: file.name,
      fileUrl: blob.url,
      uploadedAt: new Date().toISOString(),
      uploadedBy: uploadedBy,
      type: "original" as const,
    }

    return NextResponse.json(fileAttachment)
  } catch (error) {
    console.error("[v0] Upload error details:", error)
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
