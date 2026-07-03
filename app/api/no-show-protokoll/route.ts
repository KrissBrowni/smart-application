import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ereignisse = await prisma.noShowEreignis.findMany({
    include: {
      patient: { select: { id: true, name: true, patientCode: true } },
      termin: { select: { datum: true, startzeit: true, terminart: { select: { name: true } } } },
    },
    orderBy: { erfasstAm: "desc" },
    take: 100,
  });

  return NextResponse.json({ ereignisse });
}
