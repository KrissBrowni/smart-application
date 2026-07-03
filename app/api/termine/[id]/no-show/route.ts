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
    const { mfaId } = body;

    if (isNaN(id)) return NextResponse.json({ error: "Ungültige ID" }, { status: 400 });

    const termin = await prisma.termin.findUnique({ where: { id }, include: { patient: true } });
    if (!termin) return NextResponse.json({ error: "Termin nicht gefunden" }, { status: 404 });

    if (termin.status === "no_show") {
      return NextResponse.json({ error: "Bereits als No-Show markiert" }, { status: 409 });
    }

    // No-Show-Ereignis anlegen
    await prisma.noShowEreignis.create({
      data: {
        patientId: termin.patientId,
        terminId: id,
        zaehltFuerSperre: true,
      },
    });

    // Termin-Status updaten
    await prisma.termin.update({ where: { id }, data: { status: "no_show" } });

    // No-Show-Zähler erhöhen
    const patient = await prisma.patient.update({
      where: { id: termin.patientId },
      data: { noShowZaehler: { increment: 1 } },
    });

    // Bei 3 No-Shows: Sperre aktivieren
    if (patient.noShowZaehler >= 3) {
      await prisma.patient.update({
        where: { id: patient.id },
        data: { sperrstatus: "online_gesperrt" },
      });

      await prisma.patientensperre.create({
        data: {
          patientId: patient.id,
          grund: "drei_no_shows",
          aktiviertDurch: 0, // System
        },
      });
    }

    // Automatische Benachrichtigung: No-Show-Warnung
    await prisma.benachrichtigung.create({
      data: {
        patientId: patient.id,
        bezugstyp: "no_show",
        bezugsId: id,
        kanal: "telefon",
        typ: "no_show_warnung",
        status: "geplant",
      },
    });

    return NextResponse.json({
      success: true,
      noShowZaehler: patient.noShowZaehler,
      sperrstatus: patient.sperrstatus,
    });
  } catch (error) {
    console.error("No-Show-Fehler:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
