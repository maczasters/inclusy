import { NextRequest, NextResponse } from "next/server";
import { deriveGuidanceFlags } from "@/lib/guidance/decisionFlags";
import { renderGuidance } from "@/lib/guidance/renderGuidance";
import { GuidanceInput } from "@/lib/guidance/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<GuidanceInput>;
    const userInput = (body.userInput ?? "").trim();

    if (!userInput) {
      return NextResponse.json(
        { error: "userInput is required." },
        { status: 400 }
      );
    }

    if (userInput.length > 4000) {
      return NextResponse.json(
        { error: "Input is too long." },
        { status: 400 }
      );
    }

    const flags = deriveGuidanceFlags({ userInput });
    const guidance = renderGuidance(flags);

    return NextResponse.json({
      ok: true,
      guidance,
      flags,
    });
  } catch (error) {
    console.error("Guidance route error:", error);
    return NextResponse.json(
      { error: "Failed to generate guidance." },
      { status: 500 }
    );
  }
}