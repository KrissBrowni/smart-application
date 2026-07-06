import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const datum = searchParams.get("datum");
  const arztId = searchParams.get("arztId");
  const patientCode = searchParams.get("patientCode");

  if (!datum) {
    return NextResponse.json({ error: "Datum erforderlich (YYYY-MM-DD)" }, { status: 400 });
  }

  const selectedDate = new Date(datum + "T00:00:00Z");
  const tag = selectedDate.getUTCDay(); // 0=Sonntag, 6=Samstag
  const isWeekend = tag === 0 || tag === 6;

  // Prüfen auf Praxisschließung
  const schliessung = await prisma.abwesenheitsereignis.findFirst({
    where: {
      betrifftGanzePraxis: true,
      startDatum: { lte: selectedDate },
      endDatum: { gte: selectedDate },
    },
  });

  if (schliessung) {
    return NextResponse.json({
      verfuegbar: false,
      termine: [],
      grund: `Praxis geschlossen: ${schliessung.grund || "Praxisschließung"}`,
    });
  }

  if (isWeekend) {
    return NextResponse.json({ verfuegbar: false, termine: [], grund: "Wochenende" });
  }

  // Ärzte laden
  const aerzte = arztId
    ? await prisma.arzt.findMany({ where: { id: parseInt(arztId), aktiv: true }, include: { sprechzeiten: true, abwesenheiten: { where: { startDatum: { lte: selectedDate }, endDatum: { gte: selectedDate } } } } })
    : await prisma.arzt.findMany({ where: { aktiv: true }, include: { sprechzeiten: true, abwesenheiten: { where: { startDatum: { lte: selectedDate }, endDatum: { gte: selectedDate } } } } });

  // Terminarten laden (online buchbare)
  const terminarten = await prisma.terminart.findMany({ where: { onlineBuchbar: true, aktiv: true } });

  // Bestehende Termine am selectedDate laden
  const buchungen = await prisma.termin.findMany({
    where: {
      datum: selectedDate,
      status: { notIn: ["abgesagt", "arzt_ausfall_betroffen"] },
    },
  });

  const slots: any[] = [];

  for (const arzt of aerzte) {
    // Arzt abwesend?
    const abwesend = arzt.abwesenheiten.length > 0;
    if (abwesend) continue;

    for (const sz of arzt.sprechzeiten) {
      if (sz.tag !== tag) continue;

      const [startH, startM] = sz.startzeit.split(":").map(Number);
      const [endH, endM] = sz.endzeit.split(":").map(Number);
      const startMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;

      for (const ta of terminarten) {
        const dauer = ta.defaultDauerMin;
        for (let t = startMin; t + dauer <= endMin; t += 15) {
          const slotStart = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
          const slotEndMin = t + dauer;
          const slotEnd = `${String(Math.floor(slotEndMin / 60)).padStart(2, "0")}:${String(slotEndMin % 60).padStart(2, "0")}`;

          // Kollision mit bestehenden Buchungen?
          const kollidiert = buchungen.some((b) => {
            if (b.arztId !== arzt.id || b.terminartId !== ta.id) return false;
            const [bSH, bSM] = b.startzeit.split(":").map(Number);
            const [bEH, bEM] = b.endzeit.split(":").map(Number);
            const bStart = bSH * 60 + bSM;
            const bEnd = bEH * 60 + bEM;
            return t < bEnd && t + dauer > bStart;
          });

          if (!kollidiert) {
            slots.push({
              arztId: arzt.id,
              arztName: arzt.name,
              terminartId: ta.id,
              terminartName: ta.name,
              datum,
              startzeit: slotStart,
              endzeit: slotEnd,
              dauer,
            });
          }
        }
      }
    }
  }

  // Bevorzugten Arzt priorisieren
  if (patientCode) {
    const patient = await prisma.patient.findUnique({ where: { patientCode: patientCode.toUpperCase() } });
    if (patient?.bevorzugterArztId) {
      slots.sort((a: any, b: any) => {
        if (a.arztId === patient.bevorzugterArztId && b.arztId !== patient.bevorzugterArztId) return -1;
        if (a.arztId !== patient.bevorzugterArztId && b.arztId === patient.bevorzugterArztId) return 1;
        return 0;
      });
    }
  }

  return NextResponse.json({ verfuegbar: true, termine: slots });
}
