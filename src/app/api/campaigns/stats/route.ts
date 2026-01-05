import { NextResponse } from "next/server";
import { getQueueStats } from "@/lib/queue";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    // Verify authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const stats = await getQueueStats();

    return NextResponse.json({
      success: true,
      queues: stats,
    });
  } catch (error) {
    console.error("Queue stats error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get queue stats" },
      { status: 500 }
    );
  }
}
