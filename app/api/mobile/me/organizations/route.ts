import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/authz/_shared";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ organizations: [] }, { status: 401 });
  }

  const memberships = await prisma.membership.findMany({
    where: { userId },
    orderBy: { organization: { name: "asc" } },
    select: {
      organization: {
        select: { id: true, name: true },
      },
    },
  });

  return NextResponse.json({
    organizations: memberships
      .map((membership) => membership.organization)
      .filter((organization): organization is NonNullable<typeof organization> => organization !== null),
  });
}