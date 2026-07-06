import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  const heuteStr = heute.toISOString().split("T")[0];

  // Termine heute
  const termineHeute = await prisma.termin.count({
    where: { datum: heute, status: { notIn: ["abgesagt", "arzt_ausfall_betroffen"] } },
  });

  // Offene Rezeptanfragen
  const offeneRezepte = await prisma.rezeptanfrage.count({
    where: { status: { in: ["eingegangen", "in_bearbeitung"] } },
  });

  // Freie Akutslots heute
  const freieAkutslots = await prisma.terminSlot.count({
    where: { datum: heute, slotTyp: "akut", status: "frei" },
  });

  // Warteliste
  const warteliste = await prisma.warteliste.count({
    where: { status: "wartet", endDatum: { gte: heute } },
  });

  // No-Shows diese Woche
  const wochenstart = new Date(heute);
  wochenstart.setDate(wochenstart.getDate() - wochenstart.getDay() + 1);
  const noShowDieseWoche = await prisma.termin.count({
    where: {
      datum: { gte: wochenstart },
      status: "no_show",
    },
  });

  // Aktive Sperren
  const aktiveSperren = await prisma.patientensperre.count({
    where: { status: "aktiv" },
  });

  // Heutige Termine als Liste
  const termineListe = await prisma.termin.findMany({
    where: { datum: heute, status: { notIn: ["abgesagt", "arzt_ausfall_betroffen"] } },
    include: {
      patient: { select: { name: true } },
      terminart: { select: { name: true } },
      arzt: { select: { name: true } },
    },
    orderBy: { startzeit: "asc" },
  });

  return NextResponse.json({
    kacheln: {
      termineHeute,
      offeneRezepte,
      freieAkutslots,
      warteliste,
      noShowDieseWoche,
      aktiveSperren,
    },
    termine: termineListe,
    datum: heuteStr,
  });
}
