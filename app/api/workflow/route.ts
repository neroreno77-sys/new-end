import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { report_id, action, status, notes, next_holder_id } = body

    if (!report_id || !action || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify the report exists and user has access
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("id, current_holder, created_by")
      .eq("id", report_id)
      .single()

    if (reportError || !report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    // Add workflow history entry
    const { data: workflowEntry, error: workflowError } = await supabase
      .from("workflow_history")
      .insert({
        report_id,
        action,
        user_id: user.id,
        status,
        notes,
      })
      .select()
      .single()

    if (workflowError) {
      console.error("Error creating workflow entry:", workflowError)
      return NextResponse.json({ error: "Failed to create workflow entry" }, { status: 500 })
    }

    // Update report current holder if specified
    if (next_holder_id) {
      await supabase.from("reports").update({ current_holder: next_holder_id }).eq("id", report_id)
    }

    // Update report status based on workflow action
    let newReportStatus = null
    if (action.includes("Selesai") || status === "completed") {
      newReportStatus = "completed"
    } else if (action.includes("Revisi") || status === "revision-required") {
      newReportStatus = "revision-required"
    } else if (action.includes("Proses") || status === "in-progress") {
      newReportStatus = "in-progress"
    }

    if (newReportStatus) {
      await supabase.from("reports").update({ status: newReportStatus }).eq("id", report_id)
    }

    return NextResponse.json({ workflow: workflowEntry })
  } catch (error) {
    console.error("Workflow API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get("report_id")

    if (!reportId) {
      return NextResponse.json({ error: "Report ID is required" }, { status: 400 })
    }

    // Get workflow history for the report
    const { data: workflow, error } = await supabase
      .from("workflow_history")
      .select(`
        *,
        user:profiles!user_id(id, name, role)
      `)
      .eq("report_id", reportId)
      .order("timestamp", { ascending: true })

    if (error) {
      console.error("Error fetching workflow history:", error)
      return NextResponse.json({ error: "Failed to fetch workflow history" }, { status: 500 })
    }

    return NextResponse.json({ workflow })
  } catch (error) {
    console.error("Workflow history API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
