import { NextRequest, NextResponse } from "next/server";
import { runFollowup } from "../../../lib/openai";
import {
  containsBlockedContent,
  getClientIp,
  rateLimit,
  validateUserText,
} from "../../../lib/security";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const limit = rateLimit(ip);

    if (!limit.allowed) {
      return NextResponse.json(
        {
          success: false,
          errors: [
            `Too many requests. Try again in ${limit.retryAfterSeconds} seconds.`,
          ],
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(limit.retryAfterSeconds),
          },
        }
      );
    }

    const body = await req.json();
    const userInput = body?.userInput;
    const classification = body?.classification;

    const validationError = validateUserText(userInput);
    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          errors: [validationError],
        },
        { status: 400 }
      );
    }

    if (containsBlockedContent(userInput)) {
      return NextResponse.json(
        {
          success: false,
          errors: ["Request could not be processed."],
        },
        { status: 400 }
      );
    }

    if (
      typeof classification !== "object" ||
      classification === null ||
      Array.isArray(classification)
    ) {
      return NextResponse.json(
        {
          success: false,
          errors: ["Invalid classification payload."],
        },
        { status: 400 }
      );
    }

    const output = await runFollowup(userInput, classification);

    return NextResponse.json({
      success: true,
      output,
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