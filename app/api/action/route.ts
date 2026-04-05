import { NextRequest, NextResponse } from "next/server";
import { runAction } from "../../../lib/openai";
import {
  containsBlockedContent,
  getClientIp,
  rateLimit,
} from "../../../lib/security";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function findBlockedText(value: unknown): boolean {
  if (typeof value === "string") {
    return containsBlockedContent(value);
  }

  if (Array.isArray(value)) {
    return value.some(findBlockedText);
  }

  if (isPlainObject(value)) {
    return Object.values(value).some(findBlockedText);
  }

  return false;
}

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

    if (!isPlainObject(body)) {
      return NextResponse.json(
        {
          success: false,
          errors: ["Invalid request body."],
        },
        { status: 400 }
      );
    }

    if (findBlockedText(body)) {
      return NextResponse.json(
        {
          success: false,
          errors: ["Request could not be processed."],
        },
        { status: 400 }
      );
    }

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