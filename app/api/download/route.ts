import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileUrl = searchParams.get("url")
    const fileName = searchParams.get("fileName")

    if (!fileUrl) {
      return NextResponse.json({ error: "File URL required" }, { status: 400 })
    }

    // Fetch the file from Vercel Blob
    const response = await fetch(fileUrl)

    if (!response.ok) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const fileBuffer = await response.arrayBuffer()

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName || "download"}"`,
        "Content-Length": fileBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}
