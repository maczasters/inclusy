import { NextRequest, NextResponse } from "next/server";
import { runFollowup } from "../../../lib/openai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await runFollowup(body.user_input, body.classification);

    return NextResponse.json({
      success: true,
      questions: result.questions || [],
    });
  } catch (error: any) {
    console.error("FOLLOWUP ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        errors: [error?.message || "Failed to generate follow-up questions."],
      },
      { status: 500 }
    );
  }
}