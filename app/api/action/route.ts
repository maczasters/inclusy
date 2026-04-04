import { NextRequest, NextResponse } from "next/server";
import { runAction } from "../../../lib/openai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const output = await runAction(body);

    return NextResponse.json({
      success: true,
      output,
    });
  } catch (error: any) {
    console.error("ACTION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        errors: [error?.message || "Failed to generate action output."],
      },
      { status: 500 }
    );
  }
}