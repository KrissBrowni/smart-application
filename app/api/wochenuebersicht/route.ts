import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const kw = parseInt(searchParams.get("kw") || "");
  const jahr = parseInt(searchParams.get("jahr") || "");

  if (!kw || !jahr) {
    return NextResponse.json({ error: "kw und jahr erforderlich (z.B. kw=27&jahr=2026)" }, { status: 400 });
  }

  // KW in Datumsbereich umrechnen (vereinfacht: KW 1 = erste Januarwoche)
  const firstJan = new Date(jahr, 0, 1);
  const dayOffset = (kw - 1) * 7 - firstJan.getDay() + 1;
  const montag = new Date(jahr, 0, 1 + dayOffset);
  const sonntag = new Date(montag);
  sonntag.setDate(montag.getDate() + 6);

  function toDateStr(d: Date): string {
    return d.toISOString().split("T")[0];
  }

  // Alle Termine in der Woche
  const termine = await prisma.termin.findMany({
    where: {
      datum: { gte: montag, lte: sonntag },
    },
    include: { terminart: { select: { name: true } } },
  });

  const gesamt = termine.length;
  const online = termine.filter((t) => t.buchungsweg === "online").length;
  const noShows = termine.filter((t) => t.status === "no_show").length;
  const wahrgenommen = termine.filter((t) => t.status === "wahrgenommen" || t.status === "no_show").length;

  // No-Show pro Arzt
  const aerzte = await prisma.arzt.findMany({ where: { aktiv: true } });
  const noShowProArzt: Record<string, number> = {};
  for (const arzt of aerzte) {
    const count = termine.filter((t) => t.arztId === arzt.id && t.status === "no_show").length;
    if (count > 0) noShowProArzt[arzt.name] = count;
  }

  // Offene Rezeptanfragen
  const offeneRezepte = await prisma.rezeptanfrage.count({
    where: { status: { in: ["eingegangen", "in_bearbeitung"] } },
  });

  // Akutslot-Auslastung
  const akutSlots = await prisma.terminSlot.findMany({
    where: {
      slotTyp: "akut",
      datum: { gte: montag, lte: sonntag },
    },
  });
  const akutGesamt = akutSlots.length;
  const akutBelegt = akutSlots.filter((s) => s.status === "belegt").length;

  // Tage mit Terminen
  const tageMitTerminen = new Set(termine.map((t) => toDateStr(new Date(t.datum)))).size;

  return NextResponse.json({
    kw,
    jahr,
    zeitraum: `${toDateStr(montag)} – ${toDateStr(sonntag)}`,
    kennzahlen: {
      termineGesamt: gesamt,
      termineProTag: tageMitTerminen > 0 ? (gesamt / tageMitTerminen).toFixed(1) : "0",
      onlineBuchungsquote: gesamt > 0 ? ((online / gesamt) * 100).toFixed(1) : "0",
      noShowRate: wahrgenommen > 0 ? ((noShows / wahrgenommen) * 100).toFixed(1) : "0",
      noShowProArzt,
      offeneRezeptanfragen: offeneRezepte,
      akutslotAuslastung: akutGesamt > 0 ? ((akutBelegt / akutGesamt) * 100).toFixed(1) : "0",
      akutSlotsGesamt: akutGesamt,
      akutSlotsBelegt: akutBelegt,
    },
  });
}
