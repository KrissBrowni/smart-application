import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  
  const inZukunft = new Date();
  inZukunft.setMonth(inZukunft.getMonth() + 1);

  const eintraege = await prisma.warteliste.findMany({
    where: {
      status: "wartet",
      endDatum: { gte: heute },
    },
    include: {
      patient: { select: { name: true, patientCode: true, telefonnummer: true } },
      terminart: { select: { name: true } },
    },
    orderBy: { erstelltAm: "asc" },
  });

  // Prüfen, ob kürzlich Termine frei geworden sind (heute abgesagt)
  const heuteAbgesagt = await prisma.termin.count({
    where: { status: "abgesagt", storniertAm: { gte: heute } },
  });

  return NextResponse.json({ eintraege, heuteAbgesagt });
}
