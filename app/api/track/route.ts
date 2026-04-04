import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("TRACK EVENT:", body);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, errors: ["Tracking failed."] },
      { status: 500 }
    );
  }
}