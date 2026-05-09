import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.password === process.env.APP_ACCESS_PASSWORD) {
      return NextResponse.json({ success: true, authorized: true });
    }

    return NextResponse.json({ success: true, authorized: false });
 } catch (error: unknown) {
  console.error("PASSWORD AUTH ERROR:", error);

  return NextResponse.json(
    { success: false, error: "Invalid password." },
    { status: 401 }
  );
 }
}