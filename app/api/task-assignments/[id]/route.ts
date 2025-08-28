import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const { completed_tasks, progress, status, revision_notes } = body

    // Get current assignment to verify access
    const { data: currentAssignment, error: fetchError } = await supabase
      .from("task_assignments")
      .select("*, report:reports(id, no_surat)")
      .eq("id", params.id)
      .single()

    if (fetchError || !currentAssignment) {
      return NextResponse.json({ error: "Task assignment not found" }, { status: 404 })
    }

    // Check if user has permission to update this assignment
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    const canUpdate =
      currentAssignment.staff_id === user.id || // Staff can update their own assignments
      currentAssignment.coordinator_id === user.id || // Coordinator can update assignments they created
      profile?.role === "Admin" // Admin can update any assignment

    if (!canUpdate) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Prepare update data
    const updateData: any = {}

    if (completed_tasks !== undefined) {
      updateData.completed_tasks = JSON.stringify(completed_tasks)
    }

    if (progress !== undefined) {
      updateData.progress = progress
    }

    if (status !== undefined) {
      updateData.status = status

      // Set completion timestamp if status is completed
      if (status === "completed") {
        updateData.completed_at = new Date().toISOString()
      }
    }

    if (revision_notes !== undefined) {
      updateData.revision_notes = revision_notes
    }

    updateData.updated_at = new Date().toISOString()

    // Update task assignment
    const { data: updatedAssignment, error: updateError } = await supabase
      .from("task_assignments")
      .update(updateData)
      .eq("id", params.id)
      .select(`
        *,
        report:reports(id, no_surat, hal, layanan),
        staff:profiles!staff_id(id, name, role),
        coordinator:profiles!coordinator_id(id, name, role)
      `)
      .single()

    if (updateError) {
      console.error("Error updating task assignment:", updateError)
      return NextResponse.json({ error: "Failed to update task assignment" }, { status: 500 })
    }

    // Add workflow history entry for significant status changes
    if (status && ["completed", "revision-required"].includes(status)) {
      const action = status === "completed" ? `Task completed by staff` : `Revision requested for task`

      await supabase.from("workflow_history").insert({
        report_id: currentAssignment.report_id,
        action,
        user_id: user.id,
        status,
        notes: revision_notes || `Task status changed to ${status}`,
      })
    }

    return NextResponse.json({ assignment: updatedAssignment })
  } catch (error) {
    console.error("Task assignment update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Only coordinators and admins can delete task assignments
    if (!["Koordinator", "Admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Get assignment details before deletion
    const { data: assignment, error: fetchError } = await supabase
      .from("task_assignments")
      .select("report_id, staff:profiles!staff_id(name)")
      .eq("id", params.id)
      .single()

    if (fetchError || !assignment) {
      return NextResponse.json({ error: "Task assignment not found" }, { status: 404 })
    }

    // Delete task assignment
    const { error: deleteError } = await supabase.from("task_assignments").delete().eq("id", params.id)

    if (deleteError) {
      console.error("Error deleting task assignment:", deleteError)
      return NextResponse.json({ error: "Failed to delete task assignment" }, { status: 500 })
    }

    // Add workflow history entry
    await supabase.from("workflow_history").insert({
      report_id: assignment.report_id,
      action: `Task assignment removed`,
      user_id: user.id,
      status: "unassigned",
      notes: `Task assignment for ${assignment.staff?.name} was removed`,
    })

    return NextResponse.json({ message: "Task assignment deleted successfully" })
  } catch (error) {
    console.error("Task assignment deletion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
