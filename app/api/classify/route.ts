import { NextRequest, NextResponse } from "next/server";
import { runClassification } from "../../../lib/openai";
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

    const output = await runClassification(userInput);

    return NextResponse.json({
      success: true,
      output,
    });
  } catch (error: any) {
    console.error("CLASSIFY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        errors: [error?.message || "Failed to classify input."],
      },
      { status: 500 }
    );
  }
}