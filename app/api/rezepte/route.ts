import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const anfragen = await prisma.rezeptanfrage.findMany({
    include: {
      patient: { select: { id: true, name: true, geburtsdatum: true } },
      bearbeiter: { select: { id: true, name: true } },
      freigeber: { select: { id: true, name: true } },
    },
    orderBy: { angefragtAm: "desc" },
  });

  return NextResponse.json({ anfragen });
}
