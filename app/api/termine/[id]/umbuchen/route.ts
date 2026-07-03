import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const body = await request.json();
    const { patientCode, neueStartzeit, neuesDatum, arztId } = body;

    if (isNaN(id)) return NextResponse.json({ error: "Ungültige ID" }, { status: 400 });

    const termin = await prisma.termin.findUnique({
      where: { id },
      include: { patient: { select: { patientCode: true } } },
    });

    if (!termin) return NextResponse.json({ error: "Termin nicht gefunden" }, { status: 404 });

    if (termin.patient.patientCode !== patientCode?.toUpperCase()) {
      return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 });
    }

    const terminart = await prisma.terminart.findUnique({ where: { id: termin.terminartId } });
    if (!terminart?.onlineBuchbar) {
      return NextResponse.json({ error: "Diese Terminart kann nicht online umgebucht werden" }, { status: 400 });
    }

    const [startH, startM] = neueStartzeit.split(":").map(Number);
    const startMin = startH * 60 + startM;
    const endMin = startMin + terminart.defaultDauerMin;
    const endzeit = `${String(Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`;
    const terminDatum = new Date(neuesDatum + "T00:00:00Z");

    // Kollisionsprüfung
    const kollision = await prisma.termin.findFirst({
      where: {
        arztId: arztId || termin.arztId,
        terminartId: termin.terminartId,
        datum: terminDatum,
        startzeit: neueStartzeit,
        status: { notIn: ["abgesagt", "arzt_ausfall_betroffen"] },
        id: { not: id },
      },
    });

    if (kollision) {
      return NextResponse.json({ error: "Neuer Slot bereits belegt" }, { status: 409 });
    }

    // Umbuchen
    await prisma.termin.update({
      where: { id },
      data: {
        datum: terminDatum,
        startzeit: neueStartzeit,
        endzeit,
        arztId: arztId || termin.arztId,
        status: "verschoben",
      },
    });

    await prisma.benachrichtigung.create({
      data: {
        patientId: termin.patientId,
        bezugstyp: "termin",
        bezugsId: id,
        kanal: "telefon",
        typ: "erinnerung",
        status: "geplant",
      },
    });

    return NextResponse.json({ success: true, status: "verschoben" });
  } catch (error) {
    console.error("Umbuchungs-Fehler:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
