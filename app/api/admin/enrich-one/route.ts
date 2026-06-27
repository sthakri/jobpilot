import { NextRequest, NextResponse } from "next/server";
import { enrichDescription } from "@/lib/job-enrichment";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { snippet, title, company, location } = body;

    if (!snippet || !title || !company) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: snippet, title, company" },
        { status: 400 },
      );
    }

    const enriched = await enrichDescription(snippet, title, company, location ?? "");

    if (!enriched) {
      return NextResponse.json(
        { success: false, error: "NIM enrichment returned nothing" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: enriched });
  } catch (err) {
    console.error("[enrich-one]", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
