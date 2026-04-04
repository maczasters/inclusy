import { NextRequest, NextResponse } from "next/server";
import { runGuidance } from "../../../lib/openai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const guidance = await runGuidance(body);

    return NextResponse.json({
      success: true,
      guidance,
    });
  } catch (error: any) {
    console.error("GUIDANCE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        errors: [error?.message || "Failed to generate guidance."],
      },
      { status: 500 }
    );
  }
}