import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

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

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get("report_id")
    const staffId = searchParams.get("staff_id")

    let query = supabase.from("task_assignments").select(`
        *,
        report:reports(id, no_surat, hal, layanan),
        staff:profiles!staff_id(id, name, role),
        coordinator:profiles!coordinator_id(id, name, role)
      `)

    // Apply filters based on role and parameters
    if (profile.role === "Staff") {
      query = query.eq("staff_id", user.id)
    } else if (profile.role === "Koordinator") {
      query = query.eq("coordinator_id", user.id)
    }

    if (reportId) {
      query = query.eq("report_id", reportId)
    }

    if (staffId) {
      query = query.eq("staff_id", staffId)
    }

    const { data: assignments, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching task assignments:", error)
      return NextResponse.json({ error: "Failed to fetch task assignments" }, { status: 500 })
    }

    return NextResponse.json({ assignments })
  } catch (error) {
    console.error("Task assignments API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Only coordinators and admins can create task assignments
    if (!["Koordinator", "Admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const { report_id, staff_id, todo_list, notes } = body

    if (!report_id || !staff_id || !todo_list) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify the report exists and user has access
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("id, current_holder")
      .eq("id", report_id)
      .single()

    if (reportError || !report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    // Create task assignment
    const { data: assignment, error: insertError } = await supabase
      .from("task_assignments")
      .insert({
        report_id,
        staff_id,
        coordinator_id: user.id,
        todo_list: JSON.stringify(todo_list),
        completed_tasks: JSON.stringify([]),
        progress: 0,
        status: "pending",
        notes,
      })
      .select(`
        *,
        report:reports(id, no_surat, hal, layanan),
        staff:profiles!staff_id(id, name, role),
        coordinator:profiles!coordinator_id(id, name, role)
      `)
      .single()

    if (insertError) {
      console.error("Error creating task assignment:", insertError)
      return NextResponse.json({ error: "Failed to create task assignment" }, { status: 500 })
    }

    // Update report current holder to the assigned staff
    await supabase.from("reports").update({ current_holder: staff_id }).eq("id", report_id)

    // Add workflow history entry
    await supabase.from("workflow_history").insert({
      report_id,
      action: `Task assigned to staff`,
      user_id: user.id,
      status: "assigned",
      notes: `Assigned to staff with ${todo_list.length} tasks`,
    })

    return NextResponse.json({ assignment })
  } catch (error) {
    console.error("Task assignment creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
