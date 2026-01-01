import { NextResponse } from "next/server";
import { getQueueStats } from "@/lib/queue";

export async function GET() {
  try {
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
