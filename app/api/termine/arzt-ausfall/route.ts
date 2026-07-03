import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Prüfen, welche Termine von einem Ausfall betroffen wären
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const arztId = searchParams.get("arztId");
  const datum = searchParams.get("datum");

  if (!arztId || !datum) {
    return NextResponse.json({ error: "arztId und datum erforderlich" }, { status: 400 });
  }

  const terminDatum = new Date(datum + "T00:00:00Z");

  // Alle Termine des Arztes an dem Tag
  const termine = await prisma.termin.findMany({
    where: {
      arztId: parseInt(arztId),
      datum: terminDatum,
      status: { notIn: ["abgesagt", "arzt_ausfall_betroffen"] },
    },
    include: {
      patient: { select: { id: true, name: true, patientCode: true } },
      terminart: { select: { id: true, name: true, defaultDauerMin: true } },
    },
    orderBy: { startzeit: "asc" },
  });

  // Alternative Ärzte finden (andere aktive Ärzte am selben Tag)
  const andereAerzte = await prisma.arzt.findMany({
    where: {
      id: { not: parseInt(arztId) },
      aktiv: true,
      verfuegbarkeitsstatus: "verfuegbar",
    },
  });

  return NextResponse.json({ termine, alternativeAerzte: andereAerzte });
}

// POST: Arzt-Ausfall melden und Termine automatisch behandeln
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { arztId, datum, grund } = body;

    if (!arztId || !datum) {
      return NextResponse.json({ error: "arztId und datum erforderlich" }, { status: 400 });
    }

    const terminDatum = new Date(datum + "T00:00:00Z");

    // Abwesenheitsereignis anlegen
    await prisma.abwesenheitsereignis.create({
      data: {
        arztId: parseInt(arztId),
        typ: grund || "krankheit",
        startDatum: terminDatum,
        endDatum: terminDatum,
      },
    });

    // Arzt-Status aktualisieren
    await prisma.arzt.update({
      where: { id: parseInt(arztId) },
      data: { verfuegbarkeitsstatus: "abwesend" },
    });

    // Betroffene Termine finden
    const betroffeneTermine = await prisma.termin.findMany({
      where: {
        arztId: parseInt(arztId),
        datum: terminDatum,
        status: { notIn: ["abgesagt", "arzt_ausfall_betroffen"] },
      },
      include: {
        patient: { select: { id: true, name: true, patientCode: true } },
        terminart: { select: { name: true } },
      },
    });

    // Termine als "arzt_ausfall_betroffen" markieren + Benachrichtigungen
    for (const t of betroffeneTermine) {
      await prisma.termin.update({
        where: { id: t.id },
        data: { status: "arzt_ausfall_betroffen" },
      });

      await prisma.benachrichtigung.create({
        data: {
          patientId: t.patientId,
          bezugstyp: "termin",
          bezugsId: t.id,
          kanal: "telefon",
          typ: "absage",
          status: "geplant",
        },
      });
    }

    return NextResponse.json({
      success: true,
      betroffeneTermine: betroffeneTermine.length,
      patienten: betroffeneTermine.map((t) => ({
        patientName: t.patient.name,
        patientCode: t.patient.patientCode,
        startzeit: t.startzeit,
        terminart: t.terminart.name,
      })),
    });
  } catch (error) {
    console.error("Arzt-Ausfall-Fehler:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
