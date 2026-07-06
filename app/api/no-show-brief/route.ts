import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Alle versendeten Briefe (oder für einen Patienten)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const patientCode = searchParams.get("patientCode");

  const where: any = { bezugstyp: "no_show", typ: "no_show_warnung" };
  if (patientCode) {
    const patient = await prisma.patient.findUnique({ where: { patientCode: patientCode.toUpperCase() } });
    if (patient) where.patientId = patient.id;
    else return NextResponse.json({ briefe: [] });
  }

  const briefe = await prisma.benachrichtigung.findMany({
    where,
    include: { patient: { select: { name: true, patientCode: true } } },
    orderBy: { erstelltAm: "desc" },
    take: 50,
  });

  return NextResponse.json({ briefe });
}

// POST: Brief generieren und als versendet markieren
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientCode, noShowEreignisId } = body;

    if (!patientCode) return NextResponse.json({ error: "patientCode erforderlich" }, { status: 400 });

    const patient = await prisma.patient.findUnique({ where: { patientCode: patientCode.toUpperCase() } });
    if (!patient) return NextResponse.json({ error: "Patient nicht gefunden" }, { status: 404 });

    // Letzte No-Shows des Patienten
    const letzteNoShows = await prisma.noShowEreignis.findMany({
      where: { patientId: patient.id, zaehltFuerSperre: true },
      include: { termin: { select: { datum: true, startzeit: true, terminart: { select: { name: true } } } } },
      orderBy: { erfasstAm: "desc" },
      take: 3,
    });

    if (letzteNoShows.length === 0) {
      return NextResponse.json({ error: "Keine No-Shows für diesen Patienten" }, { status: 404 });
    }

    // Briefvorlage generieren
    const brief = {
      patient: { name: patient.name, patientCode: patient.patientCode, noShowZaehler: patient.noShowZaehler, sperrstatus: patient.sperrstatus },
      noShows: letzteNoShows.map((n) => ({
        datum: n.termin.datum.toISOString().split("T")[0],
        startzeit: n.termin.startzeit,
        terminart: n.termin.terminart.name,
        erfasstAm: n.erfasstAm.toISOString().split("T")[0],
      })),
      gesperrt: patient.sperrstatus === "online_gesperrt",
    };

    // Brief als Benachrichtigung dokumentieren
    await prisma.benachrichtigung.create({
      data: {
        patientId: patient.id,
        bezugstyp: "no_show",
        bezugsId: noShowEreignisId || letzteNoShows[0].id,
        kanal: "brief",
        typ: "no_show_warnung",
        status: "versendet",
        versendetAm: new Date(),
      },
    });

    return NextResponse.json({ success: true, brief });
  } catch (error) {
    console.error("Brief-Fehler:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
