import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] === REPORT CREATION DEBUG START ===")
    console.log("[v0] Environment check:")
    console.log("[v0] - NODE_ENV:", process.env.NODE_ENV)
    console.log("[v0] - Request URL:", request.url)
    console.log("[v0] - Request headers:", Object.fromEntries(request.headers.entries()))

    const reportData = await request.json()
    console.log("[v0] Report data received:", reportData)
    const { originalFiles, ...reportFields } = reportData

    const cookieStore = cookies()
    console.log("[v0] Cookie store created")

    const supabase = createServerClient(cookieStore)
    console.log("[v0] Supabase client created")

    console.log("[v0] Attempting to get authenticated user...")
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("[v0] Auth result:")
    console.log("[v0] - User:", user ? { id: user.id, email: user.email } : null)
    console.log("[v0] - Auth error:", authError)

    if (authError || !user) {
      console.error("[v0] Authentication failed - returning 401")
      return NextResponse.json(
        {
          error: "Unauthorized",
          details: authError?.message || "No user found",
          debug: "Authentication failed in local environment",
        },
        { status: 401 },
      )
    }

    console.log("[v0] Authenticated user ID:", user.id)

    console.log("[v0] Fetching user profile...")
    let { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    console.log("[v0] Profile query result:")
    console.log("[v0] - Profile:", profile)
    console.log("[v0] - Profile error:", profileError)

    if (profileError || !profile) {
      console.log("[v0] Profile not found, creating new profile for user:", user.id)

      // Try to create missing profile
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          name: user.email?.split("@")[0] || "User",
          role: "Staff", // Default role
        })
        .select("role")
        .single()

      console.log("[v0] Profile creation result:")
      console.log("[v0] - New profile:", newProfile)
      console.log("[v0] - Creation error:", createError)

      if (createError) {
        console.error("[v0] Error creating profile:", createError)
        return NextResponse.json(
          {
            error: "User profile could not be created",
            details: createError.message,
            debug: "Profile creation failed",
          },
          { status: 403 },
        )
      }

      profile = newProfile
      console.log("[v0] Created new profile with role:", profile.role)
    }

    console.log("[v0] User profile found with role:", profile.role)

    const allowedRoles = ["TU", "Admin", "Coordinator", "Koordinator"]
    console.log("[v0] Checking role authorization...")
    console.log("[v0] - User role:", profile.role)
    console.log("[v0] - Allowed roles:", allowedRoles)
    console.log("[v0] - Role allowed:", allowedRoles.includes(profile.role))

    if (!allowedRoles.includes(profile.role)) {
      console.error("[v0] Role authorization failed")
      return NextResponse.json(
        {
          error: "Only TU, Admin, and Coordinator can create reports",
          details: `Current role: ${profile.role}`,
          debug: "Role authorization failed",
        },
        { status: 403 },
      )
    }

    // Generate tracking number
    const trackingNumber = `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const validStatuses = ["draft", "in-progress", "completed", "revision-required", "forwarded-to-tu"]
    const status = validStatuses.includes(reportFields.status) ? reportFields.status : "draft"

    const validPriorities = ["rendah", "sedang", "tinggi"]
    const priority = validPriorities.includes(reportFields.priority) ? reportFields.priority : "sedang"

    console.log("[v0] Attempting to create report with user ID:", user.id)

    const { data: report, error: reportError } = await supabase
      .from("reports")
      .insert({
        no_surat: reportFields.noSurat,
        hal: reportFields.hal,
        layanan: reportFields.layanan,
        dari: reportFields.dari,
        tanggal_surat: reportFields.tanggalSurat,
        tanggal_agenda: reportFields.tanggalAgenda,
        status: status,
        priority: priority,
        created_by: user.id, // Use real authenticated user UUID
        current_holder: user.id, // Use real authenticated user UUID
      })
      .select()
      .single()

    console.log("[v0] Report creation result:")
    console.log("[v0] - Report:", report)
    console.log("[v0] - Report error:", reportError)

    if (reportError) {
      console.error("[v0] Error creating report:", reportError)
      return NextResponse.json(
        {
          error: "Failed to create report",
          details: reportError.message,
          debug: "Database insert failed",
        },
        { status: 500 },
      )
    }

    console.log("[v0] Report created successfully:", report.id)
    console.log("[v0] === REPORT CREATION DEBUG END ===")

    // Insert file attachments if any
    if (originalFiles && originalFiles.length > 0) {
      const fileAttachments = originalFiles.map((file: any) => ({
        report_id: report.id,
        file_name: file.fileName,
        file_url: file.fileUrl,
        file_type: "original",
        file_size: file.size || null,
        uploaded_by: user.id, // Use real authenticated user UUID
      }))

      const { error: filesError } = await supabase.from("file_attachments").insert(fileAttachments)

      if (filesError) {
        console.error("Error saving file attachments:", filesError)
        return NextResponse.json({ error: "Failed to save file attachments" }, { status: 500 })
      }
    }

    // Create workflow history entry
    const { error: workflowError } = await supabase.from("workflow_history").insert({
      report_id: report.id,
      action: "Laporan dibuat",
      user_id: user.id, // Use real authenticated user UUID
      status: status,
      notes: `Laporan baru dibuat oleh ${profile.role}`,
    })

    if (workflowError) {
      console.error("Error creating workflow history:", workflowError)
    }

    const { data: tracking } = await supabase
      .from("letter_tracking")
      .select("tracking_number")
      .eq("report_id", report.id)
      .single()

    return NextResponse.json({
      success: true,
      report: {
        ...report,
        trackingNumber: tracking?.tracking_number || `TRK-${report.id.slice(0, 8)}`,
      },
    })
  } catch (error) {
    console.error("[v0] Error in report creation:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        debug: "Unexpected error occurred",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    const { data: reports, error: reportsError } = await supabase
      .from("reports")
      .select(`
        *,
        file_attachments (*),
        letter_tracking (*),
        profiles!reports_created_by_fkey (name, role)
      `)
      .order("created_at", { ascending: false })

    if (reportsError) {
      console.error("Error fetching reports:", reportsError)
      return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
    }

    return NextResponse.json({ reports })
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
