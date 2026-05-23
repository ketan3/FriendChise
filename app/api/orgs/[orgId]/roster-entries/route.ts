/**
 * GET /api/orgs/[orgId]/roster-entries?weeks=<ISO>,<ISO>,...
 *
 * Returns RosterEntry rows for the requested week-start dates.
 * Accepts up to 20 weeks per request.
 */
import { NextResponse } from "next/server";
import { requireOrgMember } from "@/lib/authz";
import { getRosterEntries } from "@/lib/services/roster";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const { orgId } = await params;

  const authz = await requireOrgMember(orgId);
  if (!authz.ok) return authz.response;

  const { searchParams } = new URL(req.url);
  const weeksParam = searchParams.get("weeks") ?? "";
  const weekStarts = weeksParam
    .split(",")
    .filter(Boolean)
    .slice(0, 20) // safety cap
    .map((s) => new Date(s))
    .filter((d) => !isNaN(d.getTime()));

  if (weekStarts.length === 0) {
    return NextResponse.json([]);
  }

  const entries = await getRosterEntries(orgId, weekStarts);
  return NextResponse.json(entries);
}
