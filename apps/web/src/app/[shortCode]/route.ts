import { NextResponse } from "next/server";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export async function GET(context: { params: Promise<{ shortCode: string }> }) {
    const { shortCode } = await context.params;

    const redirectTarget = `${API_BASE_URL}/${encodeURIComponent(shortCode)}`;
    return NextResponse.redirect(redirectTarget, { status: 307 });
}
