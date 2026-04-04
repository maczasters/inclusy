import { NextRequest, NextResponse } from "next/server";
import { runClassification } from "../../../lib/openai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await runClassification(body.user_input);

    return NextResponse.json({
      success: true,
      classification: result,
    });
  } catch (error: any) {
    console.error("CLASSIFY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        errors: [error?.message || "Classification failed"],
      },
      { status: 500 }
    );
  }
}