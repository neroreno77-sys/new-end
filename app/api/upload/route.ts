import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const reportId = formData.get("reportId") as string
    const uploadedBy = formData.get("uploadedBy") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!reportId || !uploadedBy) {
      return NextResponse.json({ error: "Report ID and uploader information required" }, { status: 400 })
    }

    // Create a unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const fileName = `${reportId}/${timestamp}-${file.name}`

    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: "public",
    })

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
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
