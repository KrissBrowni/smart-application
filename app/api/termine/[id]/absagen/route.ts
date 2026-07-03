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
    const { patientCode } = body;

    if (isNaN(id)) return NextResponse.json({ error: "Ungültige ID" }, { status: 400 });

    const termin = await prisma.termin.findUnique({
      where: { id },
      include: { patient: { select: { patientCode: true } } },
    });

    if (!termin) return NextResponse.json({ error: "Termin nicht gefunden" }, { status: 404 });

    // Prüfen, ob Termin dem Patienten gehört
    if (termin.patient.patientCode !== patientCode?.toUpperCase()) {
      return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 });
    }

    if (termin.status === "abgesagt") {
      return NextResponse.json({ error: "Bereits abgesagt" }, { status: 409 });
    }

    // Termin absagen
    await prisma.termin.update({
      where: { id },
      data: { status: "abgesagt", storniertAm: new Date() },
    });

    // Benachrichtigung erzeugen, dass Absage bestätigt wurde
    await prisma.benachrichtigung.create({
      data: {
        patientId: termin.patientId,
        bezugstyp: "termin",
        bezugsId: id,
        kanal: "telefon",
        typ: "absage",
        status: "geplant",
      },
    });

    return NextResponse.json({ success: true, status: "abgesagt" });
  } catch (error) {
    console.error("Absage-Fehler:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
